/*
 * Exportador MFV local, sem dependências e compatível com file://.
 *
 * Carregue mfv-template-data.js antes deste arquivo. API pública:
 *   MfvExporter.build({ projectName, scenarioLabel, activities, shift }) -> Uint8Array
 *   MfvExporter.verify(bytes, expectedActivities?, expectedShift?) -> relatório
 *   MfvExporter.download({ projectName, scenarioLabel, activities, shift }) -> metadados
 *
 * Cada atividade deve conter { description, durationSeconds }. O limite é de 10
 * atividades: o bloco EP!A20:B30 tem 11 linhas, mas o mapa da aba "MFV EP"
 * possui 10 caixas de processo (EP!A20:A29 e EP!B20:B29).
 *
 * O bloco `shift` é opcional e preenche o cabeçalho da aba EP:
 *   { startSeconds, endSeconds, pauseSeconds, lunchSeconds,
 *     monthlyDemandPieces, workingDaysPerMonth, operators }
 * Ele escreve apenas células de entrada (B5, C5, B6, C6, B7, B8, B11, F11, B41).
 * Bruto, Com Almoço, Segundos, Média, Peças/dia e Takt Time continuam sendo
 * calculados pelas fórmulas do modelo.
 *
 * build() só retorna depois de validar a estrutura ZIP, as 63 entradas do template,
 * EP!A20:B30, o cabeçalho gravado e a configuração de recálculo.
 */
