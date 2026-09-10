(function () {
  "use strict";

  const STORAGE_KEY = "exata.trabalhoPadronizado.v1";
  const VIDEO_POSITIONS_KEY = "exata.trabalhoPadronizado.videoPositions";
  const MAX_VIDEOS = 30;
  const SCHEMA_VERSION = 4;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const DAY_SECONDS = 24 * 60 * 60;
  const MAX_ACTIVITIES = 500;
  const MAX_BREAKS = 30;
  const MAX_OPERATORS = 100000;
  const MIN_UNITS_PER_CYCLE = 0.01;
  const MAX_UNITS_PER_CYCLE = 1000000000;
  const MAX_PIECES = 1000000000000;

  const CLASSIFICATIONS = Object.freeze({
    agrega: {
      label: "Agrega",
      short: "A",
      color: "#34C759",
      textColor: "#1D1D1F",
    },
    semiagrega: {
      label: "Semiagrega",
      short: "S",
      color: "#FF9F0A",
      textColor: "#4A3000",
    },
    "nao-agrega": {
      label: "Não agrega",
      short: "N",
      color: "#FF3B30",
      textColor: "#1D1D1F",
    },
  });

  const SCENARIOS = Object.freeze({
    current: { label: "Atual", kicker: "CENÁRIO ATUAL", color: "#5E5CE6" },
    proposed: { label: "Proposto", kicker: "CENÁRIO PROPOSTO", color: "#007AFF" },
  });

  const ICONS = Object.freeze({
    up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l10.7-10.7a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14.5 7.5 3 3"/></svg>',
    duplicate:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    delete:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>',
  });

  const numberFormatter = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const productionFormatter = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  const percentFormatter = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  const elements = {
    saveStatus: document.getElementById("saveStatus"),
    helpButton: document.getElementById("helpButton"),
    helpDialog: document.getElementById("helpDialog"),
    closeHelpButton: document.getElementById("closeHelpButton"),
    moreButton: document.getElementById("moreButton"),
    fileMenu: document.getElementById("fileMenu"),
    importInput: document.getElementById("importInput"),
    studyName: document.getElementById("studyName"),
    shiftStart: document.getElementById("shiftStart"),
    shiftEnd: document.getElementById("shiftEnd"),
    fridayStart: document.getElementById("fridayStart"),
    fridayEnd: document.getElementById("fridayEnd"),
    operatorCount: document.getElementById("operatorCount"),
    monthlyDemand: document.getElementById("monthlyDemand"),
    workingDays: document.getElementById("workingDays"),
    shiftsPerDay: document.getElementById("shiftsPerDay"),
    actualPieces: document.getElementById("actualPieces"),
    addBreakButton: document.getElementById("addBreakButton"),
    breaksEmpty: document.getElementById("breaksEmpty"),
    breakList: document.getElementById("breakList"),
    grossShiftSummary: document.getElementById("grossShiftSummary"),
    breakDurationSummary: document.getElementById("breakDurationSummary"),
    grossFridaySummary: document.getElementById("grossFridaySummary"),
    availableShiftSummary: document.getElementById("availableShiftSummary"),
    tabs: Array.from(document.querySelectorAll("[data-view]")),
    workspace: document.getElementById("workspace"),
    videoAnalysisButton: document.getElementById("videoAnalysisButton"),
    copyScenarioButton: document.getElementById("copyScenarioButton"),
    printButton: document.getElementById("printButton"),
    exportButton: document.getElementById("exportButton"),
    importButton: document.getElementById("importButton"),
    mfvExportButton: document.getElementById("mfvExportButton"),
    printDialog: document.getElementById("printDialog"),
    cancelPrintButton: document.getElementById("cancelPrintButton"),
    confirmPrintButton: document.getElementById("confirmPrintButton"),
    printReport: document.getElementById("printReport"),
    printReportContent: document.getElementById("printReportContent"),
    kpiCurrentCycle: document.getElementById("kpiCurrentCycle"),
    kpiProposedCycle: document.getElementById("kpiProposedCycle"),
    kpiCurrentActivities: document.getElementById("kpiCurrentActivities"),
    kpiProposedActivities: document.getElementById("kpiProposedActivities"),
    kpiCurrentProduction: document.getElementById("kpiCurrentProduction"),
    kpiProposedProduction: document.getElementById("kpiProposedProduction"),
    kpiCurrentPerCycle: document.getElementById("kpiCurrentPerCycle"),
    kpiProposedPerCycle: document.getElementById("kpiProposedPerCycle"),
    taktCard: document.getElementById("taktCard"),
    kpiTakt: document.getElementById("kpiTakt"),
    kpiTaktDetail: document.getElementById("kpiTaktDetail"),
    actualProductionCard: document.getElementById("actualProductionCard"),
    kpiActualProduction: document.getElementById("kpiActualProduction"),
    kpiActualCoverage: document.getElementById("kpiActualCoverage"),
    gainCard: document.getElementById("gainCard"),
    kpiGain: document.getElementById("kpiGain"),
    kpiGainPercent: document.getElementById("kpiGainPercent"),
    cycleReductionCard: document.getElementById("cycleReductionCard"),
    kpiCycleReduction: document.getElementById("kpiCycleReduction"),
    kpiCycleDelta: document.getElementById("kpiCycleDelta"),
    editorPanel: document.getElementById("editorPanel"),
    comparisonPanel: document.getElementById("comparisonPanel"),
    scenarioKicker: document.getElementById("scenarioKicker"),
    scenarioTitle: document.getElementById("scenarioTitle"),
    clearScenarioButton: document.getElementById("clearScenarioButton"),
    resequenceButton: document.getElementById("resequenceButton"),
    unitsPerCycle: document.getElementById("unitsPerCycle"),
    availableTimeMini: document.getElementById("availableTimeMini"),
    activityForm: document.getElementById("activityForm"),
    formTitle: document.getElementById("formTitle"),
    cancelEditButton: document.getElementById("cancelEditButton"),
    activityDescription: document.getElementById("activityDescription"),
    activityStart: document.getElementById("activityStart"),
    activityDuration: document.getElementById("activityDuration"),
    activityEnd: document.getElementById("activityEnd"),
    durationVideoSource: document.getElementById("durationVideoSource"),
    activityClassification: document.getElementById("activityClassification"),
    descriptionError: document.getElementById("descriptionError"),
    startError: document.getElementById("startError"),
    durationError: document.getElementById("durationError"),
    endError: document.getElementById("endError"),
    submitActivityButton: document.getElementById("submitActivityButton"),
    activityListSummary: document.getElementById("activityListSummary"),
    emptyList: document.getElementById("emptyList"),
    loadExampleButton: document.getElementById("loadExampleButton"),
    activityList: document.getElementById("activityList"),
    comparisonCallout: document.getElementById("comparisonCallout"),
    comparisonHeadline: document.getElementById("comparisonHeadline"),
    comparisonDescription: document.getElementById("comparisonDescription"),
    comparisonTableBody: document.getElementById("comparisonTableBody"),
    timelineKicker: document.getElementById("timelineKicker"),
    timelineTitle: document.getElementById("timelineTitle"),
    timelineSubtitle: document.getElementById("timelineSubtitle"),
    timelineContent: document.getElementById("timelineContent"),
    timelineAccessibleSummary: document.getElementById("timelineAccessibleSummary"),
    classificationSummary: document.getElementById("classificationSummary"),
    videoWorkspace: document.getElementById("videoWorkspace"),
    timelinePanel: document.getElementById("timelinePanel"),
    videoLibraryList: document.getElementById("videoLibraryList"),
    videoLibraryEmpty: document.getElementById("videoLibraryEmpty"),
    addVideosButton: document.getElementById("addVideosButton"),
    videoDestination: document.getElementById("videoDestination"),
    videoPlayerSection: document.getElementById("videoPlayerSection"),
    videoCapturePanel: document.getElementById("videoCapturePanel"),
    videoInput: document.getElementById("videoInput"),
    selectVideoButton: document.getElementById("selectVideoButton"),
    changeVideoButton: document.getElementById("changeVideoButton"),
    removeVideoButton: document.getElementById("removeVideoButton"),
    videoEmptyState: document.getElementById("videoEmptyState"),
    videoLoadedState: document.getElementById("videoLoadedState"),
    videoPlayer: document.getElementById("videoPlayer"),
    videoShortcutArea: document.getElementById("videoShortcutArea"),
    videoFileName: document.getElementById("videoFileName"),
    videoFileDetails: document.getElementById("videoFileDetails"),
    videoCurrentTime: document.getElementById("videoCurrentTime"),
    videoDuration: document.getElementById("videoDuration"),
    videoFrameNumber: document.getElementById("videoFrameNumber"),
    videoFps: document.getElementById("videoFps"),
    videoFpsError: document.getElementById("videoFpsError"),
    frameBackButton: document.getElementById("frameBackButton"),
    frameForwardButton: document.getElementById("frameForwardButton"),
    videoQuickStartButton: document.getElementById("videoQuickStartButton"),
    videoQuickEndButton: document.getElementById("videoQuickEndButton"),
    videoStartValue: document.getElementById("videoStartValue"),
    videoEndValue: document.getElementById("videoEndValue"),
    videoIntervalExact: document.getElementById("videoIntervalExact"),
    videoIntervalRounded: document.getElementById("videoIntervalRounded"),
    videoMarkStartButton: document.getElementById("videoMarkStartButton"),
    videoMarkEndButton: document.getElementById("videoMarkEndButton"),
    videoUseIntervalButton: document.getElementById("videoUseIntervalButton"),
    videoClearMarksButton: document.getElementById("videoClearMarksButton"),
    videoStatus: document.getElementById("videoStatus"),
    videoError: document.getElementById("videoError"),
    toast: document.getElementById("toast"),
    toastMessage: document.getElementById("toastMessage"),
    toastAction: document.getElementById("toastAction"),
  };

  let activeView = "current";
  let editingId = null;
  let draggedId = null;
  let saveTimer = null;
  let toastTimer = null;
  let loadWarning = "";
  let storageAvailable = true;
  let webMcpLifecycle = null;
  let pendingVideoSource = null;
  let videoObjectUrl = null;
  let videoFile = null;
  let videoReady = false;
  let videoStartSeconds = null;
  let videoEndSeconds = null;
  let videoFrameRequestId = null;
  let videoSeekPending = false;
  let videoLoadPending = false;
  let videoLoadGeneration = 0;
  let videoIntervalTransferred = false;
  // Biblioteca de vídeos da sessão. Os arquivos não podem ser gravados pelo navegador, mas
  // a posição de cada um fica registrada e é reencontrada pelo nome, tamanho e data.
  let videoLibrary = [];
  let activeVideoId = null;
  let videoResumeSeconds = 0;
  let videoDestination = "current";
  let videoPositions = loadVideoPositions();
  let state = loadState();

  init();

  function init() {
    bindEvents();
    syncGlobalInputs();
    renderVideoLibrary();
    renderAll();
    // O HTML traz "00:00:00" fixo no campo Início. Sem esta chamada, abrir um estudo já
    // salvo deixava a sugestão em zero e a próxima atividade nascia sobre a primeira.
    resetForm();
    exposeTestApi();
    registerWebMcpTools();

    if (!storageAvailable) {
      setSaveStatus("error", "Sessão sem salvamento");
    }

    if (loadWarning) {
      window.setTimeout(() => showToast(loadWarning, { error: true, duration: 7000 }), 150);
    }
  }

  function createDefaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      projectName: "Novo estudo",
      settings: {
        // Turno de segunda a quinta.
        shiftStartSeconds: 8 * 60 * 60,
        shiftEndSeconds: 16 * 60 * 60,
        // Turno de sexta, normalmente mais curto.
        fridayStartSeconds: 8 * 60 * 60,
        fridayEndSeconds: 16 * 60 * 60,
        breaks: [],
        monthlyDemandPieces: null,
        workingDaysPerMonth: 22,
        shiftsPerDay: 1,
        actualPiecesProduced: null,
        operatorCount: null,
      },
      scenarios: {
        current: { unitsPerCycle: 1, activities: [] },
        proposed: { unitsPerCycle: 1, activities: [] },
      },
      updatedAt: new Date().toISOString(),
    };
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      storageAvailable = canUseLocalStorage();
      loadWarning = storageAvailable
        ? "O conteúdo salvo estava inválido. Um estudo vazio foi aberto sem alterar outros dados do navegador."
        : "Este navegador bloqueou o armazenamento local. O estudo funcionará apenas durante esta sessão.";
      return createDefaultState();
    }
  }

  function canUseLocalStorage() {
    const probe = `${STORAGE_KEY}.probe`;
    try {
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function normalizeState(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error("Estrutura de dados inválida.");
    }
    const sourceVersion = Number(raw.schemaVersion);
    if (![1, 2, 3, SCHEMA_VERSION].includes(sourceVersion)) {
      throw new Error("Versão de arquivo incompatível.");
    }

    const normalized = createDefaultState();
    normalized.projectName = sanitizeProjectName(raw.projectName);

    const settings = raw.settings;
    if (!settings || typeof settings !== "object") {
      throw new Error("Parâmetros de produção ausentes.");
    }
    if (sourceVersion < 3) {
      const legacyShiftSeconds = requireInteger(settings.shiftSeconds, 1, 360000000, "Tempo de turno");
      const migratedDuration = Math.min(legacyShiftSeconds, DAY_SECONDS - 1);
      normalized.settings.shiftStartSeconds = 8 * 60 * 60;
      normalized.settings.shiftEndSeconds = (normalized.settings.shiftStartSeconds + migratedDuration) % DAY_SECONDS;
      normalized.settings.fridayStartSeconds = normalized.settings.shiftStartSeconds;
      normalized.settings.fridayEndSeconds = normalized.settings.shiftEndSeconds;
      normalized.settings.breaks = [];
    } else {
      normalized.settings.shiftStartSeconds = requireInteger(
        settings.shiftStartSeconds,
        0,
        DAY_SECONDS - 1,
        "Início do turno",
      );
      normalized.settings.shiftEndSeconds = requireInteger(
        settings.shiftEndSeconds,
        0,
        DAY_SECONDS - 1,
        "Fim do turno",
      );
      if (normalized.settings.shiftStartSeconds === normalized.settings.shiftEndSeconds) {
        throw new Error("O início e o fim do turno de segunda a quinta precisam ser diferentes.");
      }
      // Estudos da versão 3 tinham um turno só. A sexta passa a repetir esse turno, que é
      // o comportamento equivalente ao que o arquivo antigo representava.
      normalized.settings.fridayStartSeconds =
        settings.fridayStartSeconds === undefined
          ? normalized.settings.shiftStartSeconds
          : requireInteger(settings.fridayStartSeconds, 0, DAY_SECONDS - 1, "Início do turno de sexta");
      normalized.settings.fridayEndSeconds =
        settings.fridayEndSeconds === undefined
          ? normalized.settings.shiftEndSeconds
          : requireInteger(settings.fridayEndSeconds, 0, DAY_SECONDS - 1, "Fim do turno de sexta");
      if (normalized.settings.fridayStartSeconds === normalized.settings.fridayEndSeconds) {
        throw new Error("O início e o fim do turno de sexta precisam ser diferentes.");
      }
      if (!Array.isArray(settings.breaks) || settings.breaks.length > MAX_BREAKS) {
        throw new Error("Lista de intervalos do turno inválida.");
      }
      const seenBreakIds = new Set();
      normalized.settings.breaks = settings.breaks.map((item, index) => {
        const normalizedBreak = normalizeBreak(item, index);
        while (seenBreakIds.has(normalizedBreak.id)) normalizedBreak.id = generateId();
        seenBreakIds.add(normalizedBreak.id);
        return normalizedBreak;
      });
    }
    // A disponibilidade operacional e o critério de produção deixaram de existir na versão
    // 4: o tempo indisponível é exatamente o dos intervalos, e a produção é sempre a
    // estimativa contínua. Arquivos antigos são aceitos e esses campos são descartados.
    if (sourceVersion >= 3) {
      normalized.settings.monthlyDemandPieces = requireOptionalInteger(
        settings.monthlyDemandPieces,
        1,
        MAX_PIECES,
        "Demanda mensal",
      );
      normalized.settings.workingDaysPerMonth = requireInteger(
        settings.workingDaysPerMonth,
        1,
        31,
        "Dias úteis por mês",
      );
      normalized.settings.shiftsPerDay = requireInteger(settings.shiftsPerDay, 1, 24, "Turnos por dia");
      normalized.settings.actualPiecesProduced = requireOptionalInteger(
        settings.actualPiecesProduced,
        0,
        MAX_PIECES,
        "Peças produzidas",
      );
      // Campo novo na versão 4: arquivos anteriores simplesmente não o traziam.
      normalized.settings.operatorCount =
        settings.operatorCount === undefined
          ? null
          : requireOptionalInteger(settings.operatorCount, 1, MAX_OPERATORS, "Número de operadores");
    }
    validateShiftSettings(normalized.settings);

    if (!raw.scenarios || typeof raw.scenarios !== "object") {
      throw new Error("Cenários ausentes.");
    }

    for (const scenarioKey of Object.keys(SCENARIOS)) {
      const rawScenario = raw.scenarios[scenarioKey];
      if (!rawScenario || typeof rawScenario !== "object") {
        throw new Error(`Cenário ${SCENARIOS[scenarioKey].label} inválido.`);
      }
      normalized.scenarios[scenarioKey].unitsPerCycle = requireNumber(
        rawScenario.unitsPerCycle,
        MIN_UNITS_PER_CYCLE,
        MAX_UNITS_PER_CYCLE,
        "Produção por ciclo",
      );
      if (!Array.isArray(rawScenario.activities) || rawScenario.activities.length > MAX_ACTIVITIES) {
        throw new Error(`Lista de atividades do cenário ${SCENARIOS[scenarioKey].label} inválida.`);
      }
      const sourceActivities =
        sourceVersion === 1 ? migrateLegacyActivities(rawScenario.activities) : rawScenario.activities;
      const seenIds = new Set();
      normalized.scenarios[scenarioKey].activities = sourceActivities.map((activity, index) => {
        const normalizedActivity = normalizeActivity(activity, index);
        if (seenIds.has(normalizedActivity.id)) normalizedActivity.id = generateId();
        seenIds.add(normalizedActivity.id);
        return normalizedActivity;
      });
    }

    normalized.updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString();
    return normalized;
  }

  function normalizeBreak(rawBreak, index) {
    if (!rawBreak || typeof rawBreak !== "object" || Array.isArray(rawBreak)) {
      throw new Error(`Intervalo ${index + 1} inválido.`);
    }
    const label = String(rawBreak.label || "").trim().slice(0, 60);
    if (!label) throw new Error(`Informe o nome do intervalo ${index + 1}.`);
    return {
      id: typeof rawBreak.id === "string" && rawBreak.id ? rawBreak.id : generateId(),
      label,
      startSeconds: requireInteger(rawBreak.startSeconds, 0, DAY_SECONDS - 1, `Início do intervalo ${index + 1}`),
      endSeconds: requireInteger(rawBreak.endSeconds, 0, DAY_SECONDS - 1, `Fim do intervalo ${index + 1}`),
    };
  }

  function normalizeActivity(rawActivity, index) {
    if (!rawActivity || typeof rawActivity !== "object" || Array.isArray(rawActivity)) {
      throw new Error(`Atividade ${index + 1} inválida.`);
    }
    const description = String(rawActivity.description || "").trim();
    if (!description || description.length > 180) {
      throw new Error(`Descrição inválida na atividade ${index + 1}.`);
    }
    const classification = Object.prototype.hasOwnProperty.call(CLASSIFICATIONS, rawActivity.classification)
      ? rawActivity.classification
      : null;
    if (!classification) {
      throw new Error(`Classificação inválida na atividade ${index + 1}.`);
    }
    const normalizedActivity = {
      id: typeof rawActivity.id === "string" && rawActivity.id ? rawActivity.id : generateId(),
      description,
      startSeconds: requireInteger(rawActivity.startSeconds, 0, 360000000, "Início"),
      durationSeconds: requireInteger(rawActivity.durationSeconds, 1, 360000000, "Duração"),
      classification,
    };
    if (rawActivity.videoSource !== undefined) {
      const videoSource = normalizeVideoSource(rawActivity.videoSource, index);
      if (normalizedActivity.durationSeconds !== Math.max(1, Math.round(videoSource.exactDurationSeconds))) {
        throw new Error(`A duração da atividade ${index + 1} não corresponde ao intervalo do vídeo.`);
      }
      normalizedActivity.videoSource = videoSource;
    }
    return normalizedActivity;
  }

  function migrateLegacyActivities(rawActivities) {
    const legacy = rawActivities.map((rawActivity, index) => {
      if (!rawActivity || typeof rawActivity !== "object" || Array.isArray(rawActivity)) {
        throw new Error(`Atividade ${index + 1} inválida.`);
      }
      if (!["sequential", "parallel"].includes(rawActivity.timing)) {
        throw new Error(`Posicionamento inválido na atividade ${index + 1}.`);
      }
      const timing = index === 0 ? "sequential" : rawActivity.timing;
      return {
        ...rawActivity,
        durationSeconds: requireInteger(rawActivity.durationSeconds, 1, 360000000, "Duração"),
        timing,
        offsetSeconds:
          timing === "parallel"
            ? requireInteger(rawActivity.offsetSeconds ?? 0, 0, 360000000, "Atraso")
            : 0,
      };
    });

    const starts = new Array(legacy.length).fill(0);
    let cursor = 0;
    let stageStart = 0;
    let stageEnd = 0;
    legacy.forEach((activity, index) => {
      const startsNewStage = index === 0 || activity.timing !== "parallel";
      if (startsNewStage) {
        if (index > 0) cursor = stageEnd;
        stageStart = cursor;
        stageEnd = cursor;
      }
      const start = stageStart + (startsNewStage ? 0 : activity.offsetSeconds);
      starts[index] = start;
      stageEnd = Math.max(stageEnd, start + activity.durationSeconds);
    });

    return legacy.map((activity, index) => {
      const migrated = {
        id: activity.id,
        description: activity.description,
        startSeconds: starts[index],
        durationSeconds: activity.durationSeconds,
        classification: activity.classification,
      };
      if (activity.videoSource !== undefined) migrated.videoSource = activity.videoSource;
      return migrated;
    });
  }

  function normalizeVideoSource(rawSource, index) {
    if (!rawSource || typeof rawSource !== "object" || Array.isArray(rawSource)) {
      throw new Error(`Referência de vídeo inválida na atividade ${index + 1}.`);
    }
    const fileName = String(rawSource.fileName || "").trim().slice(0, 260);
    if (!fileName) throw new Error(`Nome do vídeo inválido na atividade ${index + 1}.`);
    const startSeconds = roundMediaSeconds(requireNumber(rawSource.startSeconds, 0, 360000000, "Início no vídeo"));
    const endSeconds = roundMediaSeconds(requireNumber(rawSource.endSeconds, 0, 360000000, "Fim no vídeo"));
    if (endSeconds <= startSeconds) {
      throw new Error(`Intervalo de vídeo inválido na atividade ${index + 1}.`);
    }
    const calculatedDuration = roundToMilliseconds(endSeconds - startSeconds);
    const exactDurationSeconds =
      rawSource.exactDurationSeconds === undefined
        ? calculatedDuration
        : roundToMilliseconds(requireNumber(rawSource.exactDurationSeconds, 0.001, 360000000, "Intervalo exato"));
    if (calculatedDuration < 0.001 || Math.abs(exactDurationSeconds - calculatedDuration) > 0.001) {
      throw new Error(`Duração do vídeo inválida na atividade ${index + 1}.`);
    }
    return {
      fileName,
      startSeconds,
      endSeconds,
      exactDurationSeconds,
      analysisFps: requireNumber(rawSource.analysisFps, 1, 240, "FPS de análise"),
    };
  }

  function sanitizeProjectName(value) {
    const name = String(value || "").trim().slice(0, 120);
    return name || "Novo estudo";
  }

  function requireInteger(value, min, max, label) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) {
      throw new Error(`${label} inválido.`);
    }
    return number;
  }

  function requireNumber(value, min, max, label) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < min || number > max) {
      throw new Error(`${label} inválido.`);
    }
    return number;
  }

  function requireOptionalInteger(value, min, max, label) {
    if (value === null || value === undefined || value === "") return null;
    return requireInteger(value, min, max, label);
  }

  function generateId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `tp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function cloneData(value) {
    if (typeof window.structuredClone === "function") return window.structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function parseTime(value, options) {
    const allowZero = Boolean(options && options.allowZero);
    const text = String(value || "").trim();
    const match = /^(\d{1,6}):([0-5]\d):([0-5]\d)$/.exec(text);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3]);
    const total = hours * 3600 + minutes * 60 + seconds;
    if ((!allowZero && total <= 0) || total > 360000000) return null;
    return total;
  }

  function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function parseClockTime(value) {
    const text = String(value || "").trim();
    const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(text);
    if (!match) return null;
    return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3] || 0);
  }

  function formatClockTime(secondsOfDay) {
    const normalized = ((Math.round(Number(secondsOfDay) || 0) % DAY_SECONDS) + DAY_SECONDS) % DAY_SECONDS;
    return formatTime(normalized);
  }

  function clockDistance(startSeconds, endSeconds) {
    const start = ((startSeconds % DAY_SECONDS) + DAY_SECONDS) % DAY_SECONDS;
    const end = ((endSeconds % DAY_SECONDS) + DAY_SECONDS) % DAY_SECONDS;
    return end > start ? end - start : DAY_SECONDS - start + end;
  }

  function clockAtOffset(startSeconds, offsetSeconds) {
    return (startSeconds + offsetSeconds) % DAY_SECONDS;
  }

  function shiftOffset(clockSeconds, shiftStartSeconds) {
    return clockSeconds >= shiftStartSeconds
      ? clockSeconds - shiftStartSeconds
      : DAY_SECONDS - shiftStartSeconds + clockSeconds;
  }

  // Calcula um dia de trabalho isolado: turno bruto, intervalos descontados uma única vez
  // e o tempo programado que sobra. É usado duas vezes, uma para o turno de segunda a
  // quinta e outra para o de sexta.
  function calculateDayAvailability(startSeconds, endSeconds, breaks, dayLabel) {
    const grossShiftSeconds = clockDistance(startSeconds, endSeconds);
    if (grossShiftSeconds <= 0 || grossShiftSeconds >= DAY_SECONDS) {
      throw new Error(`O turno ${dayLabel} deve ter duração entre 1 segundo e menos de 24 horas.`);
    }

    const intervals = (breaks || [])
      .map((item, index) => {
        const startOffset = shiftOffset(item.startSeconds, startSeconds);
        const duration = clockDistance(item.startSeconds, item.endSeconds);
        const endOffset = startOffset + duration;
        const name = item.label || index + 1;
        // Três problemas diferentes recebiam a mesma mensagem. O caso mais comum era o
        // usuário adiantar o início de um intervalo para depois do fim: como os horários
        // são de relógio, isso vira uma duração que dá a volta no dia, e a mensagem sobre
        // "ficar dentro do turno" não dizia nada sobre a causa real.
        // clockDistance devolve 24 h quando início e fim coincidem, porque essa é a leitura
        // correta para a jornada. Para um intervalo, significa duração zero.
        if (duration <= 0 || item.startSeconds === item.endSeconds) {
          throw new Error(`O intervalo “${name}” precisa ter início e fim diferentes.`);
        }
        if (duration > grossShiftSeconds) {
          throw new Error(
            `O intervalo “${name}” ficou mais longo que o turno. Se você quer movê-lo, ajuste primeiro o horário de fim.`,
          );
        }
        if (startOffset >= grossShiftSeconds || endOffset > grossShiftSeconds) {
          throw new Error(`O intervalo “${name}” precisa ficar totalmente dentro do turno ${dayLabel}.`);
        }
        return { ...item, startOffset, endOffset, duration };
      })
      .sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset);

    const merged = [];
    intervals.forEach((interval) => {
      const last = merged[merged.length - 1];
      if (!last || interval.startOffset >= last.endOffset) {
        merged.push({ startOffset: interval.startOffset, endOffset: interval.endOffset });
      } else {
        last.endOffset = Math.max(last.endOffset, interval.endOffset);
      }
    });
    const breakSeconds = merged.reduce((sum, item) => sum + item.endOffset - item.startOffset, 0);
    const scheduledNetSeconds = grossShiftSeconds - breakSeconds;
    if (scheduledNetSeconds <= 0) {
      throw new Error(`Os intervalos não podem consumir todo o turno ${dayLabel}.`);
    }
    return {
      grossShiftSeconds,
      breakSeconds,
      scheduledNetSeconds,
      intervals,
      mergedIntervals: merged,
      hasOverlappingBreaks: merged.length < intervals.length,
    };
  }

  // O tempo disponível é a média da semana, do mesmo jeito que a planilha MFV calcula:
  // quatro dias de segunda a quinta mais um de sexta, divididos por cinco. Não existe
  // fator de disponibilidade — o tempo indisponível é exatamente o dos intervalos.
  function calculateShiftAvailability(settings = state.settings) {
    const week = calculateDayAvailability(
      settings.shiftStartSeconds,
      settings.shiftEndSeconds,
      settings.breaks,
      "de segunda a quinta",
    );
    const friday = calculateDayAvailability(
      settings.fridayStartSeconds,
      settings.fridayEndSeconds,
      settings.breaks,
      "de sexta",
    );
    const weeklyAverage = (weekValue, fridayValue) =>
      roundToMicroseconds((weekValue * 4 + fridayValue) / 5);
    const grossShiftSeconds = weeklyAverage(week.grossShiftSeconds, friday.grossShiftSeconds);
    // Os intervalos são os mesmos nos dois dias, então a média coincide com o valor diário.
    const breakSeconds = week.breakSeconds;
    const scheduledNetSeconds = weeklyAverage(week.scheduledNetSeconds, friday.scheduledNetSeconds);
    return {
      week,
      friday,
      grossShiftSeconds,
      breakSeconds,
      scheduledNetSeconds,
      availableSeconds: scheduledNetSeconds,
      intervals: week.intervals,
      mergedIntervals: week.mergedIntervals,
      hasOverlappingBreaks: week.hasOverlappingBreaks,
    };
  }

  function validateShiftSettings(settings) {
    return calculateShiftAvailability(settings);
  }

  function calculateProductionPlan() {
    const availability = calculateShiftAvailability();
    const monthlyDemand = state.settings.monthlyDemandPieces;
    const demandPerShift =
      monthlyDemand === null
        ? null
        : monthlyDemand / (state.settings.workingDaysPerMonth * state.settings.shiftsPerDay);
    const taktSeconds = demandPerShift && demandPerShift > 0 ? availability.availableSeconds / demandPerShift : null;
    const actualPieces = state.settings.actualPiecesProduced;
    const actualCoveragePercent =
      actualPieces !== null && demandPerShift && demandPerShift > 0 ? (actualPieces / demandPerShift) * 100 : null;
    const actualDelta = actualPieces !== null && demandPerShift !== null ? actualPieces - demandPerShift : null;
    return { ...availability, demandPerShift, taktSeconds, actualPieces, actualCoveragePercent, actualDelta };
  }

  function formatTaktTime(value) {
    if (value === null || !Number.isFinite(value) || value < 0) return "—";
    const totalCentiseconds = Math.round(value * 100);
    if (value > 0 && totalCentiseconds === 0) return "< 00:00:00,01";
    const hours = Math.floor(totalCentiseconds / 360000);
    const minutes = Math.floor((totalCentiseconds % 360000) / 6000);
    const seconds = Math.floor((totalCentiseconds % 6000) / 100);
    const centiseconds = totalCentiseconds % 100;
    const base = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    return centiseconds ? `${base},${String(centiseconds).padStart(2, "0")}` : base;
  }

  function roundToMicroseconds(value) {
    return Math.round(value * 1e6) / 1e6;
  }

  function roundToMilliseconds(value) {
    return Math.round((Number(value) || 0) * 1000) / 1000;
  }

  function roundMediaSeconds(value) {
    return Math.round((Number(value) || 0) * 1000000) / 1000000;
  }

  function formatMediaTime(totalSeconds) {
    const safeMilliseconds = Math.max(0, Math.round((Number(totalSeconds) || 0) * 1000));
    const hours = Math.floor(safeMilliseconds / 3600000);
    const minutes = Math.floor((safeMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((safeMilliseconds % 60000) / 1000);
    const milliseconds = safeMilliseconds % 1000;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
  }

  function formatFileSize(bytes) {
    const value = Number(bytes) || 0;
    if (value < 1024 * 1024) return `${productionFormatter.format(value / 1024)} KB`;
    if (value < 1024 * 1024 * 1024) return `${productionFormatter.format(value / (1024 * 1024))} MB`;
    return `${productionFormatter.format(value / (1024 * 1024 * 1024))} GB`;
  }

  function formatAxisTime(totalSeconds, scaleSeconds) {
    const rounded = Math.max(0, Math.round(totalSeconds));
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const seconds = rounded % 60;
    if (scaleSeconds >= 3600) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${Math.floor(rounded / 60)}:${String(seconds).padStart(2, "0")}`;
  }

  function calculateSchedule(activities) {
    const items = activities.map((activity, index) => ({
      ...activity,
      sourceIndex: index,
      stageIndex: index,
      startSeconds: activity.startSeconds,
      endSeconds: activity.startSeconds + activity.durationSeconds,
    }));
    items.forEach((item, index) => {
      item.isOverlapping = items.some(
        (other, otherIndex) =>
          otherIndex !== index && item.startSeconds < other.endSeconds && other.startSeconds < item.endSeconds,
      );
    });
    const stages = items.map((item, index) => ({
      index,
      start: item.startSeconds,
      end: item.endSeconds,
      itemIndexes: [index],
    }));

    return {
      items,
      stages,
      cycleSeconds: items.reduce((maximum, item) => Math.max(maximum, item.endSeconds), 0),
    };
  }

  function calculateMetrics(scenarioKey) {
    const scenario = state.scenarios[scenarioKey];
    const schedule = calculateSchedule(scenario.activities);
    const productionPlan = calculateProductionPlan();
    const availableSeconds = productionPlan.availableSeconds;
    const cyclesPerShift = schedule.cycleSeconds > 0 ? availableSeconds / schedule.cycleSeconds : 0;
    const productionPerShift = cyclesPerShift * scenario.unitsPerCycle;
    const classSeconds = { agrega: 0, semiagrega: 0, "nao-agrega": 0 };
    scenario.activities.forEach((activity) => {
      classSeconds[activity.classification] += activity.durationSeconds;
    });

    return {
      scenarioKey,
      schedule,
      availableSeconds,
      productionPlan,
      cyclesPerShift,
      productionPerShift,
      classSeconds,
      totalActivitySeconds: Object.values(classSeconds).reduce((sum, value) => sum + value, 0),
    };
  }

  function calculateComparison() {
    const current = calculateMetrics("current");
    const proposed = calculateMetrics("proposed");
    const hasProductionBase = current.productionPerShift > 0;
    const gain = proposed.productionPerShift - current.productionPerShift;
    const gainPercent = hasProductionBase ? (gain / current.productionPerShift) * 100 : null;
    const hasCycleBase = current.schedule.cycleSeconds > 0;
    const cycleDelta = current.schedule.cycleSeconds - proposed.schedule.cycleSeconds;
    const cycleReductionPercent = hasCycleBase ? (cycleDelta / current.schedule.cycleSeconds) * 100 : null;
    return { current, proposed, gain, gainPercent, cycleDelta, cycleReductionPercent };
  }

  function bindEvents() {
    elements.tabs.forEach((tab) => {
      tab.addEventListener("click", () => switchView(tab.dataset.view));
      tab.addEventListener("keydown", handleTabKeydown);
    });

    elements.studyName.addEventListener("input", () => {
      state.projectName = elements.studyName.value.slice(0, 120);
      schedulePersist();
    });
    elements.studyName.addEventListener("blur", () => {
      state.projectName = sanitizeProjectName(elements.studyName.value);
      elements.studyName.value = state.projectName;
      persistState();
    });

    elements.shiftStart.addEventListener("change", () => updateShiftClock("shiftStartSeconds", elements.shiftStart));
    elements.shiftEnd.addEventListener("change", () => updateShiftClock("shiftEndSeconds", elements.shiftEnd));
    elements.fridayStart.addEventListener("change", () =>
      updateShiftClock("fridayStartSeconds", elements.fridayStart),
    );
    elements.fridayEnd.addEventListener("change", () => updateShiftClock("fridayEndSeconds", elements.fridayEnd));
    elements.operatorCount.addEventListener("change", () =>
      updateOptionalWholeNumber("operatorCount", elements.operatorCount, 1, MAX_OPERATORS, "o número de operadores"),
    );
    elements.monthlyDemand.addEventListener("change", () =>
      updateOptionalWholeNumber("monthlyDemandPieces", elements.monthlyDemand, 1, MAX_PIECES, "demanda mensal"),
    );
    elements.workingDays.addEventListener("change", updateWorkingDays);
    elements.shiftsPerDay.addEventListener("change", updateShiftsPerDay);
    elements.actualPieces.addEventListener("change", () =>
      updateOptionalWholeNumber("actualPiecesProduced", elements.actualPieces, 0, MAX_PIECES, "peças produzidas"),
    );
    elements.addBreakButton.addEventListener("click", addShiftBreak);
    elements.breakList.addEventListener("change", handleBreakChange);
    elements.breakList.addEventListener("click", handleBreakAction);
    elements.unitsPerCycle.addEventListener("change", updateUnitsPerCycle);

    elements.activityStart.addEventListener("blur", normalizeActivityTimeInput);
    elements.activityStart.addEventListener("input", syncEndFromStartAndDuration);
    elements.activityDuration.addEventListener("blur", normalizeTimeInput);
    elements.activityDuration.addEventListener("blur", syncEndFromStartAndDuration);
    elements.activityDuration.addEventListener("input", syncEndFromStartAndDuration);
    elements.activityEnd.addEventListener("blur", normalizeActivityTimeInput);
    elements.activityEnd.addEventListener("input", syncDurationFromStartAndEnd);
    elements.activityForm.addEventListener("submit", submitActivity);
    elements.activityForm.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && editingId) {
        event.preventDefault();
        cancelEditing();
      }
    });
    elements.cancelEditButton.addEventListener("click", cancelEditing);

    elements.activityList.addEventListener("click", handleActivityAction);
    elements.activityList.addEventListener("dragstart", handleDragStart);
    elements.activityList.addEventListener("dragover", handleDragOver);
    elements.activityList.addEventListener("drop", handleDrop);
    elements.activityList.addEventListener("dragend", clearDragState);

    elements.loadExampleButton.addEventListener("click", loadExample);
    elements.clearScenarioButton.addEventListener("click", clearActiveScenario);
    elements.resequenceButton.addEventListener("click", resequenceActivities);
    elements.copyScenarioButton.addEventListener("click", copyCurrentToProposed);
    elements.printButton.addEventListener("click", openPrintDialog);
    if (elements.exportButton) elements.exportButton.addEventListener("click", exportBackup);
    if (elements.importButton) elements.importButton.addEventListener("click", () => elements.importInput.click());
    if (elements.mfvExportButton) elements.mfvExportButton.addEventListener("click", exportMfvWorkbook);
    if (elements.cancelPrintButton) elements.cancelPrintButton.addEventListener("click", closePrintDialog);
    if (elements.confirmPrintButton) elements.confirmPrintButton.addEventListener("click", confirmPrint);
    if (elements.printDialog) {
      elements.printDialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closePrintDialog();
      });
      elements.printDialog.addEventListener("click", (event) => {
        if (event.target === elements.printDialog) closePrintDialog();
      });
    }
    window.addEventListener("beforeprint", fitPrintReportToPage);
    const printMediaQuery = window.matchMedia("print");
    const handlePrintMediaChange = (event) => {
      // Chromium fires beforeprint before applying @media print, then announces
      // the active print media. This second pass has measurable page geometry.
      if (event.matches) fitPrintReportToPage();
    };
    if (typeof printMediaQuery.addEventListener === "function") {
      printMediaQuery.addEventListener("change", handlePrintMediaChange);
    } else if (typeof printMediaQuery.addListener === "function") {
      printMediaQuery.addListener(handlePrintMediaChange);
    }
    window.addEventListener("afterprint", resetPrintState);

    elements.videoAnalysisButton.addEventListener("click", openVideoAnalysis);
    elements.selectVideoButton.addEventListener("click", selectVideoFile);
    elements.changeVideoButton.addEventListener("click", selectVideoFile);
    elements.addVideosButton.addEventListener("click", selectVideoFile);
    elements.videoInput.addEventListener("change", handleVideoFileSelection);
    elements.videoLibraryList.addEventListener("click", handleVideoLibraryClick);
    elements.videoDestination.addEventListener("change", () => {
      videoDestination = elements.videoDestination.value === "proposed" ? "proposed" : "current";
    });
    // Guarda a posição do vídeo em uso para que voltar a ele retome de onde parou.
    elements.videoPlayer.addEventListener("timeupdate", rememberVideoPosition);
    elements.videoPlayer.addEventListener("pause", rememberVideoPosition);
    window.addEventListener("pagehide", rememberVideoPosition);
    elements.removeVideoButton.addEventListener("click", removeVideoFile);
    elements.frameBackButton.addEventListener("click", () => stepVideoFrame(-1));
    elements.frameForwardButton.addEventListener("click", () => stepVideoFrame(1));
    elements.videoFps.addEventListener("input", handleVideoFpsChange);
    elements.videoMarkStartButton.addEventListener("click", markVideoStart);
    elements.videoMarkEndButton.addEventListener("click", markVideoEnd);
    elements.videoQuickStartButton.addEventListener("click", markVideoStart);
    elements.videoQuickEndButton.addEventListener("click", markVideoEnd);
    elements.videoClearMarksButton.addEventListener("click", () => clearVideoMarks("Marcações removidas."));
    elements.videoUseIntervalButton.addEventListener("click", applyVideoIntervalToForm);
    elements.videoShortcutArea.addEventListener("keydown", handleVideoShortcuts);
    elements.videoPlayer.addEventListener("loadedmetadata", handleVideoMetadata);
    elements.videoPlayer.addEventListener("durationchange", updateVideoReadout);
    elements.videoPlayer.addEventListener("timeupdate", updateVideoReadout);
    elements.videoPlayer.addEventListener("seeking", () => {
      videoSeekPending = true;
      updateVideoControls();
    });
    elements.videoPlayer.addEventListener("seeked", () => {
      videoSeekPending = false;
      updateVideoReadout();
      updateVideoControls();
      setVideoStatus("Quadro posicionado.");
    });
    elements.videoPlayer.addEventListener("play", startVideoFrameClock);
    elements.videoPlayer.addEventListener("pause", stopVideoFrameClock);
    elements.videoPlayer.addEventListener("ended", () => {
      stopVideoFrameClock();
      updateVideoReadout();
    });
    elements.videoPlayer.addEventListener("error", handleActiveVideoError);
    elements.activityDuration.addEventListener("input", clearPendingVideoSource);
    elements.activityEnd.addEventListener("input", clearPendingVideoSource);
    window.addEventListener("pagehide", releaseVideoObjectUrl);

    elements.helpButton.addEventListener("click", openHelp);
    elements.closeHelpButton.addEventListener("click", closeHelp);
    elements.helpDialog.addEventListener("click", (event) => {
      if (event.target === elements.helpDialog) closeHelp();
    });

    elements.moreButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFileMenu();
    });
    elements.fileMenu.addEventListener("click", handleFileMenu);
    elements.importInput.addEventListener("change", importBackup);
    document.addEventListener("click", (event) => {
      if (!elements.fileMenu.hidden && !event.target.closest(".menu-wrap")) closeFileMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeFileMenu();
        if (elements.helpDialog.open) return;
        if (editingId) cancelEditing();
      }
    });

    window.addEventListener("storage", (event) => {
      if (event.key !== STORAGE_KEY) return;
      if (!event.newValue) {
        state = createDefaultState();
        activeView = "current";
        cancelEditing(false);
        syncGlobalInputs();
        renderAll();
        showToast("O estudo foi limpo em outra aba.");
        return;
      }
      try {
        state = normalizeState(JSON.parse(event.newValue));
        cancelEditing(false);
        syncGlobalInputs();
        renderAll();
        showToast("O estudo foi atualizado por outra aba.");
      } catch (_error) {
        showToast("Outra aba enviou dados incompatíveis. O conteúdo atual foi preservado.", { error: true });
      }
    });
  }

  function updateShiftClock(settingKey, input) {
    const parsed = parseClockTime(input.value);
    if (parsed === null) {
      input.setAttribute("aria-invalid", "true");
      showToast("Informe um horário válido para o turno.", { error: true });
      return;
    }
    const candidate = cloneData(state.settings);
    candidate[settingKey] = parsed;
    try {
      validateShiftSettings(candidate);
      input.removeAttribute("aria-invalid");
      input.value = formatClockTime(parsed);
      state.settings = candidate;
      commitAndRender();
    } catch (error) {
      input.setAttribute("aria-invalid", "true");
      input.value = formatClockTime(state.settings[settingKey]);
      showToast(error instanceof Error ? error.message : "Horário de turno inválido.", {
        error: true,
        duration: 6500,
      });
    }
  }

  function updateOptionalWholeNumber(settingKey, input, min, max, label) {
    const raw = input.value.trim();
    if (raw === "") {
      input.removeAttribute("aria-invalid");
      state.settings[settingKey] = null;
      commitAndRender();
      return;
    }
    const value = Number(raw);
    if (!Number.isInteger(value) || value < min || value > max) {
      input.setAttribute("aria-invalid", "true");
      showToast(`Informe ${label} como um número inteiro${min === 0 ? " maior ou igual a zero" : " positivo"}.`, {
        error: true,
      });
      // Restaura o valor em uso, para que a tela não exiba um número recusado.
      const stored = state.settings[settingKey];
      input.value = stored === null ? "" : String(stored);
      return;
    }
    input.removeAttribute("aria-invalid");
    state.settings[settingKey] = value;
    input.value = String(value);
    commitAndRender();
  }

  function updateWorkingDays() {
    updateRequiredWholeNumber("workingDaysPerMonth", elements.workingDays, 1, 31, "dias úteis por mês");
  }

  function updateShiftsPerDay() {
    updateRequiredWholeNumber("shiftsPerDay", elements.shiftsPerDay, 1, 24, "turnos por dia");
  }

  function updateRequiredWholeNumber(settingKey, input, min, max, label) {
    const value = Number(input.value);
    if (!Number.isInteger(value) || value < min || value > max) {
      input.setAttribute("aria-invalid", "true");
      showToast(`Informe ${label} entre ${min} e ${max}.`, { error: true });
      input.value = String(state.settings[settingKey]);
      return;
    }
    input.removeAttribute("aria-invalid");
    state.settings[settingKey] = value;
    commitAndRender();
  }

  function addShiftBreak() {
    if (state.settings.breaks.length >= MAX_BREAKS) {
      showToast(`O limite é de ${MAX_BREAKS} intervalos por turno.`, { error: true });
      return;
    }
    const availability = calculateShiftAvailability();
    if (availability.week.grossShiftSeconds <= 1 || availability.friday.grossShiftSeconds <= 1) {
      showToast("O turno precisa ter mais de 1 segundo para receber um intervalo.", { error: true });
      return;
    }
    const label = state.settings.breaks.length ? `Intervalo ${state.settings.breaks.length + 1}` : "Almoço";
    // O intervalo precisa caber nos dois turnos. Tentamos centralizá-lo em cada um deles e
    // ficamos com a primeira posição que passa na validação.
    const placements = [
      { start: state.settings.shiftStartSeconds, gross: availability.week.grossShiftSeconds },
      { start: state.settings.fridayStartSeconds, gross: availability.friday.grossShiftSeconds },
    ];
    let candidate = null;
    let item = null;
    let lastError = null;
    for (const placement of placements) {
      const duration = Math.max(1, Math.min(15 * 60, Math.floor(placement.gross / 4)));
      const startOffset = Math.max(0, Math.floor((placement.gross - duration) / 2));
      const attempt = {
        id: generateId(),
        label,
        startSeconds: clockAtOffset(placement.start, startOffset),
        endSeconds: clockAtOffset(placement.start, startOffset + duration),
      };
      const settings = cloneData(state.settings);
      settings.breaks.push(attempt);
      try {
        validateShiftSettings(settings);
        candidate = settings;
        item = attempt;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!candidate) {
      showToast(
        lastError instanceof Error
          ? lastError.message
          : "Não foi possível encontrar um horário que caiba nos dois turnos.",
        { error: true, duration: 6500 },
      );
      return;
    }
    state.settings = candidate;
    const saved = commitAndRender();
    showMutationToast(saved, "Intervalo adicionado. Ajuste o nome e os horários.");
    window.requestAnimationFrame(() => {
      const row = elements.breakList.querySelector(`[data-break-id="${cssEscape(item.id)}"]`);
      const input = row && row.querySelector('[data-break-field="label"]');
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  function handleBreakChange(event) {
    const input = event.target.closest("[data-break-field]");
    if (!input) return;
    const row = input.closest("[data-break-id]");
    const index = state.settings.breaks.findIndex((entry) => entry.id === row.dataset.breakId);
    if (index < 0) return;
    if (input.dataset.breakField === "label") {
      const label = input.value.trim().slice(0, 60);
      if (!label) {
        input.setAttribute("aria-invalid", "true");
        showToast("Informe um nome para o intervalo.", { error: true });
        return;
      }
      input.removeAttribute("aria-invalid");
      state.settings.breaks[index].label = label;
      input.value = label;
      row.querySelectorAll("[aria-label]").forEach((control) => {
        if (control.dataset.breakField === "startSeconds") control.setAttribute("aria-label", `Início de ${label}`);
        if (control.dataset.breakField === "endSeconds") control.setAttribute("aria-label", `Fim de ${label}`);
        if (control.dataset.breakAction === "delete") control.setAttribute("aria-label", `Remover intervalo ${label}`);
      });
      commitAndRender({ preserveBreakRows: true });
      return;
    }

    const parsed = parseClockTime(input.value);
    if (parsed === null) {
      input.setAttribute("aria-invalid", "true");
      showToast("Informe um horário válido para o intervalo.", { error: true });
      return;
    }
    const candidate = cloneData(state.settings);
    candidate.breaks[index][input.dataset.breakField] = parsed;
    try {
      validateShiftSettings(candidate);
      input.removeAttribute("aria-invalid");
      state.settings = candidate;
      const duration = row.querySelector(".break-duration strong");
      if (duration) {
        const item = state.settings.breaks[index];
        duration.textContent = formatTime(clockDistance(item.startSeconds, item.endSeconds));
      }
      commitAndRender({ preserveBreakRows: true });
    } catch (error) {
      input.setAttribute("aria-invalid", "true");
      renderShiftSettings();
      showToast(error instanceof Error ? error.message : "Intervalo inválido.", { error: true, duration: 6500 });
    }
  }

  function handleBreakAction(event) {
    const button = event.target.closest("[data-break-action]");
    if (!button || button.dataset.breakAction !== "delete") return;
    const row = button.closest("[data-break-id]");
    const index = state.settings.breaks.findIndex((entry) => entry.id === row.dataset.breakId);
    if (index < 0) return;
    const [removed] = state.settings.breaks.splice(index, 1);
    const saved = commitAndRender();
    showMutationToast(saved, `Intervalo “${removed.label}” removido.`);
  }

  function updateUnitsPerCycle() {
    if (!isScenarioView()) return;
    const value = Number(elements.unitsPerCycle.value);
    if (!Number.isFinite(value) || value < MIN_UNITS_PER_CYCLE || value > MAX_UNITS_PER_CYCLE) {
      elements.unitsPerCycle.setAttribute("aria-invalid", "true");
      showToast("A produção por ciclo deve ficar entre 0,01 e 1.000.000.000.", { error: true });
      return;
    }
    elements.unitsPerCycle.removeAttribute("aria-invalid");
    state.scenarios[activeView].unitsPerCycle = value;
    commitAndRender();
  }

  function normalizeTimeInput(event) {
    const allowZero = event.target === elements.activityStart;
    const parsed = parseTime(event.target.value, { allowZero });
    if (parsed !== null) event.target.value = formatTime(parsed);
  }

  function normalizeActivityTimeInput(event) {
    normalizeTimeInput(event);
    if (event.target === elements.activityEnd) syncDurationFromStartAndEnd();
    else syncEndFromStartAndDuration();
  }

  function syncEndFromStartAndDuration() {
    const start = parseTime(elements.activityStart.value, { allowZero: true });
    const duration = parseTime(elements.activityDuration.value);
    if (start !== null && duration !== null) elements.activityEnd.value = formatTime(start + duration);
  }

  function syncDurationFromStartAndEnd() {
    const start = parseTime(elements.activityStart.value, { allowZero: true });
    const end = parseTime(elements.activityEnd.value, { allowZero: true });
    if (start !== null && end !== null && end > start) {
      elements.activityDuration.value = formatTime(end - start);
    }
  }

  // "current" e "proposed" são os cenários editáveis. "compare" e "videos" não têm lista de
  // atividades, e todas as ações de cadastro precisam ficar de fora delas.
  function isScenarioView() {
    return activeView === "current" || activeView === "proposed";
  }

  function switchView(view) {
    if (!["current", "proposed", "compare", "videos"].includes(view) || activeView === view) return;
    if (
      pendingVideoSource &&
      view !== "videos" &&
      !window.confirm("Descartar a medição de vídeo ainda não salva e mudar de visualização?")
    ) {
      return;
    }
    // Sair da aba de vídeos guarda onde a reprodução parou e pausa o player.
    if (activeView === "videos") {
      rememberVideoPosition();
      elements.videoPlayer.pause();
      stopVideoFrameClock();
    }
    if (view === "current" || view === "proposed") videoDestination = view;
    activeView = view;
    // Trocar de cenário sempre reinicia o formulário. Antes usávamos cancelEditing(false),
    // que retornava sem fazer nada quando não havia edição em curso — e o campo "Início"
    // ficava com o ciclo do cenário anterior, criando atividades em horários errados.
    resetForm();
    renderAll();
  }

  function handleTabKeydown(event) {
    const currentIndex = elements.tabs.indexOf(event.currentTarget);
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % elements.tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + elements.tabs.length) % elements.tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = elements.tabs.length - 1;
    else return;
    event.preventDefault();
    elements.tabs[nextIndex].focus();
    switchView(elements.tabs[nextIndex].dataset.view);
  }

  // A análise de vídeo virou uma aba. O botão "Analisar vídeo" apenas navega até ela,
  // guardando antes o cenário que estava aberto como destino da duração medida.
  function openVideoAnalysis() {
    if (isScenarioView()) videoDestination = activeView;
    switchView("videos");
    window.setTimeout(() => {
      const target = videoReady ? elements.videoShortcutArea : elements.addVideosButton;
      if (target) target.focus({ preventScroll: true });
    }, 0);
  }

  // Identidade estável de um arquivo local: é o que permite retomar a posição mesmo
  // depois de recarregar a página e escolher o mesmo arquivo de novo.
  function videoFileKey(file) {
    return `${file.name}|${file.size}|${file.lastModified || 0}`;
  }

  function loadVideoPositions() {
    try {
      const raw = window.localStorage.getItem(VIDEO_POSITIONS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function persistVideoPositions() {
    try {
      window.localStorage.setItem(VIDEO_POSITIONS_KEY, JSON.stringify(videoPositions));
    } catch (_error) {
      // Sem espaço ou armazenamento bloqueado: as posições valem só para esta sessão.
    }
  }

  function rememberVideoPosition() {
    if (!activeVideoId) return;
    const entry = videoLibrary.find((item) => item.id === activeVideoId);
    if (!entry) return;
    const time = elements.videoPlayer.currentTime;
    if (!Number.isFinite(time)) return;
    entry.positionSeconds = time;
    videoPositions[entry.key] = roundMediaSeconds(time);
    persistVideoPositions();
    const row = elements.videoLibraryList.querySelector(`[data-video-id="${cssEscape(entry.id)}"] .video-item-time`);
    if (row) row.textContent = formatMediaTime(time);
  }

  function renderVideoLibrary() {
    elements.videoLibraryEmpty.hidden = videoLibrary.length > 0;
    elements.videoLibraryList.hidden = videoLibrary.length === 0;
    elements.videoLibraryList.replaceChildren();
    videoLibrary.forEach((entry) => {
      const item = document.createElement("li");
      item.className = "video-item";
      item.dataset.videoId = entry.id;
      if (entry.id === activeVideoId) item.classList.add("is-active");

      const open = document.createElement("button");
      open.type = "button";
      open.className = "video-item-open";
      open.dataset.videoAction = "open";
      open.setAttribute("aria-current", entry.id === activeVideoId ? "true" : "false");
      const name = document.createElement("span");
      name.className = "video-item-name";
      name.textContent = entry.name;
      name.title = entry.name;
      const meta = document.createElement("span");
      meta.className = "video-item-meta";
      const time = document.createElement("b");
      time.className = "video-item-time";
      time.textContent = formatMediaTime(entry.positionSeconds || 0);
      meta.append(document.createTextNode(`${formatFileSize(entry.size)} · parou em `), time);
      open.append(name, meta);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "row-action delete";
      remove.dataset.videoAction = "remove";
      remove.title = `Remover ${entry.name} da lista`;
      remove.setAttribute("aria-label", `Remover ${entry.name} da lista`);
      remove.innerHTML = ICONS.delete;

      item.append(open, remove);
      elements.videoLibraryList.appendChild(item);
    });
  }

  function handleVideoLibraryClick(event) {
    const button = event.target.closest("[data-video-action]");
    if (!button) return;
    const item = button.closest("[data-video-id]");
    if (!item) return;
    const entry = videoLibrary.find((candidate) => candidate.id === item.dataset.videoId);
    if (!entry) return;
    if (button.dataset.videoAction === "remove") removeVideoFromLibrary(entry.id);
    else void activateVideo(entry.id);
  }

  function removeVideoFromLibrary(videoId) {
    const index = videoLibrary.findIndex((item) => item.id === videoId);
    if (index < 0) return;
    if (videoId === activeVideoId) {
      rememberVideoPosition();
      releaseVideoObjectUrl();
      activeVideoId = null;
    }
    videoLibrary.splice(index, 1);
    renderVideoLibrary();
    setVideoStatus(
      videoLibrary.length ? "Vídeo removido da lista." : "Adicione um vídeo para começar a cronoanálise.",
    );
  }

  // Carrega um vídeo da lista. A URL temporária anterior é liberada, então apenas um
  // arquivo por vez ocupa memória, e a posição guardada é restaurada.
  async function activateVideo(videoId) {
    const entry = videoLibrary.find((item) => item.id === videoId);
    if (!entry || videoId === activeVideoId) return;
    if (hasUntransferredVideoMarks() && !window.confirm("Descartar as marcações ainda não usadas e trocar o vídeo?")) {
      return;
    }
    rememberVideoPosition();

    const loadGeneration = ++videoLoadGeneration;
    clearVideoError();
    setVideoStatus("Lendo os metadados do vídeo…");
    setVideoLoading(true);
    const candidateUrl = URL.createObjectURL(entry.file);
    try {
      const metadata = await inspectVideoCandidate(candidateUrl);
      if (loadGeneration !== videoLoadGeneration) {
        URL.revokeObjectURL(candidateUrl);
        return;
      }
      const previousUrl = videoObjectUrl;
      videoObjectUrl = candidateUrl;
      videoFile = entry.file;
      activeVideoId = entry.id;
      videoReady = false;
      videoResumeSeconds = Math.min(entry.positionSeconds || 0, Math.max(0, (metadata.duration || 0) - 0.05));
      clearVideoMarks();
      elements.videoPlayer.pause();
      elements.videoPlayer.src = candidateUrl;
      elements.videoPlayer.load();
      elements.videoFileName.textContent = entry.name;
      elements.videoFileDetails.textContent = videoMetadataText(entry.file, metadata);
      elements.videoEmptyState.hidden = true;
      elements.videoLoadedState.hidden = false;
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      renderVideoLibrary();
      setVideoStatus(
        videoResumeSeconds > 0
          ? `Retomando de ${formatMediaTime(videoResumeSeconds)}.`
          : "Vídeo carregado. Reproduza ou navegue até o início da atividade.",
      );
    } catch (error) {
      URL.revokeObjectURL(candidateUrl);
      if (loadGeneration !== videoLoadGeneration) return;
      setVideoError(error instanceof Error ? error.message : "Não foi possível abrir o vídeo.");
      setVideoStatus(videoReady ? "O vídeo anterior foi preservado." : "Selecione outro arquivo para continuar.");
    } finally {
      if (loadGeneration === videoLoadGeneration) setVideoLoading(false);
    }
  }

  function selectVideoFile() {
    elements.videoInput.click();
  }

  // Aceita vários arquivos de uma vez. Cada um entra na lista com a posição que já tiver
  // sido guardada em outra sessão; o primeiro adicionado começa a tocar.
  async function handleVideoFileSelection(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    clearVideoError();

    const rejected = [];
    let firstAdded = null;
    let duplicates = 0;
    files.forEach((file) => {
      if (!file.size || (file.type && !file.type.startsWith("video/"))) {
        rejected.push(file.name);
        return;
      }
      if (videoLibrary.length >= MAX_VIDEOS) {
        rejected.push(file.name);
        return;
      }
      const key = videoFileKey(file);
      const existing = videoLibrary.find((item) => item.key === key);
      if (existing) {
        // O mesmo arquivo escolhido de novo renova a referência, que pode ter expirado.
        existing.file = file;
        duplicates += 1;
        if (!firstAdded) firstAdded = existing;
        return;
      }
      const entry = {
        id: generateId(),
        key,
        file,
        name: file.name,
        size: file.size,
        positionSeconds: Number(videoPositions[key]) || 0,
      };
      videoLibrary.push(entry);
      if (!firstAdded) firstAdded = entry;
    });

    renderVideoLibrary();
    if (rejected.length) {
      setVideoError(
        videoLibrary.length >= MAX_VIDEOS
          ? `A lista aceita no máximo ${MAX_VIDEOS} vídeos.`
          : `Não foi possível adicionar: ${rejected.join(", ")}.`,
      );
    }
    if (!firstAdded) return;
    if (!activeVideoId) await activateVideo(firstAdded.id);
    else if (duplicates === 0) {
      setVideoStatus(
        `${files.length - rejected.length} vídeo(s) na lista. Escolha um para assistir.`,
      );
    }
  }

  function setVideoLoading(isLoading) {
    videoLoadPending = isLoading;
    elements.videoWorkspace.toggleAttribute("aria-busy", isLoading);
    elements.selectVideoButton.disabled = isLoading;
    elements.changeVideoButton.disabled = isLoading;
    elements.removeVideoButton.disabled = isLoading;
    elements.videoPlayer.controls = !isLoading;
    if (isLoading) elements.videoPlayer.pause();
    updateVideoControls();
  }

  function inspectVideoCandidate(url) {
    return new Promise((resolve, reject) => {
      const probe = document.createElement("video");
      const timeout = window.setTimeout(
        () => finish(new Error("O navegador demorou demais para ler os metadados do vídeo.")),
        120000,
      );
      let finished = false;

      function cleanup() {
        window.clearTimeout(timeout);
        probe.removeAttribute("src");
        probe.load();
      }

      function finish(error, metadata) {
        if (finished) return;
        finished = true;
        cleanup();
        if (error) reject(error);
        else resolve(metadata);
      }

      probe.preload = "metadata";
      probe.muted = true;
      probe.addEventListener(
        "loadedmetadata",
        () => {
          if (!Number.isFinite(probe.duration) || probe.duration <= 0) {
            finish(new Error("O vídeo não informou uma duração válida."));
            return;
          }
          finish(null, {
            duration: probe.duration,
            width: probe.videoWidth,
            height: probe.videoHeight,
          });
        },
        { once: true },
      );
      probe.addEventListener(
        "error",
        () => finish(new Error("O formato ou o codec deste vídeo não é compatível com o navegador.")),
        { once: true },
      );
      probe.src = url;
    });
  }

  function videoMetadataText(file, metadata) {
    const resolution = metadata.width && metadata.height ? `${metadata.width}×${metadata.height}` : "resolução não informada";
    return `${formatFileSize(file.size)} · ${resolution} · ${formatMediaTime(metadata.duration)}`;
  }

  function handleVideoMetadata() {
    if (!videoObjectUrl || !Number.isFinite(elements.videoPlayer.duration) || elements.videoPlayer.duration <= 0) return;
    videoReady = true;
    elements.videoEmptyState.hidden = true;
    elements.videoLoadedState.hidden = false;
    // Retoma de onde o usuário parou neste arquivo.
    if (videoResumeSeconds > 0 && videoResumeSeconds < elements.videoPlayer.duration) {
      elements.videoPlayer.currentTime = videoResumeSeconds;
    }
    videoResumeSeconds = 0;
    if (videoFile) {
      elements.videoFileDetails.textContent = videoMetadataText(videoFile, {
        duration: elements.videoPlayer.duration,
        width: elements.videoPlayer.videoWidth,
        height: elements.videoPlayer.videoHeight,
      });
    }
    updateVideoReadout();
    updateVideoControls();
  }

  function handleActiveVideoError() {
    if (!elements.videoPlayer.currentSrc) return;
    videoReady = false;
    stopVideoFrameClock();
    updateVideoControls();
    setVideoStatus("Não foi possível reproduzir o vídeo selecionado.");
    setVideoError("O navegador não conseguiu decodificar este vídeo. Tente um arquivo MP4 com vídeo H.264.");
  }

  function removeVideoFile() {
    if (hasUntransferredVideoMarks() && !window.confirm("Remover o vídeo e descartar as marcações ainda não usadas?")) {
      return;
    }
    if (activeVideoId) {
      removeVideoFromLibrary(activeVideoId);
    } else {
      releaseVideoObjectUrl();
      setVideoStatus("Vídeo removido. As atividades já cadastradas foram preservadas.");
    }
    elements.addVideosButton.focus();
  }

  function releaseVideoObjectUrl() {
    videoLoadGeneration += 1;
    videoLoadPending = false;
    stopVideoFrameClock();
    elements.videoPlayer.pause();
    elements.videoPlayer.removeAttribute("src");
    elements.videoPlayer.load();
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    videoObjectUrl = null;
    videoFile = null;
    videoReady = false;
    videoSeekPending = false;
    videoResumeSeconds = 0;
    activeVideoId = null;
    elements.videoWorkspace.removeAttribute("aria-busy");
    elements.selectVideoButton.disabled = false;
    elements.changeVideoButton.disabled = false;
    elements.removeVideoButton.disabled = false;
    elements.videoPlayer.controls = true;
    clearVideoMarks();
    elements.videoFileName.textContent = "Vídeo selecionado";
    elements.videoFileDetails.textContent = "Aguardando metadados";
    elements.videoEmptyState.hidden = false;
    elements.videoLoadedState.hidden = true;
    updateVideoReadout(0);
    updateVideoControls();
  }

  function hasUntransferredVideoMarks() {
    return videoStartSeconds !== null && !videoIntervalTransferred;
  }

  function getVideoAnalysisFps(showError = true) {
    const fps = Number(elements.videoFps.value);
    const valid = Number.isFinite(fps) && fps >= 1 && fps <= 240;
    if (valid) {
      elements.videoFps.removeAttribute("aria-invalid");
      elements.videoFpsError.textContent = "";
    } else {
      elements.videoFps.setAttribute("aria-invalid", "true");
      if (showError) elements.videoFpsError.textContent = "Informe um FPS entre 1 e 240.";
    }
    return valid ? fps : null;
  }

  function handleVideoFpsChange() {
    getVideoAnalysisFps(true);
    updateVideoReadout();
    updateVideoControls();
  }

  function updateVideoReadout(mediaTime) {
    const playerTime = typeof mediaTime === "number" && Number.isFinite(mediaTime) ? mediaTime : elements.videoPlayer.currentTime;
    const currentTime = videoReady ? Math.max(0, Number(playerTime) || 0) : 0;
    const duration = videoReady && Number.isFinite(elements.videoPlayer.duration) ? elements.videoPlayer.duration : 0;
    const fps = getVideoAnalysisFps(false);
    elements.videoCurrentTime.textContent = formatMediaTime(currentTime);
    elements.videoDuration.textContent = formatMediaTime(duration);
    elements.videoFrameNumber.textContent = fps
      ? numberFormatter.format(getEstimatedFrameIndex(currentTime, fps, duration))
      : "—";
    updateVideoControls();
  }

  function getMaxEstimatedFrame(fps, duration = elements.videoPlayer.duration) {
    if (!fps || !Number.isFinite(duration) || duration <= 0) return 0;
    return Math.max(0, Math.ceil(duration * fps - 0.000001) - 1);
  }

  function getEstimatedFrameIndex(time, fps, duration = elements.videoPlayer.duration) {
    const boundaryTolerance = Math.min(0.25, fps * 0.001);
    const frame = Math.max(0, Math.floor((Number(time) || 0) * fps + boundaryTolerance));
    return Math.min(getMaxEstimatedFrame(fps, duration), frame);
  }

  function startVideoFrameClock() {
    if (!videoReady || typeof elements.videoPlayer.requestVideoFrameCallback !== "function" || videoFrameRequestId !== null) {
      return;
    }
    videoFrameRequestId = elements.videoPlayer.requestVideoFrameCallback((_now, metadata) => {
      videoFrameRequestId = null;
      updateVideoReadout(metadata.mediaTime);
      if (!elements.videoPlayer.paused && !elements.videoPlayer.ended) startVideoFrameClock();
    });
  }

  function stopVideoFrameClock() {
    if (
      videoFrameRequestId !== null &&
      typeof elements.videoPlayer.cancelVideoFrameCallback === "function"
    ) {
      elements.videoPlayer.cancelVideoFrameCallback(videoFrameRequestId);
    }
    videoFrameRequestId = null;
    updateVideoReadout();
  }

  function stepVideoFrame(direction) {
    const fps = getVideoAnalysisFps(true);
    if (!videoReady || !fps || videoSeekPending || videoLoadPending) return;
    elements.videoPlayer.pause();
    const maxFrame = getMaxEstimatedFrame(fps);
    const currentFrame = getEstimatedFrameIndex(elements.videoPlayer.currentTime, fps);
    const targetFrame = Math.max(0, Math.min(maxFrame, currentFrame + direction));
    const targetTime = targetFrame / fps;
    if (targetFrame === currentFrame) {
      if (direction < 0 && elements.videoPlayer.currentTime > targetTime + 0.0005) {
        videoSeekPending = true;
        updateVideoControls();
        elements.videoPlayer.currentTime = targetTime;
        updateVideoReadout(targetTime);
        return;
      }
      updateVideoControls();
      setVideoStatus(direction < 0 ? "O vídeo já está no início." : "O vídeo já está no fim.");
      return;
    }
    videoSeekPending = true;
    updateVideoControls();
    elements.videoPlayer.currentTime = targetTime;
    updateVideoReadout(targetTime);
  }

  function markVideoStart() {
    if (!videoReady || videoSeekPending || videoLoadPending) return;
    elements.videoPlayer.pause();
    videoStartSeconds = roundMediaSeconds(elements.videoPlayer.currentTime);
    videoEndSeconds = null;
    videoIntervalTransferred = false;
    clearVideoError();
    updateVideoMarkers();
    setVideoStatus(`Início marcado em ${formatMediaTime(videoStartSeconds)}.`);
  }

  function markVideoEnd() {
    if (!videoReady || videoStartSeconds === null || videoSeekPending || videoLoadPending) return;
    elements.videoPlayer.pause();
    const candidate = roundMediaSeconds(elements.videoPlayer.currentTime);
    videoEndSeconds = null;
    videoIntervalTransferred = false;
    if (candidate <= videoStartSeconds) {
      updateVideoMarkers();
      setVideoError("O fim deve estar depois do início marcado.");
      return;
    }
    videoEndSeconds = candidate;
    videoIntervalTransferred = false;
    clearVideoError();
    updateVideoMarkers();
    setVideoStatus(`Fim marcado em ${formatMediaTime(videoEndSeconds)}.`);
  }

  function getVideoInterval() {
    if (videoStartSeconds === null || videoEndSeconds === null || videoEndSeconds <= videoStartSeconds) return null;
    const exactSeconds = roundToMilliseconds(videoEndSeconds - videoStartSeconds);
    if (exactSeconds < 0.001) return null;
    return {
      exactSeconds,
      roundedSeconds: Math.max(1, Math.round(exactSeconds)),
    };
  }

  function updateVideoMarkers() {
    const interval = getVideoInterval();
    elements.videoStartValue.textContent = videoStartSeconds === null ? "—" : formatMediaTime(videoStartSeconds);
    elements.videoEndValue.textContent = videoEndSeconds === null ? "—" : formatMediaTime(videoEndSeconds);
    elements.videoIntervalExact.textContent = interval ? formatMediaTime(interval.exactSeconds) : "—";
    elements.videoIntervalRounded.textContent = interval ? formatTime(interval.roundedSeconds) : "—";
    updateVideoControls();
  }

  function clearVideoMarks(statusMessage) {
    videoStartSeconds = null;
    videoEndSeconds = null;
    videoIntervalTransferred = false;
    clearVideoError();
    updateVideoMarkers();
    if (statusMessage) setVideoStatus(statusMessage);
  }

  function updateVideoControls() {
    const fps = getVideoAnalysisFps(false);
    const current = Number(elements.videoPlayer.currentTime) || 0;
    const duration = videoReady && Number.isFinite(elements.videoPlayer.duration) ? elements.videoPlayer.duration : 0;
    const currentFrame = fps ? getEstimatedFrameIndex(current, fps, duration) : 0;
    const maxFrame = fps ? getMaxEstimatedFrame(fps, duration) : 0;
    const blocked = !videoReady || !fps || videoSeekPending || videoLoadPending;
    elements.frameBackButton.disabled = blocked || (currentFrame <= 0 && current <= 0.0005);
    elements.frameForwardButton.disabled = blocked || currentFrame >= maxFrame;
    elements.videoMarkStartButton.disabled = !videoReady || videoSeekPending || videoLoadPending;
    elements.videoMarkEndButton.disabled =
      !videoReady || videoSeekPending || videoLoadPending || videoStartSeconds === null;
    elements.videoQuickStartButton.disabled = elements.videoMarkStartButton.disabled;
    elements.videoQuickEndButton.disabled = elements.videoMarkEndButton.disabled;
    elements.videoUseIntervalButton.disabled = !getVideoInterval() || !fps || !videoReady || videoLoadPending;
    elements.videoClearMarksButton.disabled =
      videoLoadPending || (videoStartSeconds === null && videoEndSeconds === null);
  }

  function applyVideoIntervalToForm() {
    const interval = getVideoInterval();
    const fps = getVideoAnalysisFps(true);
    if (!interval || !fps || !videoFile || !videoReady || videoLoadPending) {
      setVideoError("Marque um início e um fim válidos antes de usar a duração.");
      return;
    }
    // A medição é feita na aba Vídeos, mas a duração pertence a um cenário. Trocamos de aba
    // antes de preencher, porque switchView reinicia o formulário.
    if (activeView !== videoDestination) {
      pendingVideoSource = null;
      switchView(videoDestination);
    }
    pendingVideoSource = {
      fileName: videoFile.name.slice(0, 260),
      startSeconds: videoStartSeconds,
      endSeconds: videoEndSeconds,
      exactDurationSeconds: interval.exactSeconds,
      analysisFps: fps,
    };
    elements.activityDuration.value = formatTime(interval.roundedSeconds);
    syncEndFromStartAndDuration();
    elements.activityDuration.removeAttribute("aria-invalid");
    elements.durationError.textContent = "";
    renderPendingVideoSource();
    videoIntervalTransferred = true;
    setVideoStatus("Duração transferida para o formulário da atividade.");
    elements.activityForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
    window.setTimeout(() => elements.activityDescription.focus(), 120);
  }

  function clearPendingVideoSource() {
    if (!pendingVideoSource) return;
    pendingVideoSource = null;
    renderPendingVideoSource();
  }

  function renderPendingVideoSource() {
    elements.durationVideoSource.hidden = !pendingVideoSource;
    if (!pendingVideoSource) {
      elements.durationVideoSource.textContent = "";
      return;
    }
    const exact =
      pendingVideoSource.exactDurationSeconds ??
      roundToMilliseconds(pendingVideoSource.endSeconds - pendingVideoSource.startSeconds);
    elements.durationVideoSource.textContent = `Do vídeo: ${formatMediaTime(pendingVideoSource.startSeconds)} → ${formatMediaTime(
      pendingVideoSource.endSeconds,
    )} · intervalo exato ${formatMediaTime(exact)}`;
  }

  function handleVideoShortcuts(event) {
    if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(event.target.tagName)) return;
    const key = event.key.toLowerCase();
    if (![",", ".", "i", "o", " "].includes(key) || videoLoadPending) return;
    event.preventDefault();
    if (key === ",") stepVideoFrame(-1);
    if (key === ".") stepVideoFrame(1);
    if (key === "i") markVideoStart();
    if (key === "o") markVideoEnd();
    if (key === " " && videoReady) {
      if (elements.videoPlayer.paused) {
        void elements.videoPlayer.play().catch(() => {
          setVideoError("Não foi possível iniciar a reprodução deste vídeo.");
        });
      }
      else elements.videoPlayer.pause();
    }
  }

  function setVideoStatus(message) {
    elements.videoStatus.textContent = message;
  }

  function setVideoError(message) {
    elements.videoError.textContent = message;
  }

  function clearVideoError() {
    elements.videoError.textContent = "";
  }

  function submitActivity(event) {
    event.preventDefault();
    if (!isScenarioView()) return;
    clearFormErrors();

    const description = elements.activityDescription.value.trim();
    const startSeconds = parseTime(elements.activityStart.value, { allowZero: true });
    const durationSeconds = parseTime(elements.activityDuration.value);
    const endSeconds = parseTime(elements.activityEnd.value, { allowZero: true });
    const classification = elements.activityClassification.value;
    let valid = true;

    if (!description) {
      setFieldError(elements.activityDescription, elements.descriptionError, "Informe a descrição da atividade.");
      valid = false;
    }
    if (durationSeconds === null) {
      setFieldError(
        elements.activityDuration,
        elements.durationError,
        "Use HH:MM:SS e informe uma duração maior que zero.",
      );
      valid = false;
    }
    if (startSeconds === null) {
      setFieldError(elements.activityStart, elements.startError, "Use HH:MM:SS. O início pode ser zero.");
      valid = false;
    }
    if (endSeconds === null || startSeconds === null || endSeconds <= startSeconds) {
      setFieldError(elements.activityEnd, elements.endError, "O fim deve ser maior que o início.");
      valid = false;
    } else if (durationSeconds !== null && endSeconds !== startSeconds + durationSeconds) {
      setFieldError(elements.activityEnd, elements.endError, "O fim deve corresponder ao início mais a duração.");
      valid = false;
    }
    if (!Object.prototype.hasOwnProperty.call(CLASSIFICATIONS, classification)) {
      valid = false;
    }
    if (!valid) return;

    const activities = state.scenarios[activeView].activities;
    const editedIndex = editingId ? activities.findIndex((item) => item.id === editingId) : -1;
    if (editedIndex < 0 && activities.length >= MAX_ACTIVITIES) {
      showToast(`O cenário aceita no máximo ${MAX_ACTIVITIES} atividades.`, { error: true });
      return;
    }
    const activity = {
      id: editingId || generateId(),
      description,
      startSeconds,
      durationSeconds,
      classification,
    };
    if (pendingVideoSource) activity.videoSource = cloneData(pendingVideoSource);

    let successMessage = "";
    if (editedIndex >= 0) {
      activities.splice(editedIndex, 1, activity);
      successMessage = "Atividade atualizada.";
    } else {
      activities.push(activity);
      successMessage = "Atividade adicionada.";
    }

    resetForm();
    const saved = commitAndRender();
    showMutationToast(saved, successMessage);
    window.setTimeout(() => elements.activityDescription.focus(), 0);
  }

  function setFieldError(input, errorElement, message) {
    input.setAttribute("aria-invalid", "true");
    errorElement.textContent = message;
    if (!document.querySelector('[aria-invalid="true"]:focus')) input.focus();
  }

  function clearFormErrors() {
    [elements.activityDescription, elements.activityStart, elements.activityDuration, elements.activityEnd].forEach((input) =>
      input.removeAttribute("aria-invalid"),
    );
    elements.descriptionError.textContent = "";
    elements.startError.textContent = "";
    elements.durationError.textContent = "";
    elements.endError.textContent = "";
  }

  function resetForm() {
    editingId = null;
    pendingVideoSource = null;
    elements.formTitle.textContent = "Nova atividade";
    elements.submitActivityButton.textContent = "Adicionar atividade";
    elements.cancelEditButton.hidden = true;
    elements.activityDescription.value = "";
    const defaultStart =
      !isScenarioView() ? 0 : calculateSchedule(state.scenarios[activeView].activities).cycleSeconds;
    elements.activityStart.value = formatTime(defaultStart);
    elements.activityDuration.value = "00:01:00";
    elements.activityEnd.value = formatTime(defaultStart + 60);
    elements.activityClassification.value = "agrega";
    renderPendingVideoSource();
    clearFormErrors();
  }

  // Reposiciona apenas o início sugerido (e o fim derivado dele) quando o formulário está
  // no modo "nova atividade". Descrição, duração e classificação são preservadas de
  // propósito, para não apagar o que o usuário já digitou.
  //
  // Sem esta função, o início sugerido só era recalculado ao salvar uma atividade ou ao
  // cancelar uma edição. Depois de excluir ou duplicar uma atividade o campo continuava
  // com o ciclo antigo, e a próxima atividade nascia fora de lugar.
  function refreshSuggestedStart() {
    if (editingId || !isScenarioView()) return;
    const cycleSeconds = calculateSchedule(state.scenarios[activeView].activities).cycleSeconds;
    const durationSeconds = parseTime(elements.activityDuration.value) ?? 60;
    elements.activityStart.value = formatTime(cycleSeconds);
    elements.activityEnd.value = formatTime(cycleSeconds + durationSeconds);
  }

  function cancelEditing(render = true) {
    if (!editingId && !pendingVideoSource && !render) return;
    resetForm();
    if (render) renderEditor();
  }

  function handleActivityAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button || !isScenarioView()) return;
    const item = button.closest(".activity-item");
    if (!item) return;
    const activityId = item.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") editActivity(activityId);
    if (action === "duplicate") duplicateActivity(activityId);
    if (action === "delete") deleteActivity(activityId);
    if (action === "up") moveActivity(activityId, -1);
    if (action === "down") moveActivity(activityId, 1);
  }

  function editActivity(activityId) {
    const activity = state.scenarios[activeView].activities.find((item) => item.id === activityId);
    if (!activity) return;
    editingId = activityId;
    elements.formTitle.textContent = "Editar atividade";
    elements.submitActivityButton.textContent = "Salvar alterações";
    elements.cancelEditButton.hidden = false;
    elements.activityDescription.value = activity.description;
    elements.activityStart.value = formatTime(activity.startSeconds);
    elements.activityDuration.value = formatTime(activity.durationSeconds);
    elements.activityEnd.value = formatTime(activity.startSeconds + activity.durationSeconds);
    elements.activityClassification.value = activity.classification;
    pendingVideoSource = activity.videoSource ? cloneData(activity.videoSource) : null;
    renderPendingVideoSource();
    clearFormErrors();
    elements.activityForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
    window.setTimeout(() => elements.activityDescription.focus(), 120);
  }

  function duplicateActivity(activityId) {
    const activities = state.scenarios[activeView].activities;
    if (activities.length >= MAX_ACTIVITIES) {
      showToast(`O cenário aceita no máximo ${MAX_ACTIVITIES} atividades.`, { error: true });
      return;
    }
    const index = activities.findIndex((item) => item.id === activityId);
    if (index < 0) return;
    const duplicate = {
      ...cloneData(activities[index]),
      id: generateId(),
      description: `${activities[index].description} — cópia`.slice(0, 180),
    };
    activities.splice(index + 1, 0, duplicate);
    const saved = commitAndRender();
    refreshSuggestedStart();
    showMutationToast(saved, "Atividade duplicada.");
  }

  function deleteActivity(activityId) {
    const activities = state.scenarios[activeView].activities;
    const index = activities.findIndex((item) => item.id === activityId);
    if (index < 0) return;
    const activitySnapshot = cloneData(activities);
    activities.splice(index, 1);
    const scenarioKey = activeView;
    if (editingId === activityId) resetForm();
    const saved = commitAndRender();
    refreshSuggestedStart();
    showMutationToast(saved, "Atividade excluída.", {
      actionLabel: "Desfazer",
      onAction: () => {
        state.scenarios[scenarioKey].activities = cloneData(activitySnapshot);
        const undoSaved = commitAndRender();
        refreshSuggestedStart();
        showMutationToast(undoSaved, "Exclusão desfeita.");
      },
      duration: 6500,
    });
  }

  function moveActivity(activityId, delta) {
    const activities = state.scenarios[activeView].activities;
    const index = activities.findIndex((candidate) => candidate.id === activityId);
    const targetIndex = index + delta;
    if (index < 0 || targetIndex < 0 || targetIndex >= activities.length) return;
    const [activity] = activities.splice(index, 1);
    activities.splice(targetIndex, 0, activity);
    const saved = commitAndRender();
    showMutationToast(saved, "Atividade reordenada sem alterar seus horários.");
    focusActivityAction(activityId, delta < 0 ? "up" : "down");
  }

  function focusActivityAction(activityId, action) {
    window.setTimeout(() => {
      const selector = `.activity-item[data-id="${cssEscape(activityId)}"] [data-action="${action}"]`;
      const target = document.querySelector(selector);
      if (target) target.focus();
    }, 0);
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/["\\]/g, "\\$&");
  }

  function handleDragStart(event) {
    const item = event.target.closest(".activity-item");
    if (!item) return;
    draggedId = item.dataset.id;
    item.classList.add("is-dragging");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedId);
    }
  }

  function handleDragOver(event) {
    if (!draggedId) return;
    const item = event.target.closest(".activity-item");
    if (!item || item.dataset.id === draggedId) return;
    event.preventDefault();
    elements.activityList.querySelectorAll(".is-drop-target").forEach((node) =>
      node.classList.remove("is-drop-target"),
    );
    item.classList.add("is-drop-target");
  }

  function handleDrop(event) {
    const target = event.target.closest(".activity-item");
    if (!target || !draggedId || target.dataset.id === draggedId) {
      clearDragState();
      return;
    }
    event.preventDefault();
    const activities = state.scenarios[activeView].activities;
    const draggedIndex = activities.findIndex((item) => item.id === draggedId);
    const targetIndex = activities.findIndex((item) => item.id === target.dataset.id);
    if (draggedIndex >= 0 && targetIndex >= 0 && draggedIndex !== targetIndex) {
      const [activity] = activities.splice(draggedIndex, 1);
      activities.splice(targetIndex, 0, activity);
      const saved = commitAndRender();
      showMutationToast(saved, "Atividade reordenada sem alterar seus horários.");
    }
    clearDragState();
  }

  function clearDragState() {
    draggedId = null;
    elements.activityList.querySelectorAll(".is-dragging, .is-drop-target").forEach((node) => {
      node.classList.remove("is-dragging", "is-drop-target");
    });
  }

  function loadExample() {
    if (!isScenarioView()) return;
    const activities = state.scenarios[activeView].activities;
    if (activities.length && !window.confirm("Substituir as atividades deste cenário pelo exemplo?")) return;
    state.scenarios[activeView].activities = [
      createExampleActivity("Preparar materiais e ferramentas", 0, 120, "semiagrega"),
      createExampleActivity("Posicionar componente no dispositivo", 120, 45, "agrega"),
      createExampleActivity("Inspecionar lote anterior", 130, 60, "semiagrega"),
      createExampleActivity("Executar operação principal", 190, 180, "agrega"),
      createExampleActivity("Descartar aparas", 220, 30, "nao-agrega"),
    ];
    resetForm();
    const saved = commitAndRender();
    showMutationToast(saved, "Exemplo carregado. Edite ou exclua as atividades livremente.");
  }

  function createExampleActivity(description, startSeconds, durationSeconds, classification) {
    return { id: generateId(), description, startSeconds, durationSeconds, classification };
  }

  function clearActiveScenario() {
    if (!isScenarioView()) return;
    const activities = state.scenarios[activeView].activities;
    if (!activities.length) return;
    if (!window.confirm(`Limpar todas as atividades do cenário ${SCENARIOS[activeView].label}?`)) return;
    state.scenarios[activeView].activities = [];
    resetForm();
    const saved = commitAndRender();
    showMutationToast(saved, `Cenário ${SCENARIOS[activeView].label} limpo.`);
  }

  // Reencadeia as atividades na ordem em que aparecem na lista: cada uma passa a começar
  // quando a anterior termina, mantendo a duração. É o que fecha as lacunas deixadas ao
  // excluir uma atividade — sem esta ação, remover um desperdício do cenário Proposto não
  // reduzia o tempo de ciclo e o ganho aparecia como zero.
  function resequenceActivities() {
    if (!isScenarioView()) return;
    const activities = state.scenarios[activeView].activities;
    if (!activities.length) return;

    let cursor = 0;
    const targets = activities.map((activity) => {
      const start = cursor;
      cursor += activity.durationSeconds;
      return start;
    });
    if (activities.every((activity, index) => activity.startSeconds === targets[index])) {
      showToast("As atividades já estão em sequência, sem lacunas nem sobreposições.");
      return;
    }

    if (
      !window.confirm(
        `Reorganizar as ${activities.length} atividades do cenário ${SCENARIOS[activeView].label} em sequência, na ordem da lista?\n\n` +
          "Cada atividade passará a começar quando a anterior terminar. As durações não mudam, mas sobreposições e paradas propositais serão desfeitas.",
      )
    ) {
      return;
    }

    const scenarioKey = activeView;
    const snapshot = cloneData(activities);
    const previousCycle = calculateSchedule(activities).cycleSeconds;
    activities.forEach((activity, index) => {
      activity.startSeconds = targets[index];
    });
    // Uma edição em curso aponta para um início que acabou de mudar; salvá-la desfaria a
    // sequência. Um cadastro apenas começado é preservado.
    if (editingId) resetForm();
    const saved = commitAndRender();
    refreshSuggestedStart();

    const newCycle = calculateSchedule(activities).cycleSeconds;
    const delta = previousCycle - newCycle;
    const message =
      delta > 0
        ? `Sequência atualizada. O ciclo caiu ${formatTime(delta)} e agora é ${formatTime(newCycle)}.`
        : delta < 0
          ? `Sequência atualizada. O ciclo subiu ${formatTime(-delta)} e agora é ${formatTime(newCycle)}.`
          : `Sequência atualizada. O ciclo continua em ${formatTime(newCycle)}.`;
    showMutationToast(saved, message, {
      actionLabel: "Desfazer",
      onAction: () => {
        state.scenarios[scenarioKey].activities = cloneData(snapshot);
        const undoSaved = commitAndRender();
        refreshSuggestedStart();
        showMutationToast(undoSaved, "Horários anteriores restaurados.");
      },
      duration: 8000,
    });
  }

  function copyCurrentToProposed() {
    // Guarda equivalente à de clearActiveScenario e exportMfvWorkbook: na aba Comparar não
    // há cenário ativo, e uma cópia disparada dali substituiria o Proposto sem contexto.
    if (!isScenarioView()) return;
    const source = state.scenarios.current;
    if (!source.activities.length) {
      showToast("Cadastre atividades no cenário Atual antes de copiar.", { error: true });
      return;
    }
    if (
      state.scenarios.proposed.activities.length &&
      !window.confirm("Substituir todo o cenário Proposto por uma cópia do cenário Atual?")
    ) {
      return;
    }
    state.scenarios.proposed = {
      unitsPerCycle: source.unitsPerCycle,
      activities: source.activities.map((activity) => ({ ...cloneData(activity), id: generateId() })),
    };
    if (activeView === "proposed") resetForm();
    const saved = commitAndRender();
    showMutationToast(saved, "Cenário Atual copiado para Proposto.");
  }

  function commitAndRender(options = {}) {
    state.updatedAt = new Date().toISOString();
    const saved = persistState();
    renderAll(options);
    return saved;
  }

  function schedulePersist() {
    setSaveStatus("saving", "Salvando…");
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      state.projectName = sanitizeProjectName(state.projectName);
      state.updatedAt = new Date().toISOString();
      persistState();
    }, 350);
  }

  function persistState() {
    window.clearTimeout(saveTimer);
    if (!storageAvailable) {
      setSaveStatus("error", "Sessão sem salvamento");
      return false;
    }
    setSaveStatus("saving", "Salvando…");
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.setTimeout(() => setSaveStatus("saved", "Salvo neste navegador"), 100);
      return true;
    } catch (_error) {
      storageAvailable = false;
      setSaveStatus("error", "Falha ao salvar");
      showToast("Não foi possível salvar no navegador. Exporte um backup JSON para não perder o estudo.", {
        error: true,
        duration: 8000,
      });
      return false;
    }
  }

  function setSaveStatus(status, message) {
    elements.saveStatus.classList.toggle("is-saving", status === "saving");
    elements.saveStatus.classList.toggle("is-error", status === "error");
    const dot = elements.saveStatus.querySelector(".status-dot");
    elements.saveStatus.replaceChildren(dot, document.createTextNode(` ${message}`));
  }

  function syncGlobalInputs() {
    elements.studyName.value = state.projectName;
    elements.shiftStart.value = formatClockTime(state.settings.shiftStartSeconds);
    elements.shiftEnd.value = formatClockTime(state.settings.shiftEndSeconds);
    elements.fridayStart.value = formatClockTime(state.settings.fridayStartSeconds);
    elements.fridayEnd.value = formatClockTime(state.settings.fridayEndSeconds);
    elements.operatorCount.value =
      state.settings.operatorCount === null ? "" : String(state.settings.operatorCount);
    elements.monthlyDemand.value = state.settings.monthlyDemandPieces === null ? "" : String(state.settings.monthlyDemandPieces);
    elements.workingDays.value = String(state.settings.workingDaysPerMonth);
    elements.shiftsPerDay.value = String(state.settings.shiftsPerDay);
    elements.actualPieces.value = state.settings.actualPiecesProduced === null ? "" : String(state.settings.actualPiecesProduced);
  }

  function renderAll(options = {}) {
    renderShiftSettings({ preserveRows: Boolean(options.preserveBreakRows) });
    renderTabs();
    renderKpis();
    renderWorkspaceMode();
    if (activeView === "compare") renderComparisonPanel();
    else if (isScenarioView()) renderEditor();
    if (activeView !== "videos") renderTimeline();
    renderClassificationSummary();
    renderPrintReport();
  }

  function renderTabs() {
    elements.tabs.forEach((tab) => {
      const active = tab.dataset.view === activeView;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) elements.workspace.setAttribute("aria-labelledby", tab.id);
    });
  }

  function renderKpis() {
    const comparison = calculateComparison();
    const current = comparison.current;
    const proposed = comparison.proposed;
    const plan = current.productionPlan;
    elements.kpiCurrentCycle.textContent = formatTime(current.schedule.cycleSeconds);
    elements.kpiProposedCycle.textContent = formatTime(proposed.schedule.cycleSeconds);
    elements.kpiCurrentActivities.textContent = pluralizeActivity(current.schedule.items.length);
    elements.kpiProposedActivities.textContent = pluralizeActivity(proposed.schedule.items.length);
    elements.kpiCurrentProduction.textContent = current.schedule.cycleSeconds
      ? productionFormatter.format(current.productionPerShift)
      : "—";
    elements.kpiProposedProduction.textContent = proposed.schedule.cycleSeconds
      ? productionFormatter.format(proposed.productionPerShift)
      : "—";
    elements.kpiCurrentPerCycle.textContent = `${numberFormatter.format(state.scenarios.current.unitsPerCycle)} un./ciclo`;
    elements.kpiProposedPerCycle.textContent = `${numberFormatter.format(state.scenarios.proposed.unitsPerCycle)} un./ciclo`;

    elements.kpiTakt.textContent = formatTaktTime(plan.taktSeconds);
    elements.kpiTaktDetail.textContent =
      plan.demandPerShift === null
        ? "Informe a demanda mensal"
        : `${productionFormatter.format(plan.demandPerShift)} peças/turno`;

    clearSemanticCard(elements.actualProductionCard);
    elements.kpiActualProduction.textContent =
      plan.actualPieces === null ? "—" : `${numberFormatter.format(plan.actualPieces)} peças`;
    if (plan.actualPieces === null) {
      elements.kpiActualCoverage.textContent = "Informe a produção realizada";
    } else if (plan.actualCoveragePercent === null) {
      elements.kpiActualCoverage.textContent = "Demanda por turno não informada";
    } else {
      const delta = plan.actualDelta || 0;
      const deltaText = `${delta >= 0 ? "+" : "−"}${productionFormatter.format(Math.abs(delta))} peças`;
      elements.kpiActualCoverage.textContent = `${percentFormatter.format(plan.actualCoveragePercent)}% da meta · ${deltaText}`;
      applySemanticCard(elements.actualProductionCard, plan.actualCoveragePercent - 100);
    }

    clearSemanticCard(elements.gainCard);
    // "Cenário sem atividades" e "produção deu zero" são situações diferentes. Em
    // "Ciclos completos", um ciclo maior que o turno zera a produção mesmo com os dois
    // cenários preenchidos — e o cartão pedia para cadastrar o que já estava cadastrado.
    const missingScenario = current.schedule.items.length === 0 || proposed.schedule.items.length === 0;
    if (missingScenario) {
      elements.kpiGain.textContent = "—";
      elements.kpiGainPercent.textContent = "Cadastre os dois cenários";
    } else if (current.productionPerShift <= 0) {
      elements.kpiGain.textContent = "—";
      elements.kpiGainPercent.textContent = "Nenhum ciclo completo cabe no turno";
    } else {
      const sign = comparison.gain > 0 ? "+" : "";
      elements.kpiGain.textContent = `${sign}${productionFormatter.format(comparison.gain)}`;
      elements.kpiGainPercent.textContent = `${formatSignedPercent(comparison.gainPercent)} versus Atual`;
      applySemanticCard(elements.gainCard, comparison.gain);
    }

    clearSemanticCard(elements.cycleReductionCard);
    if (current.schedule.cycleSeconds <= 0 || proposed.schedule.cycleSeconds <= 0) {
      elements.kpiCycleReduction.textContent = "—";
      elements.kpiCycleDelta.textContent = "Cadastre os dois cenários";
    } else {
      elements.kpiCycleReduction.textContent = formatSignedPercent(comparison.cycleReductionPercent);
      // O percentual já é positivo quando o ciclo cai. Escrever "−00:00:57" ao lado de
      // "+31,7%" fazia a mesma informação aparecer com dois sinais opostos no mesmo cartão.
      const deltaSuffix =
        comparison.cycleDelta > 0 ? "a menos no ciclo" : comparison.cycleDelta < 0 ? "a mais no ciclo" : "no ciclo";
      elements.kpiCycleDelta.textContent = `${formatTime(Math.abs(comparison.cycleDelta))} ${deltaSuffix}`;
      applySemanticCard(elements.cycleReductionCard, comparison.cycleDelta);
    }
  }

  function renderShiftSettings(options = {}) {
    const plan = calculateProductionPlan();
    elements.breaksEmpty.hidden = state.settings.breaks.length > 0;
    if (!options.preserveRows) {
      elements.breakList.replaceChildren();
      state.settings.breaks.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "break-row";
      row.dataset.breakId = item.id;

      const nameField = document.createElement("label");
      nameField.className = "break-field break-field-name";
      const nameLabel = document.createElement("span");
      nameLabel.textContent = "Intervalo";
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.maxLength = 60;
      nameInput.value = item.label;
      nameInput.dataset.breakField = "label";
      nameInput.setAttribute("aria-label", `Nome do intervalo ${index + 1}`);
      nameField.append(nameLabel, nameInput);

      const startField = document.createElement("label");
      startField.className = "break-field";
      const startLabel = document.createElement("span");
      startLabel.textContent = "Início";
      const startInput = document.createElement("input");
      startInput.type = "time";
      startInput.step = "1";
      startInput.value = formatClockTime(item.startSeconds);
      startInput.dataset.breakField = "startSeconds";
      startInput.setAttribute("aria-label", `Início de ${item.label}`);
      startField.append(startLabel, startInput);

      const endField = document.createElement("label");
      endField.className = "break-field";
      const endLabel = document.createElement("span");
      endLabel.textContent = "Fim";
      const endInput = document.createElement("input");
      endInput.type = "time";
      endInput.step = "1";
      endInput.value = formatClockTime(item.endSeconds);
      endInput.dataset.breakField = "endSeconds";
      endInput.setAttribute("aria-label", `Fim de ${item.label}`);
      endField.append(endLabel, endInput);

      const duration = document.createElement("span");
      duration.className = "break-duration";
      duration.innerHTML = `<small>Duração</small><strong>${formatTime(clockDistance(item.startSeconds, item.endSeconds))}</strong>`;

      const remove = document.createElement("button");
      remove.className = "row-action break-remove";
      remove.type = "button";
      remove.dataset.breakAction = "delete";
      remove.innerHTML = ICONS.delete;
      remove.setAttribute("aria-label", `Remover intervalo ${item.label}`);
      remove.title = "Remover intervalo";

        row.append(nameField, startField, endField, duration, remove);
        elements.breakList.appendChild(row);
      });
    }
    elements.grossShiftSummary.textContent = formatTime(plan.week.grossShiftSeconds);
    elements.grossFridaySummary.textContent = formatTime(plan.friday.grossShiftSeconds);
    elements.breakDurationSummary.textContent = formatTime(plan.breakSeconds);
    elements.availableShiftSummary.textContent = formatTime(plan.availableSeconds);
    elements.breakDurationSummary.closest("span").classList.toggle("has-overlap", plan.hasOverlappingBreaks);
    elements.breakDurationSummary.title = plan.hasOverlappingBreaks
      ? "Existem intervalos sobrepostos; o período coincidente é descontado apenas uma vez."
      : "Soma dos intervalos programados.";
  }

  function clearSemanticCard(card) {
    card.classList.remove("is-positive", "is-negative");
  }

  function applySemanticCard(card, value) {
    card.classList.toggle("is-positive", value > 0);
    card.classList.toggle("is-negative", value < 0);
  }

  function formatSignedPercent(value) {
    if (value === null || !Number.isFinite(value)) return "—";
    const sign = value > 0 ? "+" : "";
    return `${sign}${percentFormatter.format(value)}%`;
  }

  function pluralizeActivity(count) {
    return `${count} ${count === 1 ? "atividade" : "atividades"}`;
  }

  function renderWorkspaceMode() {
    const scenarioView = isScenarioView();
    const videosView = activeView === "videos";
    elements.editorPanel.hidden = !scenarioView;
    elements.comparisonPanel.hidden = activeView !== "compare";
    elements.videoWorkspace.hidden = !videosView;
    // A linha do tempo pertence aos cenários; na aba de vídeos ela não faz sentido.
    if (elements.timelinePanel) elements.timelinePanel.hidden = videosView;
    elements.videoAnalysisButton.hidden = videosView;
    if (elements.mfvExportButton) elements.mfvExportButton.hidden = !scenarioView;
    elements.copyScenarioButton.hidden = !scenarioView;
    elements.videoDestination.value = videoDestination;
  }

  function renderEditor() {
    if (!isScenarioView()) return;
    const scenario = state.scenarios[activeView];
    const meta = SCENARIOS[activeView];
    const metrics = calculateMetrics(activeView);
    elements.scenarioKicker.textContent = meta.kicker;
    elements.scenarioTitle.textContent = `Atividades do cenário ${meta.label}`;
    elements.unitsPerCycle.value = String(scenario.unitsPerCycle);
    elements.availableTimeMini.textContent = formatTime(metrics.availableSeconds);
    elements.clearScenarioButton.disabled = scenario.activities.length === 0;
    elements.resequenceButton.disabled = scenario.activities.length === 0;
    elements.emptyList.hidden = scenario.activities.length > 0;
    elements.activityList.hidden = scenario.activities.length === 0;
    const overlapCount = metrics.schedule.items.filter((item) => item.isOverlapping).length;
    elements.activityListSummary.textContent = scenario.activities.length
      ? `${pluralizeActivity(scenario.activities.length)}${
          overlapCount ? ` · ${overlapCount} com sobreposição` : " · sem sobreposições"
        }`
      : "Nenhuma atividade cadastrada";
    renderActivityList(metrics.schedule);
  }

  function renderActivityList(schedule) {
    elements.activityList.replaceChildren();
    const fragment = document.createDocumentFragment();
    schedule.items.forEach((item, index) => {
      const activity = state.scenarios[activeView].activities[index];
      const li = document.createElement("li");
      li.className = "activity-item";
      li.dataset.id = activity.id;
      li.draggable = true;

      const order = document.createElement("div");
      order.className = "activity-order";
      order.textContent = String(index + 1).padStart(2, "0");
      order.title = "Arraste para reordenar a atividade; os horários não serão alterados";
      order.setAttribute("aria-hidden", "true");

      const main = document.createElement("div");
      main.className = "activity-main";
      const nameRow = document.createElement("div");
      nameRow.className = "activity-name-row";
      const name = document.createElement("span");
      name.className = "activity-name";
      name.textContent = activity.description;
      name.title = activity.description;
      const classChip = document.createElement("span");
      classChip.className = `class-chip ${activity.classification}`;
      classChip.textContent = CLASSIFICATIONS[activity.classification].label;
      nameRow.append(name, classChip);

      const meta = document.createElement("div");
      meta.className = "activity-meta";
      appendMeta(meta, `Início ${formatTime(item.startSeconds)}`);
      appendMeta(meta, `Duração ${formatTime(activity.durationSeconds)}`, true);
      appendMeta(meta, `Fim ${formatTime(item.endSeconds)}`, true);
      if (item.isOverlapping) {
        const timingChip = document.createElement("span");
        timingChip.className = "timing-chip";
        timingChip.textContent = "Com sobreposição";
        meta.appendChild(timingChip);
      }
      if (activity.videoSource) {
        const videoChip = document.createElement("span");
        videoChip.className = "video-source-chip";
        videoChip.textContent = `Vídeo ${formatMediaTime(activity.videoSource.startSeconds)} → ${formatMediaTime(
          activity.videoSource.endSeconds,
        )}`;
        const videoSourceDescription = `Origem: ${activity.videoSource.fileName}; FPS de análise ${numberFormatter.format(
          activity.videoSource.analysisFps,
        )}; intervalo exato ${formatMediaTime(
          activity.videoSource.exactDurationSeconds ??
            roundToMilliseconds(activity.videoSource.endSeconds - activity.videoSource.startSeconds),
        )}`;
        videoChip.title = videoSourceDescription;
        videoChip.setAttribute("aria-label", `${videoChip.textContent}. ${videoSourceDescription}`);
        meta.appendChild(videoChip);
      }
      main.append(nameRow, meta);

      const actions = document.createElement("div");
      actions.className = "activity-actions";
      actions.append(
        createRowAction("up", "Mover atividade para cima", index === 0),
        createRowAction("down", "Mover atividade para baixo", index === schedule.items.length - 1),
        createRowAction("duplicate", "Duplicar atividade"),
        createRowAction("edit", "Editar atividade"),
        createRowAction("delete", "Excluir atividade", false, "delete"),
      );

      li.append(order, main, actions);
      fragment.appendChild(li);
    });
    elements.activityList.appendChild(fragment);
  }

  function appendMeta(container, text, separator) {
    if (separator) {
      const dot = document.createElement("span");
      dot.className = "meta-separator";
      dot.textContent = "·";
      dot.setAttribute("aria-hidden", "true");
      container.appendChild(dot);
    }
    const value = document.createElement("span");
    value.textContent = text;
    container.appendChild(value);
  }

  function createRowAction(action, label, disabled = false, extraClass = "") {
    const button = document.createElement("button");
    button.className = `row-action ${extraClass}`.trim();
    button.type = "button";
    button.dataset.action = action;
    button.setAttribute("aria-label", label);
    button.title = label;
    button.disabled = disabled;
    button.innerHTML = ICONS[action];
    return button;
  }

  function renderComparisonPanel() {
    const comparison = calculateComparison();
    const bothReady = comparison.current.schedule.cycleSeconds > 0 && comparison.proposed.schedule.cycleSeconds > 0;
    elements.comparisonCallout.classList.remove("is-positive", "is-negative");

    if (!bothReady) {
      elements.comparisonHeadline.textContent = "Cadastre os dois cenários";
      elements.comparisonDescription.textContent =
        "A comparação de ciclo e produção aparecerá quando Atual e Proposto tiverem atividades.";
    } else if (comparison.gain > 0) {
      elements.comparisonCallout.classList.add("is-positive");
      elements.comparisonHeadline.textContent = `O cenário Proposto aumenta a produção em ${productionFormatter.format(
        comparison.gain,
      )} un./turno`;
      // "redução de ciclo de +31,7%" soava contraditório. O percentual é positivo quando o
      // ciclo cai, então a frase precisa nomear o sentido em vez de repetir o sinal.
      elements.comparisonDescription.textContent = `Variação de ${formatSignedPercent(
        comparison.gainPercent,
      )} e ${comparison.cycleDelta >= 0 ? "redução" : "aumento"} de ciclo de ${percentFormatter.format(
        Math.abs(comparison.cycleReductionPercent),
      )}%.`;
    } else if (comparison.gain < 0) {
      elements.comparisonCallout.classList.add("is-negative");
      elements.comparisonHeadline.textContent = `O cenário Proposto reduz a produção em ${productionFormatter.format(
        Math.abs(comparison.gain),
      )} un./turno`;
      elements.comparisonDescription.textContent = `Variação de ${formatSignedPercent(
        comparison.gainPercent,
      )} em relação ao cenário Atual.`;
    } else {
      elements.comparisonHeadline.textContent = "Os cenários têm produção equivalente";
      elements.comparisonDescription.textContent = "Revise o ciclo, a produção por ciclo e as premissas do turno.";
    }

    const rows = [
      ["Atividades", pluralizeActivity(comparison.current.schedule.items.length), pluralizeActivity(comparison.proposed.schedule.items.length)],
      ["Tempo de ciclo", formatTime(comparison.current.schedule.cycleSeconds), formatTime(comparison.proposed.schedule.cycleSeconds)],
      ["Tempo acumulado", formatTime(comparison.current.totalActivitySeconds), formatTime(comparison.proposed.totalActivitySeconds)],
      ["Produção por ciclo", numberFormatter.format(state.scenarios.current.unitsPerCycle), numberFormatter.format(state.scenarios.proposed.unitsPerCycle)],
      ["Ciclos por turno", productionFormatter.format(comparison.current.cyclesPerShift), productionFormatter.format(comparison.proposed.cyclesPerShift)],
      ["Produção por turno", productionFormatter.format(comparison.current.productionPerShift), productionFormatter.format(comparison.proposed.productionPerShift)],
    ];
    elements.comparisonTableBody.replaceChildren();
    rows.forEach(([label, currentValue, proposedValue]) => {
      const tr = document.createElement("tr");
      [label, currentValue, proposedValue].forEach((value) => {
        const td = document.createElement("td");
        td.textContent = String(value);
        tr.appendChild(td);
      });
      elements.comparisonTableBody.appendChild(tr);
    });
  }

  function renderTimeline() {
    elements.timelineContent.replaceChildren();
    if (activeView === "compare") {
      elements.timelineKicker.textContent = "CENÁRIOS · COMPARAÇÃO";
      elements.timelineTitle.textContent = "Linhas do tempo comparadas";
      elements.timelineSubtitle.textContent = "Os dois cenários usam a mesma escala horizontal.";
      const current = calculateMetrics("current");
      const proposed = calculateMetrics("proposed");
      const sharedScale = niceScale(Math.max(current.schedule.cycleSeconds, proposed.schedule.cycleSeconds));
      elements.timelineContent.append(
        createComparisonChart("current", current, sharedScale),
        createComparisonChart("proposed", proposed, sharedScale),
      );
      elements.timelineAccessibleSummary.textContent = `Comparação entre cenário Atual, ciclo ${formatTime(
        current.schedule.cycleSeconds,
      )}, e Proposto, ciclo ${formatTime(proposed.schedule.cycleSeconds)}.`;
      return;
    }

    const meta = SCENARIOS[activeView];
    const metrics = calculateMetrics(activeView);
    elements.timelineKicker.textContent = `CENÁRIO · ${meta.label.toUpperCase()}`;
    elements.timelineTitle.textContent = `Linha do tempo do cenário ${meta.label}`;
    elements.timelineSubtitle.textContent = "Cada barra usa o início absoluto informado; sobreposições e lacunas são permitidas.";
    if (!metrics.schedule.items.length) {
      elements.timelineContent.appendChild(createTimelineEmpty(`cenário ${meta.label}`));
      elements.timelineAccessibleSummary.textContent = `O cenário ${meta.label} ainda não possui atividades.`;
    } else {
      elements.timelineContent.appendChild(createTimelineFigure(activeView, metrics, niceScale(metrics.schedule.cycleSeconds)));
      elements.timelineAccessibleSummary.textContent = createAccessibleTimelineSummary(meta.label, metrics.schedule);
    }
  }

  function createComparisonChart(scenarioKey, metrics, sharedScale) {
    const article = document.createElement("article");
    article.className = "compare-chart";
    const header = document.createElement("div");
    header.className = "compare-chart-header";
    const title = document.createElement("strong");
    title.textContent = `Cenário ${SCENARIOS[scenarioKey].label}`;
    const metric = document.createElement("span");
    metric.textContent = `Ciclo ${formatTime(metrics.schedule.cycleSeconds)} · ${pluralizeActivity(
      metrics.schedule.items.length,
    )}`;
    header.append(title, metric);
    article.appendChild(header);
    article.appendChild(
      metrics.schedule.items.length
        ? createTimelineFigure(scenarioKey, metrics, sharedScale)
        : createTimelineEmpty(`cenário ${SCENARIOS[scenarioKey].label}`),
    );
    return article;
  }

  function createTimelineEmpty(context) {
    const empty = document.createElement("div");
    empty.className = "timeline-empty";
    const content = document.createElement("div");
    content.className = "timeline-empty-content";
    const strong = document.createElement("strong");
    strong.textContent = "Linha do tempo aguardando atividades";
    const text = document.createElement("p");
    text.textContent = `Cadastre a sequência no ${context} para gerar o diagrama automaticamente.`;
    content.append(strong, text);
    empty.appendChild(content);
    return empty;
  }

  function createTimelineFigure(scenarioKey, metrics, scaleSeconds) {
    const scroll = document.createElement("div");
    scroll.className = "timeline-scroll";
    const schedule = metrics.schedule;
    const width = 1000;
    const left = 252;
    const right = 24;
    const top = 42;
    const rowHeight = 42;
    const bottom = 34;
    const plotWidth = width - left - right;
    const height = top + schedule.items.length * rowHeight + bottom;
    const svg = svgElement("svg", {
      class: "timeline-svg",
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      "aria-label": `Linha do tempo do cenário ${SCENARIOS[scenarioKey].label}`,
    });
    const title = svgElement("title");
    title.textContent = `Linha do tempo — cenário ${SCENARIOS[scenarioKey].label}`;
    const desc = svgElement("desc");
    desc.textContent = `${schedule.items.length} atividades. Tempo de ciclo ${formatTime(
      schedule.cycleSeconds,
    )}.`;
    svg.append(title, desc);

    schedule.stages.forEach((stage, stageIndex) => {
      const firstIndex = stage.itemIndexes[0];
      const stageY = top + firstIndex * rowHeight;
      const stageHeight = stage.itemIndexes.length * rowHeight;
      svg.appendChild(
        svgElement("rect", {
          x: 8,
          y: stageY,
          width: width - 16,
          height: stageHeight,
          rx: 7,
          fill: stageIndex % 2 === 0 ? "#FFFFFF" : "#F6F6F8",
          class: stageIndex % 2 === 0 ? "gantt-svg-stage-even" : "gantt-svg-stage-odd",
        }),
      );
      const stageLabel = svgElement("text", {
        x: left - 10,
        y: stageY + 13,
        class: "stage-label",
        "text-anchor": "end",
      });
      stageLabel.textContent = `#${stageIndex + 1}`;
      svg.appendChild(stageLabel);

      if (stage.itemIndexes.length > 1) {
        const connectorX = left + (stage.start / scaleSeconds) * plotWidth;
        svg.appendChild(
          svgElement("line", {
            x1: connectorX,
            y1: stageY + 8,
            x2: connectorX,
            y2: stageY + stageHeight - 8,
            stroke: SCENARIOS[scenarioKey].color,
            "stroke-width": 1.4,
            "stroke-dasharray": "2 2",
            opacity: 0.65,
          }),
        );
      }
    });

    const tickStep = niceTickStep(scaleSeconds, 8);
    for (let tick = 0; tick <= scaleSeconds + 0.001; tick += tickStep) {
      const x = left + (tick / scaleSeconds) * plotWidth;
      svg.appendChild(
        svgElement("line", {
          x1: x,
          y1: top - 8,
          x2: x,
          y2: height - bottom + 4,
          class: tick === 0 ? "axis-line" : "grid-line",
        }),
      );
      const label = svgElement("text", {
        x,
        y: 24,
        class: "axis-label",
        "text-anchor": tick === 0 ? "start" : tick >= scaleSeconds ? "end" : "middle",
      });
      label.textContent = formatAxisTime(tick, scaleSeconds);
      svg.appendChild(label);
    }

    schedule.items.forEach((item, index) => {
      const classification = CLASSIFICATIONS[item.classification];
      const rowY = top + index * rowHeight;
      const barY = rowY + 10;
      const x = left + (item.startSeconds / scaleSeconds) * plotWidth;
      const exactWidth = (item.durationSeconds / scaleSeconds) * plotWidth;
      const barWidth = Math.max(exactWidth, 1);

      const codeCircle = svgElement("rect", {
        x: 15,
        y: rowY + 12,
        width: 20,
        height: 20,
        rx: 6,
        fill: classification.color,
      });
      const code = svgElement("text", {
        x: 25,
        y: rowY + 26,
        class: "row-code",
        fill: classification.textColor,
        "text-anchor": "middle",
      });
      code.textContent = classification.short;
      const label = svgElement("text", {
        x: 43,
        y: rowY + 25,
        class: "row-label",
      });
      label.textContent = truncateLabel(item.description, 30);
      const labelTitle = svgElement("title");
      labelTitle.textContent = item.description;
      label.appendChild(labelTitle);

      const hitWidth = Math.max(barWidth, 16);
      const hitArea = svgElement("rect", {
        x: Math.max(left, x - Math.max(0, (16 - barWidth) / 2)),
        y: barY + 3,
        width: hitWidth,
        height: 18,
        rx: 6,
        fill: "transparent",
        class: "bar-hit-area",
        tabindex: "0",
        role: "img",
        "aria-label": `${item.description}. ${classification.label}. Início ${formatTime(
          item.startSeconds,
        )}. Duração ${formatTime(item.durationSeconds)}. Fim ${formatTime(item.endSeconds)}.`,
      });
      const tooltip = svgElement("title");
      tooltip.textContent = `${item.description}\n${classification.label}\nInício: ${formatTime(
        item.startSeconds,
      )}\nDuração: ${formatTime(item.durationSeconds)}\nFim: ${formatTime(item.endSeconds)}`;
      hitArea.appendChild(tooltip);
      const bar = svgElement("rect", {
        x,
        y: barY,
        width: barWidth,
        height: 24,
        rx: Math.min(6, barWidth / 2),
        fill: classification.color,
        class: "bar",
        "pointer-events": "none",
      });

      svg.append(codeCircle, code, label, hitArea, bar);

      const durationText = svgElement("text", {
        y: rowY + 26,
        class: "duration-label",
      });
      if (barWidth >= 75) {
        durationText.setAttribute("x", String(x + barWidth / 2));
        durationText.setAttribute("text-anchor", "middle");
        durationText.setAttribute("fill", classification.textColor);
      } else {
        durationText.setAttribute("x", String(Math.min(x + barWidth + 5, width - right - 2)));
        durationText.setAttribute("text-anchor", x + barWidth + 80 > width - right ? "end" : "start");
      }
      durationText.textContent = formatTime(item.durationSeconds);
      svg.appendChild(durationText);

      if (item.isOverlapping) {
        const parallelLabel = svgElement("text", {
          x: Math.max(left + 2, x),
          y: rowY + 8,
          class: "parallel-label",
        });
        parallelLabel.textContent = "sobreposição";
        svg.appendChild(parallelLabel);
      }

      svg.appendChild(
        svgElement("line", {
          x1: 14,
          y1: rowY + rowHeight,
          x2: width - 14,
          y2: rowY + rowHeight,
          stroke: "#ECECF0",
          class: "gantt-svg-row-divider",
          "stroke-width": 1,
        }),
      );
    });

    if (schedule.cycleSeconds > 0) {
      const cycleX = left + (schedule.cycleSeconds / scaleSeconds) * plotWidth;
      svg.appendChild(
        svgElement("line", {
          x1: cycleX,
          y1: top - 8,
          x2: cycleX,
          y2: height - bottom + 4,
          class: "cycle-line",
        }),
      );
      const cycleLabel = svgElement("text", {
        x: Math.min(cycleX + 5, width - right),
        y: height - 10,
        class: "axis-label",
        "text-anchor": cycleX + 120 > width - right ? "end" : "start",
        fill: SCENARIOS[scenarioKey].color,
      });
      cycleLabel.textContent = `Ciclo ${formatTime(schedule.cycleSeconds)}`;
      svg.appendChild(cycleLabel);
    }

    scroll.appendChild(svg);
    return scroll;
  }

  function svgElement(tagName, attributes = {}) {
    const element = document.createElementNS(SVG_NS, tagName);
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
    return element;
  }

  function truncateLabel(text, maxLength) {
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
  }

  function niceTickStep(maxSeconds, desiredTicks) {
    const rough = maxSeconds / desiredTicks;
    const magnitude = 10 ** Math.floor(Math.log10(Math.max(rough, 1)));
    const normalized = rough / magnitude;
    const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return nice * magnitude;
  }

  function niceScale(maxSeconds) {
    if (!maxSeconds || maxSeconds <= 0) return 60;
    const step = niceTickStep(maxSeconds, 8);
    return Math.max(step, Math.ceil(maxSeconds / step) * step);
  }

  function createAccessibleTimelineSummary(label, schedule) {
    const parts = schedule.items.map(
      (item, index) =>
        `${index + 1}. ${item.description}, ${CLASSIFICATIONS[item.classification].label}, início ${formatTime(
          item.startSeconds,
        )}, duração ${formatTime(item.durationSeconds)}, fim ${formatTime(item.endSeconds)}${
          item.videoSource
            ? `, medido no vídeo entre ${formatMediaTime(item.videoSource.startSeconds)} e ${formatMediaTime(
                item.videoSource.endSeconds,
              )}`
            : ""
        }`,
    );
    return `Cenário ${label}. Tempo de ciclo ${formatTime(schedule.cycleSeconds)}. ${parts.join("; ")}.`;
  }

  function renderClassificationSummary() {
    elements.classificationSummary.replaceChildren();
    const metricsByScenario = isScenarioView()
      ? { [activeView]: calculateMetrics(activeView) }
      : { current: calculateMetrics("current"), proposed: calculateMetrics("proposed") };

    Object.entries(CLASSIFICATIONS).forEach(([key, classification]) => {
      const card = document.createElement("article");
      card.className = "classification-card";
      const label = document.createElement("span");
      const dot = document.createElement("i");
      dot.className = "class-dot";
      dot.style.backgroundColor = classification.color;
      dot.setAttribute("aria-hidden", "true");
      label.append(dot, document.createTextNode(classification.label));
      const value = document.createElement("strong");

      if (!isScenarioView()) {
        value.textContent = `${formatTime(metricsByScenario.current.classSeconds[key])} → ${formatTime(
          metricsByScenario.proposed.classSeconds[key],
        )}`;
        value.title = `Atual ${formatTime(metricsByScenario.current.classSeconds[key])}; Proposto ${formatTime(
          metricsByScenario.proposed.classSeconds[key],
        )}`;
      } else {
        const metrics = metricsByScenario[activeView];
        const seconds = metrics.classSeconds[key];
        const percent = metrics.totalActivitySeconds > 0 ? (seconds / metrics.totalActivitySeconds) * 100 : 0;
        value.textContent = `${formatTime(seconds)} · ${percentFormatter.format(percent)}%`;
      }
      card.append(label, value);
      elements.classificationSummary.appendChild(card);
    });
  }

  function renderPrintReport() {
    if (!elements.printReportContent) return;
    const comparison = calculateComparison();
    const content = elements.printReportContent;
    content.replaceChildren();
    // A tela já esconde ganho e redução enquanto falta um dos cenários. O relatório
    // imprimia mesmo assim, e um cenário vazio virava "Ganho -100%" no documento do
    // cliente. Estas duas checagens replicam a guarda que renderKpis usa.
    const currentReady = comparison.current.schedule.items.length > 0;
    const proposedReady = comparison.proposed.schedule.items.length > 0;
    const comparable = currentReady && proposedReady && comparison.current.productionPerShift > 0;
    const maxActivities = Math.max(
      comparison.current.schedule.items.length,
      comparison.proposed.schedule.items.length,
    );
    content.className = maxActivities > 18 ? "is-ultra-dense" : maxActivities > 11 ? "is-dense" : "";

    const header = document.createElement("header");
    header.className = "print-report-header";
    const brand = document.createElement("div");
    brand.className = "print-report-brand";
    const heading = document.createElement("div");
    const kicker = document.createElement("span");
    kicker.className = "print-brand-title";
    kicker.textContent = "Consultoria Lean Manufacturing";
    const title = document.createElement("h1");
    title.className = "print-report-title";
    title.textContent = state.projectName;
    heading.append(kicker, title);
    brand.append(heading);
    const plan = comparison.current.productionPlan;
    const meta = document.createElement("div");
    meta.className = "print-report-meta";
    meta.append(
      printMetaItem(
        "Seg a Qui",
        `${formatClockTime(state.settings.shiftStartSeconds)} - ${formatClockTime(state.settings.shiftEndSeconds)}`,
      ),
      printMetaItem(
        "Sex",
        `${formatClockTime(state.settings.fridayStartSeconds)} - ${formatClockTime(state.settings.fridayEndSeconds)}`,
      ),
      printMetaItem(
        "Operadores",
        state.settings.operatorCount === null
          ? "—"
          : numberFormatter.format(state.settings.operatorCount),
      ),
      printMetaItem("Emitido", new Date().toLocaleString("pt-BR")),
    );
    header.append(brand, meta);
    content.appendChild(header);

    const kpis = document.createElement("section");
    kpis.className = "print-report-kpis";
    [
      ["Ciclo Atual", formatTime(comparison.current.schedule.cycleSeconds)],
      ["Ciclo Proposto", formatTime(comparison.proposed.schedule.cycleSeconds)],
      ["Takt time", formatTaktTime(plan.taktSeconds)],
      ["Tempo disponível", formatTime(plan.availableSeconds)],
      [
        "Produção Atual",
        currentReady ? `${productionFormatter.format(comparison.current.productionPerShift)} un./turno` : "—",
      ],
      [
        "Produção Proposta",
        proposedReady ? `${productionFormatter.format(comparison.proposed.productionPerShift)} un./turno` : "—",
      ],
      ["Realizado no turno", plan.actualPieces === null ? "—" : `${numberFormatter.format(plan.actualPieces)} peças`],
      ["Atendimento", plan.actualCoveragePercent === null ? "—" : `${percentFormatter.format(plan.actualCoveragePercent)}%`],
    ].forEach(([label, value]) => {
      const card = document.createElement("article");
      card.className = "print-report-kpi";
      const span = document.createElement("span");
      span.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = value;
      card.append(span, strong);
      kpis.appendChild(card);
    });
    content.appendChild(kpis);

    const planning = document.createElement("section");
    planning.className = "print-report-planning";
    const breakDetails = state.settings.breaks.length
      ? state.settings.breaks
          .map(
            (item) =>
              `${item.label} ${formatClockTime(item.startSeconds)} - ${formatClockTime(item.endSeconds)}`,
          )
          .join(" · ")
      : "Nenhum intervalo programado";
    const demandDetails =
      plan.demandPerShift === null
        ? "Demanda mensal não informada"
        : `${numberFormatter.format(state.settings.monthlyDemandPieces)} peças/mês ÷ ${state.settings.workingDaysPerMonth} dias ÷ ${state.settings.shiftsPerDay} turno(s) = ${productionFormatter.format(plan.demandPerShift)} peças/turno`;
    planning.innerHTML = `
      <div><strong>Jornada (média da semana)</strong><span>Seg a Qui ${formatTime(
        plan.week.grossShiftSeconds,
      )} · Sex ${formatTime(plan.friday.grossShiftSeconds)} · Bruto médio ${formatTime(
        plan.grossShiftSeconds,
      )} · Intervalos ${formatTime(plan.breakSeconds)} · Disponível ${formatTime(
        plan.availableSeconds,
      )}</span></div>
      <div><strong>Paradas</strong><span></span></div>
      <div><strong>Demanda</strong><span></span></div>
    `;
    planning.children[1].querySelector("span").textContent = breakDetails;
    planning.children[2].querySelector("span").textContent = demandDetails;
    content.appendChild(planning);

    const scenarios = document.createElement("section");
    scenarios.className = "print-report-scenarios";
    scenarios.classList.toggle("print-current-empty", comparison.current.schedule.items.length === 0);
    scenarios.classList.toggle("print-proposed-empty", comparison.proposed.schedule.items.length === 0);
    // Mesma régua para os dois cenários, como a tela já faz em renderTimeline. É o que
    // torna a comparação impressa honesta: barras iguais representam tempos iguais.
    const sharedPrintScale = niceScale(
      Math.max(comparison.current.schedule.cycleSeconds, comparison.proposed.schedule.cycleSeconds),
    );
    scenarios.append(
      createPrintScenario("current", comparison.current, sharedPrintScale),
      createPrintScenario("proposed", comparison.proposed, sharedPrintScale),
    );
    content.appendChild(scenarios);

    const comparisonBox = document.createElement("section");
    comparisonBox.className = "print-report-comparison";
    const comparisonTitle = document.createElement("strong");
    comparisonTitle.textContent = "Comparação consolidada";
    const comparisonText = document.createElement("span");
    if (!currentReady || !proposedReady) {
      comparisonText.textContent =
        "Ganho e variação de ciclo ficam disponíveis quando os cenários Atual e Proposto tiverem atividades cadastradas.";
    } else if (!comparable) {
      comparisonText.textContent =
        "No critério “Ciclos completos”, nenhum ciclo do cenário Atual cabe no turno disponível: não há base de produção para calcular o ganho.";
    } else {
      // O ganho é positivo quando a produção sobe; a variação do ciclo é positiva quando o
      // tempo cai. Os dois sinais agora seguem a mesma leitura: positivo é melhora.
      const cycleImproved = comparison.cycleDelta > 0;
      comparisonText.textContent = `Ganho ${comparison.gain >= 0 ? "+" : ""}${productionFormatter.format(
        comparison.gain,
      )} un./turno (${formatSignedPercent(comparison.gainPercent)}) · ${
        cycleImproved ? "Redução" : "Aumento"
      } do ciclo ${formatTime(Math.abs(comparison.cycleDelta))} (${formatSignedPercent(
        comparison.cycleReductionPercent,
      )})`;
    }
    const actualText = document.createElement("p");
    actualText.textContent =
      plan.actualPieces === null
        ? "Produção realizada no turno ainda não informada."
        : plan.actualCoveragePercent === null
          ? `Produção realizada no turno: ${numberFormatter.format(plan.actualPieces)} peças; informe a demanda para calcular o atendimento.`
          : `Produção realizada no turno: ${numberFormatter.format(plan.actualPieces)} peças · atendimento ${percentFormatter.format(
              plan.actualCoveragePercent,
            )}% · diferença ${plan.actualDelta >= 0 ? "+" : "-"}${productionFormatter.format(
              Math.abs(plan.actualDelta),
            )} peças/turno.`;
    comparisonBox.append(comparisonTitle, comparisonText, actualText);
    content.appendChild(comparisonBox);

    const footer = document.createElement("footer");
    footer.className = "print-report-footer";
    const footerNote = document.createElement("span");
    footerNote.textContent =
      "Tempos de classificação são acumulados por atividade e podem superar o ciclo quando há sobreposição.";
    const footerBrand = document.createElement("span");
    footerBrand.textContent = "Consultoria Lean Manufacturing";
    footer.append(footerNote, footerBrand);
    content.appendChild(footer);
  }

  function printMetaItem(label, value) {
    const item = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    item.append(strong, document.createTextNode(value));
    return item;
  }

  function createPrintScenario(scenarioKey, metrics, scaleSeconds) {
    const article = document.createElement("article");
    article.className = `print-report-scenario print-${scenarioKey}`;
    const header = document.createElement("div");
    header.className = "print-report-scenario-header";
    const title = document.createElement("h2");
    title.textContent = `Cenário ${SCENARIOS[scenarioKey].label}`;
    const summary = document.createElement("span");
    summary.textContent = `${numberFormatter.format(state.scenarios[scenarioKey].unitsPerCycle)} un./ciclo · ${
      metrics.schedule.items.length
    } atividades · ${formatTime(metrics.totalActivitySeconds)} acumulados`;
    header.append(title, summary);
    article.appendChild(header);

    const table = document.createElement("table");
    table.className = "print-report-table";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["#", "Atividade", "Classe"].forEach((label) => {
      const th = document.createElement("th");
      th.textContent = label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    const tbody = document.createElement("tbody");
    if (!metrics.schedule.items.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 3;
      cell.textContent = "Nenhuma atividade cadastrada";
      row.appendChild(cell);
      tbody.appendChild(row);
    } else {
      metrics.schedule.items.forEach((item, index) => {
        const row = document.createElement("tr");
        [
          String(index + 1),
          item.description,
          CLASSIFICATIONS[item.classification].label,
        ].forEach((value) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.appendChild(cell);
        });
        tbody.appendChild(row);
      });
    }
    table.append(thead, tbody);
    article.appendChild(table);

    const classificationSummary = document.createElement("section");
    classificationSummary.className = "print-report-classification";
    const classSeconds = Object.fromEntries(Object.keys(CLASSIFICATIONS).map((key) => [key, 0]));
    state.scenarios[scenarioKey].activities.forEach((activity) => {
      if (Object.hasOwn(classSeconds, activity.classification)) {
        classSeconds[activity.classification] += activity.durationSeconds;
      }
    });
    const totalClassSeconds = Object.values(classSeconds).reduce((sum, seconds) => sum + seconds, 0);
    Object.entries(CLASSIFICATIONS).forEach(([key, classification]) => {
      const totalSeconds = classSeconds[key];
      const percent = totalClassSeconds > 0 ? (totalSeconds / totalClassSeconds) * 100 : 0;
      const item = document.createElement("article");
      item.className = "print-report-classification-item";
      const label = document.createElement("span");
      const dot = document.createElement("i");
      dot.style.backgroundColor = classification.color;
      label.append(dot, document.createTextNode(classification.label));
      const value = document.createElement("strong");
      value.textContent = totalClassSeconds > 0 ? `${formatTime(totalSeconds)} · ${percentFormatter.format(percent)}%` : "—";
      item.append(label, value);
      classificationSummary.appendChild(item);
    });
    article.appendChild(classificationSummary);
    article.appendChild(createPrintTimeline(scenarioKey, metrics.schedule, scaleSeconds));
    return article;
  }

  function createPrintTimeline(scenarioKey, schedule, scaleSeconds) {
    const container = document.createElement("div");
    container.className = "print-report-timeline";
    if (!schedule.items.length) {
      const empty = document.createElement("span");
      empty.className = "print-report-timeline-empty";
      empty.textContent = `Cenário ${SCENARIOS[scenarioKey].label} sem atividades para representar.`;
      container.appendChild(empty);
      return container;
    }
    const content = elements.printReportContent;
    const inverseScale = content ? (parseFloat(content.style.getPropertyValue("--print-inverse-scale")) || 1) : 1;
    const width = 800 * inverseScale;
    const left = 38;
    const right = 12;
    const top = 40;
    const bottom = 12;
    const otherScenarioKey = scenarioKey === "current" ? "proposed" : "current";
    const otherScenarioIsEmpty = state.scenarios[otherScenarioKey].activities.length === 0;
    const isA3 = document.body.classList.contains("print-paper-a3");
    // With both scenarios present, the SVG only needs a compact intrinsic
    // height: CSS expands it to the available scenario panel. A large fixed
    // viewBox here would force both panels past the A4 page before fitting.
    const preferredHeight = otherScenarioIsEmpty ? (isA3 ? 850 : 700) : isA3 ? 300 : 220;
    const height = Math.max(preferredHeight, top + schedule.items.length * 34 + bottom);
    const rowHeight = (height - top - bottom) / schedule.items.length;
    const barHeight = Math.min(36, Math.max(9, rowHeight * 0.38));
    const plotWidth = width - left - right;
    // A escala vem de fora para que Atual e Proposto sejam desenhados na mesma régua.
    // Quando cada cenário usava a própria escala, o cenário mais rápido ocupava a mesma
    // largura de papel que o mais lento e a melhoria desaparecia visualmente.
    const scale = scaleSeconds || niceScale(schedule.cycleSeconds);
    const svg = svgElement("svg", {
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: "none",
      role: "img",
      "aria-label": `Linha do tempo ampliada do cenário ${SCENARIOS[scenarioKey].label}`,
    });
    schedule.items.forEach((_item, index) => {
      const rowTop = top + index * rowHeight;
      if (index % 2 === 1) {
        svg.appendChild(
          svgElement("rect", {
            x: 0,
            y: rowTop,
            width,
            height: rowHeight,
            fill: "#F9F9FB",
            class: "print-row-background",
          }),
        );
      }
      svg.appendChild(
        svgElement("line", {
          x1: 0,
          y1: rowTop + rowHeight,
          x2: width,
          y2: rowTop + rowHeight,
          class: "print-lane-line",
        }),
      );
    });
    const tickStep = niceTickStep(scale, 6);
    for (let tick = 0; tick <= scale + 0.001; tick += tickStep) {
      const x = left + (tick / scale) * plotWidth;
      svg.appendChild(
        svgElement("line", { x1: x, y1: top - 8, x2: x, y2: height - bottom, class: "print-grid-line" }),
      );
      const label = svgElement("text", {
        x,
        y: 23,
        class: "print-axis-label",
        "text-anchor": tick ? "middle" : "start",
      });
      label.textContent = formatAxisTime(tick, scale);
      svg.appendChild(label);
    }
    schedule.items.forEach((item, index) => {
      const rowTop = top + index * rowHeight;
      const barY = rowTop + (rowHeight - barHeight) / 2;
      const barX = left + (item.startSeconds / scale) * plotWidth;
      const barWidth = Math.max(2, (item.durationSeconds / scale) * plotWidth);
      const rowNumber = svgElement("text", {
        x: 18,
        y: rowTop + rowHeight / 2 + 4,
        class: "print-row-number",
        "text-anchor": "middle",
      });
      rowNumber.textContent = String(index + 1).padStart(2, "0");
      svg.appendChild(rowNumber);
      svg.appendChild(
        svgElement("rect", {
          x: barX,
          y: barY,
          width: barWidth,
          height: barHeight,
          rx: Math.min(5, barHeight / 2),
          fill: CLASSIFICATIONS[item.classification].color,
          class: "print-activity-bar",
        }),
      );
      const duration = svgElement("text", {
        x: barWidth >= 90 ? barX + barWidth / 2 : Math.min(width - right, barX + barWidth + 7),
        y: barY + barHeight / 2 + 4,
        class: "print-duration-label",
        "text-anchor": barWidth >= 90 ? "middle" : "start",
        fill: barWidth >= 90 ? CLASSIFICATIONS[item.classification].textColor : "#1D1D1F",
      });
      duration.textContent = formatTime(item.durationSeconds);
      svg.appendChild(duration);
    });
    const cycleX = left + (schedule.cycleSeconds / scale) * plotWidth;
    svg.appendChild(
      svgElement("line", {
        x1: cycleX,
        y1: top - 8,
        x2: cycleX,
        y2: height - bottom,
        class: "print-cycle-line",
      }),
    );
    container.appendChild(svg);
    return container;
  }

  function openPrintDialog() {
    renderPrintReport();
    if (!elements.printDialog) {
      confirmPrint();
      return;
    }
    if (typeof elements.printDialog.showModal === "function") elements.printDialog.showModal();
    else elements.printDialog.setAttribute("open", "");
  }

  function closePrintDialog() {
    if (!elements.printDialog) return;
    if (typeof elements.printDialog.close === "function") elements.printDialog.close();
    else elements.printDialog.removeAttribute("open");
  }

  function confirmPrint() {
    const selected = document.querySelector('input[name="printPaper"]:checked');
    const paper = selected && selected.value === "A3" ? "a3" : "a4";
    closePrintDialog();
    resetPrintState();
    document.body.classList.add(`print-paper-${paper}`);
    applyEstimatedPrintScale(paper);
    renderPrintReport();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.print();
      });
    });
  }

  function applyEstimatedPrintScale(paper) {
    const availableHeight = paper === "a3" ? 1062 : 748;
    const estimatedHeight = estimatePrintContentHeight(paper);
    applyPrintScale(Math.min(1, availableHeight / Math.max(estimatedHeight, 1)));
  }

  function applyPrintScale(scale) {
    const content = elements.printReportContent;
    if (!content) return;
    const safeScale = Math.max(0.01, Math.min(1, Number(scale) || 1));
    content.style.setProperty("--print-scale", String(safeScale));
    content.style.setProperty("--print-inverse-scale", String(1 / safeScale));
  }

  function clearPrintScale() {
    const content = elements.printReportContent;
    if (!content) return;
    content.style.removeProperty("--print-scale-y");
    // Remove values possibly left by studies saved with an earlier print fitter.
    content.style.removeProperty("--print-scale");
    content.style.removeProperty("--print-inverse-scale");
    content.style.removeProperty("width");
    content.style.removeProperty("height");
    content.style.removeProperty("min-height");
  }

  function fitPrintReportToPage() {
    const report = elements.printReport;
    const content = elements.printReportContent;
    if (!report || !content) return;

    clearPrintScale();
    renderPrintReport();
    
    const availableWidth = report.clientWidth;
    const availableHeight = report.clientHeight;
    if (!availableWidth || !availableHeight) {
      applyEstimatedPrintScale(document.body.classList.contains("print-paper-a3") ? "a3" : "a4");
      renderPrintReport();
      return;
    }

    // Measure once without a transform. Proportional scale with width expansion
    // guarantees that every row reaches the same sheet without text distortion.
    void content.offsetHeight;
    const contentRect = content.getBoundingClientRect();
    const descendants = Array.from(content.querySelectorAll("*"));
    const maxBottom = descendants.reduce(
      (maximum, node) => Math.max(maximum, node.getBoundingClientRect().bottom),
      contentRect.bottom,
    );
    const requiredHeight = Math.max(content.scrollHeight, content.offsetHeight, maxBottom - contentRect.top);
    const maxActivities = Math.max(
      state.scenarios.current.activities.length,
      state.scenarios.proposed.activities.length,
    );
    const safetyFactor = maxActivities > 100 ? 0.9 : maxActivities > 50 ? 0.95 : 0.997;
    let scale = (availableHeight / Math.max(requiredHeight, 1)) * safetyFactor;
    // Chromium can dispatch beforeprint for a named A3 page while it is still
    // reporting the default A4 preview box. Compensate only in that transient
    // layout; browsers that already expose the A3 height need no adjustment.
    if (document.body.classList.contains("print-paper-a3") && availableHeight < 900) {
      scale *= 1.335;
    }
    scale = Math.min(1, scale);
    applyPrintScale(scale);
    renderPrintReport();
  }

  function estimatePrintContentHeight(paper) {
    const a3 = paper === "a3";
    const descriptionCharsPerLine = a3 ? 32 : 22;
    const videoCharsPerLine = a3 ? 28 : 18;
    const lineHeight = a3 ? 11 : 9;
    const rowPadding = a3 ? 10 : 7;
    const timelineMinimum = a3 ? 250 : 150;
    const scenarioHeights = Object.keys(SCENARIOS).map((scenarioKey) => {
      const schedule = calculateSchedule(state.scenarios[scenarioKey].activities);
      const rowsHeight = schedule.items.reduce((sum, item) => {
        const descriptionLines = Math.max(1, Math.ceil(item.description.length / descriptionCharsPerLine));
        const videoLength = item.videoSource
          ? item.videoSource.fileName.length + formatMediaTime(item.videoSource.startSeconds).length * 2 + 5
          : 1;
        const videoLines = Math.max(1, Math.ceil(videoLength / videoCharsPerLine));
        return sum + Math.max(descriptionLines, videoLines) * lineHeight + rowPadding;
      }, schedule.items.length ? 0 : lineHeight + rowPadding);
      // Header plus the three classification cards above the table/timeline.
      return 86 + Math.max(rowsHeight, timelineMinimum);
    });
    const fixedHeight = a3 ? 285 : 245;
    return fixedHeight + scenarioHeights.reduce((sum, value) => sum + value, 0);
  }

  function resetPrintState() {
    document.body.classList.remove("print-paper-a4", "print-paper-a3");
    clearPrintScale();
  }

  function toggleFileMenu() {
    const opening = elements.fileMenu.hidden;
    elements.fileMenu.hidden = !opening;
    elements.moreButton.setAttribute("aria-expanded", String(opening));
  }

  function closeFileMenu() {
    elements.fileMenu.hidden = true;
    elements.moreButton.setAttribute("aria-expanded", "false");
  }

  function handleFileMenu(event) {
    const button = event.target.closest("[data-menu-action]");
    if (!button) return;
    const action = button.dataset.menuAction;
    closeFileMenu();
    if (action === "help") openHelp();
    if (action === "print") openPrintDialog();
    if (action === "export") exportBackup();
    if (action === "import") elements.importInput.click();
    if (action === "reset") resetAllData();
  }

  function exportBackup() {
    const backup = { ...cloneData(state), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileSafeName(state.projectName)}-grafico-gantt.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    showToast("Backup JSON exportado.");
  }

  // A aba EP separa "Almoço" de "Pausas/Dia" em dois campos, enquanto o estudo mantém uma
  // lista única de intervalos. A divisão usa o rótulo escrito pelo usuário: qualquer
  // intervalo chamado "Almoço" entra no primeiro campo, o resto soma como pausa.
  //
  // A união é calculada dentro de cada grupo, seguindo o mesmo critério do tempo
  // disponível: dois intervalos sobrepostos são descontados uma vez só.
  function splitBreakSecondsForMfv() {
    const groups = { lunch: [], pause: [] };
    state.settings.breaks.forEach((item) => {
      const label = String(item.label || "").toLowerCase();
      const key = label.includes("almoço") || label.includes("almoco") ? "lunch" : "pause";
      const startOffset = shiftOffset(item.startSeconds, state.settings.shiftStartSeconds);
      groups[key].push({
        start: startOffset,
        end: startOffset + clockDistance(item.startSeconds, item.endSeconds),
      });
    });

    const unionSeconds = (intervals) => {
      const sorted = intervals.slice().sort((a, b) => a.start - b.start || a.end - b.end);
      let total = 0;
      let current = null;
      sorted.forEach((interval) => {
        if (!current || interval.start >= current.end) {
          if (current) total += current.end - current.start;
          current = { start: interval.start, end: interval.end };
        } else {
          current.end = Math.max(current.end, interval.end);
        }
      });
      if (current) total += current.end - current.start;
      return total;
    };

    return { lunchSeconds: unionSeconds(groups.lunch), pauseSeconds: unionSeconds(groups.pause) };
  }

  async function exportMfvWorkbook() {
    if (!isScenarioView()) {
      showToast("Abra o cenário Atual ou Proposto para escolher qual será enviado à planilha MFV.", {
        error: true,
        duration: 6500,
      });
      return;
    }
    const activities = state.scenarios[activeView].activities;
    if (!activities.length) {
      showToast("Cadastre ao menos uma atividade antes de baixar a planilha MFV.", { error: true });
      return;
    }
    // O mapa de fluxo de valor representa apenas as operações que agregam valor.
    // Semiagrega e Não agrega continuam no estudo e na linha do tempo, mas não viram
    // caixas de processo no MFV.
    const valueAdding = activities.filter((activity) => activity.classification === "agrega");
    const excluded = activities.length - valueAdding.length;
    if (!valueAdding.length) {
      showToast(
        "O mapa MFV recebe apenas as operações que agregam valor. Classifique ao menos uma atividade como Agrega.",
        { error: true, duration: 7500 },
      );
      return;
    }
    // O limite vem do próprio exportador: é a quantidade de caixas de processo que o mapa
    // da aba "MFV EP" consegue desenhar.
    const mfvLimit = (window.MfvExporter && window.MfvExporter.maxActivities) || 9;
    if (valueAdding.length > mfvLimit) {
      showToast(
        `O mapa da planilha MFV desenha no máximo ${mfvLimit} operações que agregam valor, e o cenário tem ${valueAdding.length}.`,
        { error: true, duration: 7500 },
      );
      return;
    }
    if (!window.MfvExporter || typeof window.MfvExporter.download !== "function") {
      showToast("O gerador da planilha MFV não pôde ser carregado.", { error: true, duration: 7000 });
      return;
    }
    try {
      const breakSplit = splitBreakSecondsForMfv();
      await window.MfvExporter.download({
        projectName: state.projectName,
        scenarioLabel: SCENARIOS[activeView].label,
        activities: cloneData(valueAdding),
        shift: {
          startSeconds: state.settings.shiftStartSeconds,
          endSeconds: state.settings.shiftEndSeconds,
          fridayStartSeconds: state.settings.fridayStartSeconds,
          fridayEndSeconds: state.settings.fridayEndSeconds,
          pauseSeconds: breakSplit.pauseSeconds,
          lunchSeconds: breakSplit.lunchSeconds,
          monthlyDemandPieces: state.settings.monthlyDemandPieces,
          workingDaysPerMonth: state.settings.workingDaysPerMonth,
          operators: state.settings.operatorCount,
        },
      });
      const sent = `${valueAdding.length} ${valueAdding.length === 1 ? "operação" : "operações"} que ${
        valueAdding.length === 1 ? "agrega" : "agregam"
      } valor`;
      const left = excluded
        ? ` ${excluded} ${excluded === 1 ? "atividade ficou" : "atividades ficaram"} fora do mapa por não agregar valor.`
        : "";
      showToast(`Planilha MFV do cenário ${SCENARIOS[activeView].label} gerada com ${sent}.${left}`, {
        duration: excluded ? 7500 : 5000,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao gerar a planilha.";
      showToast(`Não foi possível gerar a planilha MFV: ${message}`, { error: true, duration: 8000 });
    }
  }

  function fileSafeName(value) {
    return sanitizeProjectName(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "estudo";
  }

  async function importBackup(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("O arquivo de backup excede o limite de 5 MB.", { error: true });
      return;
    }
    try {
      const imported = normalizeState(JSON.parse(await file.text()));
      if (!window.confirm(`Importar “${imported.projectName}” e substituir o estudo atual?`)) return;
      state = imported;
      activeView = "current";
      resetForm();
      syncGlobalInputs();
      const saved = commitAndRender();
      showToast(
        saved
          ? "Backup importado com sucesso."
          : "Backup carregado nesta sessão, mas não foi possível salvá-lo no navegador.",
        saved ? {} : { error: true, duration: 8000 },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Arquivo inválido.";
      showToast(`Não foi possível importar: ${message}`, { error: true, duration: 7000 });
    }
  }

  function resetAllData() {
    if (!window.confirm("Apagar os dois cenários e todos os parâmetros deste estudo?")) return;
    state = createDefaultState();
    activeView = "current";
    resetForm();
    syncGlobalInputs();
    let removedFromStorage = false;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      storageAvailable = true;
      removedFromStorage = true;
    } catch (_error) {
      storageAvailable = false;
    }
    renderAll();
    showToast(
      removedFromStorage
        ? "Dados da aplicação apagados."
        : "O estudo foi limpo nesta sessão, mas o armazenamento do navegador não pôde ser apagado.",
      removedFromStorage ? {} : { error: true, duration: 8000 },
    );
    setSaveStatus(storageAvailable ? "saved" : "error", storageAvailable ? "Estudo vazio" : "Sessão sem salvamento");
  }

  function openHelp() {
    if (typeof elements.helpDialog.showModal === "function") elements.helpDialog.showModal();
    else elements.helpDialog.setAttribute("open", "");
  }

  function closeHelp() {
    if (typeof elements.helpDialog.close === "function") elements.helpDialog.close();
    else elements.helpDialog.removeAttribute("open");
  }

  function showMutationToast(saved, successMessage, options = {}) {
    const { failureMessage, ...toastOptions } = options;
    if (saved) {
      showToast(successMessage, toastOptions);
      return;
    }
    showToast(
      failureMessage || "Alteração aplicada somente nesta sessão. Exporte um backup JSON para preservá-la.",
      { ...toastOptions, error: true, duration: Math.max(Number(toastOptions.duration) || 0, 8000) },
    );
  }

  function showToast(message, options = {}) {
    window.clearTimeout(toastTimer);
    elements.toast.classList.toggle("is-error", Boolean(options.error));
    elements.toastMessage.textContent = message;
    elements.toast.hidden = false;
    elements.toastAction.hidden = !options.actionLabel;
    elements.toastAction.textContent = options.actionLabel || "";
    elements.toastAction.onclick = options.onAction
      ? () => {
          hideToast();
          options.onAction();
        }
      : null;
    toastTimer = window.setTimeout(hideToast, options.duration || 4200);
  }

  function hideToast() {
    window.clearTimeout(toastTimer);
    elements.toast.hidden = true;
    elements.toastAction.onclick = null;
  }

  function exposeTestApi() {
    window.TrabalhoPadronizado = Object.freeze({
      parseTime,
      formatTime,
      parseClockTime,
      formatClockTime,
      formatTaktTime,
      formatMediaTime,
      calculateSchedule: (activities) => calculateSchedule(cloneData(activities)),
      calculateShiftAvailability: (settings) =>
        cloneData(calculateShiftAvailability(settings ? cloneData(settings) : state.settings)),
      calculateProductionPlan: () => cloneData(calculateProductionPlan()),
      normalizeState: (raw) => cloneData(normalizeState(cloneData(raw))),
      getSnapshot: () => cloneData(state),
      getMetrics: () => cloneData(calculateComparison()),
      storageKey: STORAGE_KEY,
    });
  }

  function registerWebMcpTools() {
    const context = document.modelContext;
    if (!context || typeof context.registerTool !== "function") return;
    webMcpLifecycle = new AbortController();

    registerWebMcpTool(context, {
      name: "get_standard_work_summary",
      title: "Consultar estudo",
      description:
        "Lê jornada, intervalos, demanda, takt time e os cenários Atual e Proposto com suas atividades calculadas.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() {
        const comparison = calculateComparison();
        return {
          projectName: state.projectName,
          shift: {
            weekStart: formatClockTime(state.settings.shiftStartSeconds),
            weekEnd: formatClockTime(state.settings.shiftEndSeconds),
            fridayStart: formatClockTime(state.settings.fridayStartSeconds),
            fridayEnd: formatClockTime(state.settings.fridayEndSeconds),
            grossDuration: formatTime(comparison.current.productionPlan.grossShiftSeconds),
            breakDuration: formatTime(comparison.current.productionPlan.breakSeconds),
            availableDuration: formatTime(comparison.current.productionPlan.availableSeconds),
            breaks: state.settings.breaks.map((item) => ({
              label: item.label,
              start: formatClockTime(item.startSeconds),
              end: formatClockTime(item.endSeconds),
            })),
          },
          operatorCount: state.settings.operatorCount,
          monthlyDemandPieces: state.settings.monthlyDemandPieces,
          workingDaysPerMonth: state.settings.workingDaysPerMonth,
          shiftsPerDay: state.settings.shiftsPerDay,
          demandPerShift: comparison.current.productionPlan.demandPerShift,
          taktTime: formatTaktTime(comparison.current.productionPlan.taktSeconds),
          actualPiecesProduced: state.settings.actualPiecesProduced,
          actualCoveragePercent: comparison.current.productionPlan.actualCoveragePercent,
          current: webMcpScenarioSummary("current", comparison.current),
          proposed: webMcpScenarioSummary("proposed", comparison.proposed),
          gain: comparison.gain,
          gainPercent: comparison.gainPercent,
          cycleReductionPercent: comparison.cycleReductionPercent,
        };
      },
    });

    registerWebMcpTool(context, {
      name: "add_standard_work_activity",
      title: "Adicionar atividade",
      description:
        "Adiciona uma atividade ao fim do cenário Atual ou Proposto e atualiza o diagrama visível.",
      inputSchema: {
        type: "object",
        properties: {
          scenario: { type: "string", enum: ["current", "proposed"] },
          description: { type: "string", minLength: 1, maxLength: 180 },
          start: { type: "string", pattern: "^\\d{1,6}:[0-5]\\d:[0-5]\\d$" },
          duration: { type: "string", pattern: "^\\d{1,6}:[0-5]\\d:[0-5]\\d$" },
          classification: { type: "string", enum: ["agrega", "semiagrega", "nao-agrega"] },
        },
        required: ["scenario", "description", "duration", "classification"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== "object") throw new Error("Entrada inválida.");
        const scenarioKey = input.scenario;
        if (!Object.prototype.hasOwnProperty.call(SCENARIOS, scenarioKey)) {
          throw new Error("Cenário inválido.");
        }
        const activities = state.scenarios[scenarioKey].activities;
        if (activities.length >= MAX_ACTIVITIES) throw new Error("Limite de atividades atingido.");
        const description = String(input.description || "").trim();
        if (!description || description.length > 180) throw new Error("Descrição inválida.");
        const durationSeconds = parseTime(input.duration);
        if (durationSeconds === null) throw new Error("Duração inválida. Use HH:MM:SS.");
        if (!Object.prototype.hasOwnProperty.call(CLASSIFICATIONS, input.classification)) {
          throw new Error("Classificação inválida.");
        }
        const currentCycle = calculateSchedule(activities).cycleSeconds;
        const startSeconds = parseTime(input.start || formatTime(currentCycle), { allowZero: true });
        if (startSeconds === null) throw new Error("Início inválido. Use HH:MM:SS.");

        const activity = {
          id: generateId(),
          description,
          startSeconds,
          durationSeconds,
          classification: input.classification,
        };
        activities.push(activity);
        const saved = commitAndRender();
        const schedule = calculateSchedule(activities);
        const added = schedule.items.find((item) => item.id === activity.id);
        showMutationToast(saved, `Atividade adicionada ao cenário ${SCENARIOS[scenarioKey].label}.`);
        return {
          id: activity.id,
          scenario: scenarioKey,
          savedLocally: saved,
          start: formatTime(added.startSeconds),
          duration: formatTime(activity.durationSeconds),
          end: formatTime(added.endSeconds),
          cycle: formatTime(schedule.cycleSeconds),
        };
      },
    });
  }

  function registerWebMcpTool(context, tool) {
    try {
      void Promise.resolve(context.registerTool(tool, { signal: webMcpLifecycle.signal })).catch(() => {});
    } catch (_error) {
      // Navegadores sem uma implementação completa continuam com a interface convencional.
    }
  }

  function webMcpScenarioSummary(scenarioKey, metrics) {
    return {
      unitsPerCycle: state.scenarios[scenarioKey].unitsPerCycle,
      cycle: formatTime(metrics.schedule.cycleSeconds),
      productionPerShift: metrics.productionPerShift,
      activities: metrics.schedule.items.map((item) => ({
        id: item.id,
        description: item.description,
        classification: item.classification,
        overlapping: item.isOverlapping,
        start: formatTime(item.startSeconds),
        duration: formatTime(item.durationSeconds),
        end: formatTime(item.endSeconds),
        videoSource: item.videoSource
          ? {
              fileName: item.videoSource.fileName,
              start: formatMediaTime(item.videoSource.startSeconds),
              end: formatMediaTime(item.videoSource.endSeconds),
              exactDuration: formatMediaTime(
                item.videoSource.exactDurationSeconds ??
                  roundToMilliseconds(item.videoSource.endSeconds - item.videoSource.startSeconds),
              ),
              analysisFps: item.videoSource.analysisFps,
            }
          : null,
      })),
    };
  }
})();
