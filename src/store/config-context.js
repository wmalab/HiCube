import React from "react";

const ConfigContext = React.createContext({
  cases: [],
  pairedLocks: {},
  threeCases: {},
  positionedTracks: {},
  positionedTracksToCaseUid: {},
  chromInfoPath: "",
  viewConfigs: {},
  numViews: 0,
  hgcRefs: {},
  addCase: () => {},
  addPairedCase: () => {},
  deleteCase: () => {},
  deleteAllCases: () => {},
  addZoomView: () => {},
  removeZoomView: () => {},
  updateOverlays: () => {},
  removeOverlays: () => {},
  updateTrackOptions: () => {},
  loadConfig: () => {},
  getCaseCopy: () => {},
  updateThreedOptions: () => {},
});

export default ConfigContext;
