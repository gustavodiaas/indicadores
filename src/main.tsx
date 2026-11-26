import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { runPendingWipe } from "./lib/wipe";

// Se o usuário pediu "Apagar dados", limpa antes de abrir o app.
runPendingWipe().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