(function attachMfvExporter(root) {
  "use strict";

  const LOCAL_FILE_SIGNATURE = 0x04034b50;
  const CENTRAL_FILE_SIGNATURE = 0x02014b50;
  const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
  const TARGET_SHEET_PATH = "xl/worksheets/sheet1.xml";
  const WORKBOOK_PATH = "xl/workbook.xml";
  const CONTENT_TYPES_PATH = "[Content_Types].xml";
  // O bloco EP!A20:B30 tem 11 linhas, mas o desenho do mapa na aba "MFV EP" possui 10
  // caixas de processo — elas leem EP!A20:A29 e EP!B20:B29. O limite acompanha o mapa,
  // para que nenhuma operação seja gravada na planilha e some do desenho.
  const MAX_ACTIVITIES = 10;
  // Todas as 11 linhas continuam sendo reescritas, para que nenhum texto do modelo
  // sobreviva nas posições não usadas.
  const TEMPLATE_SLOTS = 11;
  const MAX_DURATION_SECONDS = 360000000;
  const DAY_SECONDS = 86400;

  // Células de entrada do cabeçalho da aba EP, conferidas uma a uma contra o modelo
  // incorporado. Todas as vizinhas (Bruto, Com Almoço, Segundos, Média, Peças/dia, Takt
  // Time, Tempo de Processamento) são fórmulas e não podem ser sobrescritas.
  //
  // O Excel guarda hora do dia como fração de um dia: 07:15 vale 26100/86400.
  const SHIFT_CELLS = Object.freeze({
    weekStart: "B5", // Seg a Qui · Entrada
    weekEnd: "C5", // Seg a Qui · Saída
    fridayStart: "B6", // Sex · Entrada
    fridayEnd: "C6", // Sex · Saída
    pauseDuration: "B7", // Pausas/Dia
    lunchDuration: "B8", // Almoço
    monthlyDemand: "B11", // Demanda em peças/mês
    workingDays: "F11", // Dias/Mês
    operators: "B41", // Operadores — alimenta Produtividade EP, Ideal e Produção Diária
  });
  const UTF8_FLAG = 0x0800;
  const DATA_DESCRIPTOR_FLAG = 0x0008;
  const TEXT_ENCODER = new TextEncoder();
  const TEXT_DECODER = new TextDecoder("utf-8", { fatal: true });

  let crcTable = null;

  function embeddedTemplate() {
    const data = root.__MFV_TEMPLATE_DATA__;
    if (!data || typeof data.zipBase64 !== "string") {
      throw new Error("Dados do modelo MFV não foram carregados.");
    }
    // A contagem de entradas vem do próprio arquivo embutido, não de um número fixo:
    // trocar o modelo por uma versão nova não deve exigir mexer neste código.
    if (
      !data.sheet1XmlBase64 ||
      !data.workbookXmlBase64 ||
      !Number.isInteger(data.entryCount) ||
      data.entryCount < 1
    ) {
      throw new Error("Dados do modelo MFV estão incompletos ou incompatíveis.");
    }
    return data;
  }

  function decodeBase64(value) {
    const binary = root.atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  // Caracteres de controle não são representáveis em XML 1.0 e fariam o Excel recusar o
  // arquivo. Tabulação, quebra de linha e retorno de carro são permitidos e ficam.
  // A limpeza acontece na normalização para que o texto gravado e o texto conferido por
  // verify() sejam sempre o mesmo.
  function sanitizeCellText(value) {
    return value.replace(new RegExp("[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]", "g"), "");
  }

  function decodeText(bytes) {
    return TEXT_DECODER.decode(bytes);
  }

  function normalizeActivities(activities) {
    if (!Array.isArray(activities)) {
      throw new TypeError("Informe uma lista de atividades para exportar.");
    }
    if (activities.length > MAX_ACTIVITIES) {
      throw new RangeError(`O modelo MFV aceita no máximo ${MAX_ACTIVITIES} atividades.`);
    }

    return activities.map((activity, index) => {
      if (!activity || typeof activity !== "object" || Array.isArray(activity)) {
        throw new TypeError(`Atividade ${index + 1} inválida.`);
      }
      const description = sanitizeCellText(String(activity.description || "")).trim();
      if (!description) {
        throw new Error(`Informe a descrição da atividade ${index + 1}.`);
      }
      if (description.length > 32767) {
        throw new RangeError(`A descrição da atividade ${index + 1} excede o limite do Excel.`);
      }
      const durationSeconds = Number(activity.durationSeconds);
      if (
        !Number.isSafeInteger(durationSeconds) ||
        durationSeconds < 1 ||
        durationSeconds > MAX_DURATION_SECONDS
      ) {
        throw new RangeError(`Tempo inválido na atividade ${index + 1}. Use segundos inteiros positivos.`);
      }
      return { description, durationSeconds };
    });
  }

  function requireWholeSeconds(value, label) {
    const seconds = Number(value);
    if (!Number.isInteger(seconds) || seconds < 0 || seconds >= DAY_SECONDS) {
      throw new RangeError(`${label} deve ser um horário válido do dia.`);
    }
    return seconds;
  }

  function requireDurationSeconds(value, label) {
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds < 0 || seconds >= DAY_SECONDS) {
      throw new RangeError(`${label} deve ser uma duração menor que 24 horas.`);
    }
    return Math.round(seconds);
  }

  // Dados da jornada que alimentam o cabeçalho da aba EP. Tudo é opcional: sem este
  // bloco, o exportador escreve apenas as operações e deixa o cabeçalho como está.
  function normalizeShiftData(raw) {
    if (raw === undefined || raw === null) return null;
    if (typeof raw !== "object" || Array.isArray(raw)) {
      throw new TypeError("Dados da jornada inválidos.");
    }
    const startSeconds = requireWholeSeconds(raw.startSeconds, "O início do turno de segunda a quinta");
    const endSeconds = requireWholeSeconds(raw.endSeconds, "O fim do turno de segunda a quinta");
    if (startSeconds === endSeconds) {
      throw new RangeError("O início e o fim do turno de segunda a quinta precisam ser diferentes.");
    }
    const fridayStartSeconds = requireWholeSeconds(raw.fridayStartSeconds, "O início do turno de sexta");
    const fridayEndSeconds = requireWholeSeconds(raw.fridayEndSeconds, "O fim do turno de sexta");
    if (fridayStartSeconds === fridayEndSeconds) {
      throw new RangeError("O início e o fim do turno de sexta precisam ser diferentes.");
    }
    const monthlyDemandPieces =
      raw.monthlyDemandPieces === null || raw.monthlyDemandPieces === undefined
        ? null
        : (() => {
            const pieces = Number(raw.monthlyDemandPieces);
            if (!Number.isSafeInteger(pieces) || pieces < 1) {
              throw new RangeError("A demanda mensal deve ser um número inteiro positivo.");
            }
            return pieces;
          })();
    const workingDaysPerMonth = Number(raw.workingDaysPerMonth);
    if (!Number.isInteger(workingDaysPerMonth) || workingDaysPerMonth < 1 || workingDaysPerMonth > 31) {
      throw new RangeError("Os dias úteis por mês devem ficar entre 1 e 31.");
    }
    const operators =
      raw.operators === null || raw.operators === undefined
        ? null
        : (() => {
            const count = Number(raw.operators);
            if (!Number.isInteger(count) || count < 1 || count > 100000) {
              throw new RangeError("O número de operadores deve ser um inteiro positivo.");
            }
            return count;
          })();
    return {
      startSeconds,
      endSeconds,
      fridayStartSeconds,
      fridayEndSeconds,
      pauseSeconds: requireDurationSeconds(raw.pauseSeconds || 0, "O total de pausas"),
      lunchSeconds: requireDurationSeconds(raw.lunchSeconds || 0, "O almoço"),
      monthlyDemandPieces,
      workingDaysPerMonth,
      operators,
    };
  }

  function normalizeBuildOptions(options) {
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("Parâmetros de exportação inválidos.");
    }
    return {
      projectName: String(options.projectName || "Estudo").trim() || "Estudo",
      scenarioLabel: String(options.scenarioLabel || "Cenário").trim() || "Cenário",
      activities: normalizeActivities(options.activities),
      shift: normalizeShiftData(options.shift),
    };
  }

  function findEndOfCentralDirectory(bytes, view) {
    const minimumOffset = Math.max(0, bytes.length - 22 - 0xffff);
    for (let offset = bytes.length - 22; offset >= minimumOffset; offset -= 1) {
      if (view.getUint32(offset, true) !== END_OF_CENTRAL_DIRECTORY_SIGNATURE) continue;
      const commentLength = view.getUint16(offset + 20, true);
      if (offset + 22 + commentLength === bytes.length) return offset;
    }
    throw new Error("Diretório central do modelo MFV não foi encontrado.");
  }

  function parseZip(input) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes.length < 22) throw new Error("Arquivo XLSX truncado.");
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const eocdOffset = findEndOfCentralDirectory(bytes, view);
    const diskNumber = view.getUint16(eocdOffset + 4, true);
    const centralDisk = view.getUint16(eocdOffset + 6, true);
    const entriesOnDisk = view.getUint16(eocdOffset + 8, true);
    const entryCount = view.getUint16(eocdOffset + 10, true);
    const centralSize = view.getUint32(eocdOffset + 12, true);
    const centralOffset = view.getUint32(eocdOffset + 16, true);
    const eocdCommentLength = view.getUint16(eocdOffset + 20, true);

    if (diskNumber !== 0 || centralDisk !== 0 || entriesOnDisk !== entryCount) {
      throw new Error("Arquivos ZIP divididos em volumes não são suportados.");
    }
    if (entryCount === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) {
      throw new Error("ZIP64 não é suportado pelo exportador MFV.");
    }
    if (centralOffset + centralSize > eocdOffset) {
      throw new Error("Diretório central do XLSX está fora dos limites.");
    }

    const entries = [];
    let offset = centralOffset;
    for (let index = 0; index < entryCount; index += 1) {
      if (offset + 46 > bytes.length || view.getUint32(offset, true) !== CENTRAL_FILE_SIGNATURE) {
        throw new Error(`Entrada ZIP ${index + 1} inválida.`);
      }

      const versionMadeBy = view.getUint16(offset + 4, true);
      const versionNeeded = view.getUint16(offset + 6, true);
      const flags = view.getUint16(offset + 8, true);
      const method = view.getUint16(offset + 10, true);
      const modTime = view.getUint16(offset + 12, true);
      const modDate = view.getUint16(offset + 14, true);
      const checksum = view.getUint32(offset + 16, true);
      const compressedSize = view.getUint32(offset + 20, true);
      const uncompressedSize = view.getUint32(offset + 24, true);
      const nameLength = view.getUint16(offset + 28, true);
      const centralExtraLength = view.getUint16(offset + 30, true);
      const commentLength = view.getUint16(offset + 32, true);
      const diskStart = view.getUint16(offset + 34, true);
      const internalAttributes = view.getUint16(offset + 36, true);
      const externalAttributes = view.getUint32(offset + 38, true);
      const localOffset = view.getUint32(offset + 42, true);
      const centralEnd = offset + 46 + nameLength + centralExtraLength + commentLength;

      if (
        compressedSize === 0xffffffff ||
        uncompressedSize === 0xffffffff ||
        localOffset === 0xffffffff ||
        diskStart !== 0 ||
        centralEnd > bytes.length
      ) {
        throw new Error("O modelo contém uma entrada ZIP64 ou inválida.");
      }
      if ((flags & 0x0001) !== 0) throw new Error("Entradas ZIP criptografadas não são suportadas.");
      if (localOffset + 30 > bytes.length || view.getUint32(localOffset, true) !== LOCAL_FILE_SIGNATURE) {
        throw new Error(`Cabeçalho local da entrada ${index + 1} é inválido.`);
      }

      const nameBytes = bytes.slice(offset + 46, offset + 46 + nameLength);
      const name = decodeText(nameBytes);
      const centralExtra = bytes.slice(
        offset + 46 + nameLength,
        offset + 46 + nameLength + centralExtraLength,
      );
      const comment = bytes.slice(
        offset + 46 + nameLength + centralExtraLength,
        centralEnd,
      );
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const localExtraStart = localOffset + 30 + localNameLength;
      const dataStart = localExtraStart + localExtraLength;
      const dataEnd = dataStart + compressedSize;
      if (dataEnd > bytes.length) throw new Error(`Dados comprimidos de “${name}” estão truncados.`);

      entries.push({
        name,
        nameBytes,
        versionMadeBy,
        versionNeeded,
        flags: flags & ~DATA_DESCRIPTOR_FLAG,
        method,
        modTime,
        modDate,
        checksum,
        compressedSize,
        uncompressedSize,
        internalAttributes,
        externalAttributes,
        localExtra: bytes.slice(localExtraStart, localExtraStart + localExtraLength),
        centralExtra,
        comment,
        compressedData: bytes.slice(dataStart, dataEnd),
      });

      offset = centralEnd;
    }

    if (offset !== centralOffset + centralSize) {
      throw new Error("Tamanho do diretório central não corresponde às entradas do XLSX.");
    }

    return {
      entries,
      comment: bytes.slice(eocdOffset + 22, eocdOffset + 22 + eocdCommentLength),
    };
  }

  function getCrcTable() {
    if (crcTable) return crcTable;
    crcTable = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = (value & 1) !== 0 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      crcTable[index] = value >>> 0;
    }
    return crcTable;
  }

  function crc32(bytes) {
    const table = getCrcTable();
    let checksum = 0xffffffff;
    for (let index = 0; index < bytes.length; index += 1) {
      checksum = table[(checksum ^ bytes[index]) & 0xff] ^ (checksum >>> 8);
    }
    return (checksum ^ 0xffffffff) >>> 0;
  }

  function storedReplacement(entry, content) {
    const bytes = typeof content === "string" ? TEXT_ENCODER.encode(content) : content;
    return {
      ...entry,
      flags: entry.flags & UTF8_FLAG,
      method: 0,
      checksum: crc32(bytes),
      compressedSize: bytes.length,
      uncompressedSize: bytes.length,
      compressedData: bytes,
    };
  }

  function writeZip(packageData) {
    const { entries, comment } = packageData;
    if (entries.length > 0xffff || comment.length > 0xffff) {
      throw new Error("O pacote excede os limites do formato ZIP clássico.");
    }

    let localSize = 0;
    let centralSize = 0;
    for (const entry of entries) {
      if (
        entry.nameBytes.length > 0xffff ||
        entry.localExtra.length > 0xffff ||
        entry.centralExtra.length > 0xffff ||
        entry.comment.length > 0xffff
      ) {
        throw new Error(`Metadados ZIP de “${entry.name}” excedem o limite permitido.`);
      }
      localSize += 30 + entry.nameBytes.length + entry.localExtra.length + entry.compressedSize;
      centralSize += 46 + entry.nameBytes.length + entry.centralExtra.length + entry.comment.length;
    }
    if (localSize > 0xffffffff || centralSize > 0xffffffff || localSize + centralSize > 0xffffffff) {
      throw new Error("O pacote requer ZIP64, que não é suportado.");
    }

    const output = new Uint8Array(localSize + centralSize + 22 + comment.length);
    const view = new DataView(output.buffer);
    const localOffsets = [];
    let offset = 0;

    for (const entry of entries) {
      localOffsets.push(offset);
      view.setUint32(offset, LOCAL_FILE_SIGNATURE, true);
      view.setUint16(offset + 4, entry.versionNeeded, true);
      view.setUint16(offset + 6, entry.flags, true);
      view.setUint16(offset + 8, entry.method, true);
      view.setUint16(offset + 10, entry.modTime, true);
      view.setUint16(offset + 12, entry.modDate, true);
      view.setUint32(offset + 14, entry.checksum >>> 0, true);
      view.setUint32(offset + 18, entry.compressedSize, true);
      view.setUint32(offset + 22, entry.uncompressedSize, true);
      view.setUint16(offset + 26, entry.nameBytes.length, true);
      view.setUint16(offset + 28, entry.localExtra.length, true);
      offset += 30;
      output.set(entry.nameBytes, offset);
      offset += entry.nameBytes.length;
      output.set(entry.localExtra, offset);
      offset += entry.localExtra.length;
      output.set(entry.compressedData, offset);
      offset += entry.compressedSize;
    }

    const centralOffset = offset;
    entries.forEach((entry, index) => {
      view.setUint32(offset, CENTRAL_FILE_SIGNATURE, true);
      view.setUint16(offset + 4, entry.versionMadeBy, true);
      view.setUint16(offset + 6, entry.versionNeeded, true);
      view.setUint16(offset + 8, entry.flags, true);
      view.setUint16(offset + 10, entry.method, true);
      view.setUint16(offset + 12, entry.modTime, true);
      view.setUint16(offset + 14, entry.modDate, true);
      view.setUint32(offset + 16, entry.checksum >>> 0, true);
      view.setUint32(offset + 20, entry.compressedSize, true);
      view.setUint32(offset + 24, entry.uncompressedSize, true);
      view.setUint16(offset + 28, entry.nameBytes.length, true);
      view.setUint16(offset + 30, entry.centralExtra.length, true);
      view.setUint16(offset + 32, entry.comment.length, true);
      view.setUint16(offset + 34, 0, true);
      view.setUint16(offset + 36, entry.internalAttributes, true);
      view.setUint32(offset + 38, entry.externalAttributes >>> 0, true);
      view.setUint32(offset + 42, localOffsets[index], true);
      offset += 46;
      output.set(entry.nameBytes, offset);
      offset += entry.nameBytes.length;
      output.set(entry.centralExtra, offset);
      offset += entry.centralExtra.length;
      output.set(entry.comment, offset);
      offset += entry.comment.length;
    });

    const actualCentralSize = offset - centralOffset;
    view.setUint32(offset, END_OF_CENTRAL_DIRECTORY_SIGNATURE, true);
    view.setUint16(offset + 4, 0, true);
    view.setUint16(offset + 6, 0, true);
    view.setUint16(offset + 8, entries.length, true);
    view.setUint16(offset + 10, entries.length, true);
    view.setUint32(offset + 12, actualCentralSize, true);
    view.setUint32(offset + 16, centralOffset, true);
    view.setUint16(offset + 20, comment.length, true);
    offset += 22;
    output.set(comment, offset);
    return output;
  }

  function escapeXmlText(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function unescapeXmlText(value) {
    return value
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&amp;/g, "&");
  }

  function cellPattern(reference, global = false) {
    const escaped = reference.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(
      `<c\\b(?=[^>]*\\br="${escaped}")(?:[^>]*\\/>|[^>]*>[\\s\\S]*?<\\/c>)`,
      global ? "g" : "",
    );
  }

  function findCellXml(xml, reference) {
    const matches = xml.match(cellPattern(reference, true));
    if (!matches || matches.length !== 1) {
      throw new Error(`A célula EP!${reference} não foi encontrada exatamente uma vez no modelo.`);
    }
    return matches[0];
  }

  function cellStyle(cellXml, reference) {
    const match = cellXml.match(/\bs="([^"]+)"/);
    if (!match) throw new Error(`A célula EP!${reference} não possui o estilo esperado.`);
    return match[1];
  }

  function replaceCellXml(xml, reference, replacement) {
    findCellXml(xml, reference);
    // A substituição precisa ser uma função. Com uma string, o JavaScript interpreta
    // "$&", "$`" e "$'" dentro dela como padrões especiais, e uma descrição contendo
    // esses caracteres corrompia o XML gerado.
    return xml.replace(cellPattern(reference), () => replacement);
  }

  function dayFraction(seconds) {
    return seconds / DAY_SECONDS;
  }

  // O modelo calcula o turno bruto como Saída menos Entrada. Num turno noturno, que
  // termina no dia seguinte, essa conta daria negativo. Somar um dia à saída é a forma
  // padrão de representar isso no Excel: o formato de hora continua exibindo "06:00",
  // mas a subtração passa a devolver a duração correta.
  function endFractionFor(startSeconds, endSeconds) {
    return dayFraction(endSeconds) + (endSeconds > startSeconds ? 0 : 1);
  }

  function numericCellXml(xml, reference, value) {
    const style = cellStyle(findCellXml(xml, reference), reference);
    return `<c r="${reference}" s="${style}"><v>${value}</v></c>`;
  }

  function blankCellXml(xml, reference) {
    const style = cellStyle(findCellXml(xml, reference), reference);
    return `<c r="${reference}" s="${style}"/>`;
  }

  // Preenche o cabeçalho da aba EP com a jornada e a demanda do estudo. Só as células de
  // entrada são tocadas; Bruto, Com Almoço, Segundos, Média, Peças/dia e Takt Time
  // continuam sendo calculados pelas fórmulas do próprio modelo.
  function patchShiftXml(templateXml, shift) {
    if (!shift) return templateXml;
    let xml = templateXml;
    const write = (reference, value) => {
      const replacement =
        value === null ? blankCellXml(xml, reference) : numericCellXml(xml, reference, value);
      xml = replaceCellXml(xml, reference, replacement);
    };
    write(SHIFT_CELLS.weekStart, dayFraction(shift.startSeconds));
    write(SHIFT_CELLS.weekEnd, endFractionFor(shift.startSeconds, shift.endSeconds));
    write(SHIFT_CELLS.fridayStart, dayFraction(shift.fridayStartSeconds));
    write(SHIFT_CELLS.fridayEnd, endFractionFor(shift.fridayStartSeconds, shift.fridayEndSeconds));
    write(SHIFT_CELLS.pauseDuration, dayFraction(shift.pauseSeconds));
    write(SHIFT_CELLS.lunchDuration, dayFraction(shift.lunchSeconds));
    // Demanda em branco fica em branco na planilha: zero seria um valor informado.
    write(SHIFT_CELLS.monthlyDemand, shift.monthlyDemandPieces);
    write(SHIFT_CELLS.workingDays, shift.workingDaysPerMonth);
    // B41 alimenta Produtividade EP, Produtividade Ideal e Produção Diária EP. Sem ela,
    // os três indicadores do modelo aparecem como #DIV/0!.
    write(SHIFT_CELLS.operators, shift.operators);
    return xml;
  }

  function shiftValues(xml) {
    const read = (reference) => {
      const match = findCellXml(xml, reference).match(/<v>([^<]*)<\/v>/);
      return match ? Number(match[1]) : null;
    };
    return {
      weekStart: read(SHIFT_CELLS.weekStart),
      weekEnd: read(SHIFT_CELLS.weekEnd),
      fridayStart: read(SHIFT_CELLS.fridayStart),
      fridayEnd: read(SHIFT_CELLS.fridayEnd),
      pauseDuration: read(SHIFT_CELLS.pauseDuration),
      lunchDuration: read(SHIFT_CELLS.lunchDuration),
      monthlyDemand: read(SHIFT_CELLS.monthlyDemand),
      workingDays: read(SHIFT_CELLS.workingDays),
      operators: read(SHIFT_CELLS.operators),
    };
  }

  function patchWorksheetXml(templateXml, activities) {
    let xml = templateXml;
    for (let slot = 0; slot < TEMPLATE_SLOTS; slot += 1) {
      const row = 20 + slot;
      const descriptionReference = `A${row}`;
      const durationReference = `B${row}`;
      const descriptionStyle = cellStyle(findCellXml(xml, descriptionReference), descriptionReference);
      const durationStyle = cellStyle(findCellXml(xml, durationReference), durationReference);
      const activity = activities[slot];
      // As caixas do mapa são fórmulas diretas do tipo =EP!A25. Uma célula vazia faz o
      // Excel devolver 0, e o mapa entregue ao cliente aparecia com caixas chamadas "0" e
      // tempo 0. Gravar texto vazio faz a fórmula devolver "" e a caixa fica em branco.
      const descriptionCell = `<c r="${descriptionReference}" s="${descriptionStyle}" t="inlineStr"><is><t xml:space="preserve">${
        activity ? escapeXmlText(activity.description) : ""
      }</t></is></c>`;
      const durationCell = activity
        ? `<c r="${durationReference}" s="${durationStyle}"><v>${activity.durationSeconds}</v></c>`
        : `<c r="${durationReference}" s="${durationStyle}" t="inlineStr"><is><t xml:space="preserve"></t></is></c>`;
      xml = replaceCellXml(xml, descriptionReference, descriptionCell);
      xml = replaceCellXml(xml, durationReference, durationCell);
    }
    return xml;
  }

  function patchWorkbookXml(templateXml) {
    const pattern = /<calcPr\b[^>]*(?:\/>|>[\s\S]*?<\/calcPr>)/;
    if (!pattern.test(templateXml)) throw new Error("Configuração de cálculo não encontrada no modelo MFV.");
    return templateXml.replace(
      pattern,
      '<calcPr calcId="0" calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>',
    );
  }

  function entryByName(entries, name) {
    const found = entries.filter((entry) => entry.name === name);
    if (found.length !== 1) throw new Error(`A entrada “${name}” não foi encontrada exatamente uma vez.`);
    return found[0];
  }

  function worksheetValues(xml) {
    const values = [];
    for (let slot = 0; slot < TEMPLATE_SLOTS; slot += 1) {
      const row = 20 + slot;
      const descriptionReference = `A${row}`;
      const durationReference = `B${row}`;
      const descriptionCell = findCellXml(xml, descriptionReference);
      const durationCell = findCellXml(xml, durationReference);
      const textNodes = [...descriptionCell.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)];
      const description = textNodes.map((match) => unescapeXmlText(match[1])).join("");
      const numberMatch = durationCell.match(/<v>([^<]+)<\/v>/);
      // Posições sem atividade guardam texto vazio em vez de zero, para que as caixas do
      // mapa fiquem em branco. Para efeito de conferência, elas valem 0 segundos.
      const isBlankDuration = !numberMatch && /t="inlineStr"/.test(durationCell);
      const durationSeconds = numberMatch ? Number(numberMatch[1]) : isBlankDuration ? 0 : NaN;
      values.push({ description, durationSeconds });
    }
    return values;
  }

  function verify(input, expectedActivities, expectedShift) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (
      bytes.length < 4 ||
      bytes[0] !== 0x50 ||
      bytes[1] !== 0x4b ||
      bytes[2] !== 0x03 ||
      bytes[3] !== 0x04
    ) {
      throw new Error("O arquivo gerado não possui a assinatura ZIP esperada.");
    }

    const data = embeddedTemplate();
    const packageData = parseZip(bytes);
    if (packageData.entries.length !== data.entryCount) {
      throw new Error(`O XLSX gerado deveria conter ${data.entryCount} entradas.`);
    }
    const names = new Set(packageData.entries.map((entry) => entry.name));
    if (names.size !== packageData.entries.length) throw new Error("O XLSX gerado contém entradas duplicadas.");
    for (const required of [CONTENT_TYPES_PATH, WORKBOOK_PATH, TARGET_SHEET_PATH]) {
      if (!names.has(required)) throw new Error(`A entrada obrigatória “${required}” está ausente.`);
    }

    for (const entry of packageData.entries) {
      if (entry.method === 0 && crc32(entry.compressedData) !== entry.checksum) {
        throw new Error(`Falha de integridade CRC32 na entrada “${entry.name}”.`);
      }
    }

    const sheetEntry = entryByName(packageData.entries, TARGET_SHEET_PATH);
    const workbookEntry = entryByName(packageData.entries, WORKBOOK_PATH);
    if (sheetEntry.method !== 0 || workbookEntry.method !== 0) {
      throw new Error("Os XMLs modificados não estão no modo de armazenamento esperado.");
    }
    const sheetXml = decodeText(sheetEntry.compressedData);
    const workbookXml = decodeText(workbookEntry.compressedData);
    const values = worksheetValues(sheetXml);
    const sourceSheetXml = decodeText(decodeBase64(data.sheet1XmlBase64));

    for (let slot = 0; slot < TEMPLATE_SLOTS; slot += 1) {
      const row = 20 + slot;
      for (const column of ["A", "B"]) {
        const reference = `${column}${row}`;
        const expectedStyle = cellStyle(findCellXml(sourceSheetXml, reference), reference);
        const actualStyle = cellStyle(findCellXml(sheetXml, reference), reference);
        if (actualStyle !== expectedStyle) {
          throw new Error(`O estilo de EP!${reference} não foi preservado.`);
        }
      }
    }

    if (expectedActivities !== undefined) {
      const normalized = normalizeActivities(expectedActivities);
      for (let slot = 0; slot < TEMPLATE_SLOTS; slot += 1) {
        const expected = normalized[slot] || { description: "", durationSeconds: 0 };
        const actual = values[slot];
        if (
          actual.description !== expected.description ||
          actual.durationSeconds !== expected.durationSeconds
        ) {
          throw new Error(`Os dados gravados em EP!A${20 + slot}:B${20 + slot} não correspondem ao estudo.`);
        }
      }
    }

    if (expectedShift !== undefined && expectedShift !== null) {
      const shift = normalizeShiftData(expectedShift);
      const written = shiftValues(sheetXml);
      const expected = {
        weekStart: dayFraction(shift.startSeconds),
        weekEnd: endFractionFor(shift.startSeconds, shift.endSeconds),
        fridayStart: dayFraction(shift.fridayStartSeconds),
        fridayEnd: endFractionFor(shift.fridayStartSeconds, shift.fridayEndSeconds),
        pauseDuration: dayFraction(shift.pauseSeconds),
        lunchDuration: dayFraction(shift.lunchSeconds),
        monthlyDemand: shift.monthlyDemandPieces,
        workingDays: shift.workingDaysPerMonth,
        operators: shift.operators,
      };
      for (const [key, value] of Object.entries(expected)) {
        if (written[key] !== value) {
          throw new Error(`O valor gravado em EP!${SHIFT_CELLS[key]} não corresponde ao estudo.`);
        }
      }
    }

    const calcPr = workbookXml.match(/<calcPr\b[^>]*\/>/);
    if (
      !calcPr ||
      !/\bcalcMode="auto"/.test(calcPr[0]) ||
      !/\bfullCalcOnLoad="1"/.test(calcPr[0]) ||
      !/\bforceFullCalc="1"/.test(calcPr[0])
    ) {
      throw new Error("O recálculo automático não foi configurado corretamente.");
    }

    return Object.freeze({
      valid: true,
      entryCount: packageData.entries.length,
      byteLength: bytes.length,
      values: Object.freeze(values.map((value) => Object.freeze({ ...value }))),
      shift: Object.freeze(shiftValues(sheetXml)),
      recalculationOnOpen: true,
      templateSha256: data.sha256,
    });
  }

  function build(options) {
    const normalized = normalizeBuildOptions(options);
    const data = embeddedTemplate();
    const packageData = parseZip(decodeBase64(data.zipBase64));
    if (packageData.entries.length !== data.entryCount) {
      throw new Error("O modelo MFV incorporado possui uma quantidade inesperada de entradas.");
    }

    const sheetXml = patchShiftXml(
      patchWorksheetXml(decodeText(decodeBase64(data.sheet1XmlBase64)), normalized.activities),
      normalized.shift,
    );
    const workbookXml = patchWorkbookXml(decodeText(decodeBase64(data.workbookXmlBase64)));
    packageData.entries = packageData.entries.map((entry) => {
      if (entry.name === TARGET_SHEET_PATH) return storedReplacement(entry, sheetXml);
      if (entry.name === WORKBOOK_PATH) return storedReplacement(entry, workbookXml);
      return entry;
    });

    const output = writeZip(packageData);
    verify(output, normalized.activities, normalized.shift);
    return output;
  }

  function fileSafeName(value, fallback) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;
  }

  function download(options) {
    if (!root.document || !root.URL || typeof root.URL.createObjectURL !== "function") {
      throw new Error("O download só pode ser iniciado em um navegador.");
    }
    const normalized = normalizeBuildOptions(options);
    const bytes = build(normalized);
    const verification = verify(bytes, normalized.activities, normalized.shift);
    const fileName = `${fileSafeName(normalized.projectName, "estudo")}-${fileSafeName(
      normalized.scenarioLabel,
      "cenario",
    )}-mfv.xlsx`;
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = root.URL.createObjectURL(blob);
    const link = root.document.createElement("a");
    link.href = url;
    link.download = fileName;
    root.document.body.appendChild(link);
    link.click();
    link.remove();
    root.setTimeout(() => root.URL.revokeObjectURL(url), 1000);
    return Object.freeze({ fileName, byteLength: bytes.length, verification });
  }

  root.MfvExporter = Object.freeze({
    build,
    verify,
    download,
    maxActivities: MAX_ACTIVITIES,
  });
})(typeof window !== "undefined" ? window : globalThis);
