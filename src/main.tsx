import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import { HouseProvider } from "./context/HouseContext";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <BrowserRouter>
      <HouseProvider>
        <App />
      </HouseProvider>
    </BrowserRouter>
  </React.StrictMode>
);