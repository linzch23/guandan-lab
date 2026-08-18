import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./app/App";
import { ProgressProvider } from "./features/progress/progress";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<StrictMode><HashRouter><ProgressProvider><App /></ProgressProvider></HashRouter></StrictMode>);
