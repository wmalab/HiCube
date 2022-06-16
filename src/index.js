import { StrictMode } from "react";
import React from "react";
import ReactDOM from "react-dom";
import ConfigProvider from "./store/ConfigProvider";
import App from "./App";

import "./index.css";

const rootElement = document.getElementById("root");

ReactDOM.render(
  <StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </StrictMode>,
  rootElement
);
