import React from "react";

const ConfigContext = React.createContext({
  cases: [],
  threeCases: {},
  positionedTracks: {},
  chromInfoPath: "",
  viewConfigs: {},
  numViews: 0,
  addCase: () => {},
  addZoomView: () => {},
  removeZoomView: () => {},
  updateOverlays: () => {},
  removeOverlays: () => {},
  updateTrackOptions: () => {},
  loadConfig: () => {},
});

export default ConfigContext;
