import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import "primeicons/primeicons.css";
import { PrimeReactProvider } from "primereact/api";
import "primeflex/primeflex.css";
import "primereact/resources/primereact.css";

// NOTED
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";

// import "primereact/resources/themes/tailwind-light/theme.css";

// import "primereact/resources/themes/saga-blue/theme.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </StrictMode>
);
