import React from "react";

const ConfigContext = React.createContext({
  cases: [],
  threeCases: {},
  positionedTracks: {},
  positionedTracksToCaseUid: {},
  chromInfoPath: "",
  viewConfigs: {},
  numViews: 0,
  hgcRefs: {},
  addCase: () => {},
  addZoomView: () => {},
  removeZoomView: () => {},
  updateOverlays: () => {},
  removeOverlays: () => {},
  updateTrackOptions: () => {},
  loadConfig: () => {},
});

export default ConfigContext;
