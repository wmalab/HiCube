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
  panelSizes: {},
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
  updatePanelSizes: () => {},
  updateLocation: () => {},
});

export default ConfigContext;
