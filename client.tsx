import { hydrateRoot } from "react-dom/client";
import { Ultra } from "@ultra/react";
import App from "./app/layout.tsx";

hydrateRoot(
  document,
  <Ultra>
    <App state={window.__ultra_renderState} />
  </Ultra>,
);
