import React, { useState, useReducer, useEffect } from "react";
import ConfigContext from "./config-context";

// NOTE: context is suitable for low-frequency changes
// do NOT put location changes inside context

const defaultConfigs = {
  cases: [],
};

const configsReducer = (state, action) => {
  return defaultConfigs;
};

const ConfigProvider = (props) => {
  const viewConfigs = useState();
  const [configs, dispatchConfigsAction] = useReducer(
    configsReducer,
    defaultConfigs
  );

  useEffect(() => {
    // TODO: update viewConfigs
  }, [configs]);

  const configContext = {};

  return (
    <ConfigContext.Provider value={configContext}>
      {props.children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;
