import { StrictMode } from "react";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import Viewer from "./components/Viewer";

const rootElement = document.getElementById("root");

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);
