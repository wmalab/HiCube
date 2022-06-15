import React from "react";

const ConfigContext = React.createContext({
  cases: [],
  positionedTracks: {},
  chromInfoPath: "",
  viewConfigs: {},
  addCase: () => {},
  addZoomView: () => {},
  removeZoomView: () => {},
  updateOverlays: () => {},
  removeOverlays: () => {},
  updateTrackOptions: () => {},
});

export default ConfigContext;
