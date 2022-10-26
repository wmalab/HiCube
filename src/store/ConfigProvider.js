import React, { useState, useReducer, useEffect, useRef } from "react";
import ConfigContext from "./config-context";
import TRACKS_INFO_BY_TYPE from "../configs/tracks-info-by-type";
import { uid, makeColorGradient } from "../utils";
import OPTIONS_INFO from "../configs/options-info";

// NOTE: context is suitable for low-frequency changes
// do NOT put location changes inside context
// NOTE: case UUIDs, data UUIDS, track UUIDs
// TODO: may need add views for zoom-in view
// NOTE: we also need the order of tracks
// TODO: where to include initialXDomain
// TODO: add height and width
// TODO: where to add zoomview and overlays in caseUids?
// TODO: 1d, 2d and 3d tracks in caseUids?

const MIN_HORIZONTAL_HEIGHT = 20;
const MIN_VERTICAL_WIDTH = 20;

const defaultConfigs = {
  cases: [],
  pairedLocks: {},
  positionedTracks: {}, // uid indexed track config
  positionedTracksToCaseUid: {},
  threeCases: {},
  chromInfoPath: "",
  viewConfigs: {},
  numViews: 0,
};

const deepCopy = (view) => JSON.parse(JSON.stringify(view));

// TODO: need main/zoom/3d views, contents for combined track, overlays
const addView = (hic, tracks) => {
  const view = {
    "2d": {
      uid: uid(),
      type: "combined",
      contents: [
        {
          uid: uid(),
          datatype: hic.datatype,
          tilesetUid: hic.tilesetUid,
          server: hic.server,
          type: hic.tracktype,
          name: hic.name,
        },
      ],
    },
    "1d": tracks.map((track) => ({
      dataUid: uid(),
      pairDataUid: track.pairDataUid,
      type: track.tracktype,
      tilesetUid: track.tilesetUid,
      server: track.server,
      datatype: track.datatype,
      name: track.name,
      positions: Object.keys(track.positions).reduce((prev, curr) => {
        if (track.positions[curr]) {
          prev[curr] = uid();
        }
        return prev;
      }, {}),
    })),
    layout: { w: 12, h: 12, x: 0, y: 0, static: true },
    overlays: [],
    "3d": {
      uid: uid(),
    },
  };
  return view;
};

const addDefaultOptions = (trackType) =>
  TRACKS_INFO_BY_TYPE[trackType].defaultOptions;

const positionToOrientation = (position) => {
  const orientations = {
    top: "horizontal",
    bottom: "horizontal",
    left: "vertical",
    right: "vertical",
  };
  return orientations[position];
};

const allTrackUids = (view) => {
  const trackUids = [];
  trackUids.push(view["2d"].uid);
  for (const track of view["1d"]) {
    for (const position in track.positions) {
      trackUids.push(track.positions[position]);
    }
  }
  return trackUids;
};

const viewsToViewConfig = (views, positionedTracks, chromInfoPath) => {
  const viewConfig = {
    editable: false,
    zoomFixed: false,
    views: [],
  };
  for (const view of views) {
    const newView = {
      uid: view.uid,
      initialXDomain: [...view.initialXDomain],
      initialYDomain: [...view.initialYDomain],
      chromInfoPath: chromInfoPath,
      tracks: { top: [], left: [], center: [], right: [], bottom: [] },
      layout: { ...view.layout },
      overlays: [],
    };
    newView.tracks.center.push({
      uid: view["2d"].uid, // FIXED: undefined cause re-generate uid
      type: "combined",
      contents: view["2d"].contents.map(
        (content) => positionedTracks[content.uid]
      ),
    });
    for (const track of view["1d"]) {
      for (const position in track.positions) {
        const trackUid = track.positions[position];
        newView.tracks[position].push(positionedTracks[trackUid]);
      }
    }
    for (const overlayUid of view.overlays) {
      newView.overlays.push({
        ...positionedTracks[overlayUid],
        includes: allTrackUids(view),
      });
    }
    viewConfig.views.push(newView);
  }
  return viewConfig;
};

const defaultHeightWidth = (trackType, position) => {
  const orientation = positionToOrientation(position);
  if (!orientation) {
    return undefined; // center track
  }
  const trackInfo = TRACKS_INFO_BY_TYPE[trackType];
  const defaultOptions = (trackInfo && trackInfo.defaultOptions) || {};
  if (orientation === "horizontal") {
    let height;
    height = defaultOptions.minHeight;
    if (height === undefined) {
      height = (trackInfo && trackInfo.defaultHeight) || MIN_HORIZONTAL_HEIGHT;
    }
    return height;
  }
  if (orientation === "vertical") {
    let width;
    width = defaultOptions.minWidth;
    if (width === undefined) {
      width = (trackInfo && trackInfo.defaultWidth) || MIN_VERTICAL_WIDTH;
    }
    return width;
  }
};

const configsReducer = (state, action) => {
  console.log("config reduce");
  if (action.type === "ADD_CASE" || action.type === "ADD_CASE_PAIRED") {
    const { chromInfoPath, centerHiC, threed, tracks, chroms } = action.config;
    const initialXDomain = [...action.config.initialXDomain];
    const initialYDomain = [...action.config.initialYDomain];

    const caseUid = uid();
    const view = addView(centerHiC, tracks);

    // generate pairedLocks --------------------
    const pairedLocks = {};
    if (action.type === "ADD_CASE_PAIRED" && state.cases.length > 0) {
      // add center hic lock
      // this should also be the positioned track uid for center hic
      const pairedCenterHiC = state.cases[0].views[0]["2d"].contents[0].uid;
      const currCenterHiC = view["2d"].contents[0].uid;
      pairedLocks[pairedCenterHiC] = currCenterHiC;
      pairedLocks[currCenterHiC] = pairedCenterHiC;
      // add supp track locks
      for (const track of view["1d"]) {
        // find the paired dataset
        const pairDataset = state.cases[0].views[0]["1d"].find(
          (dataset) => dataset.dataUid === track.pairDataUid
        );
        // pair with positioned trackUid
        for (const pos in track.positions) {
          const posUid = track.positions[pos];
          const pairedPosUid = pairDataset.positions[pos];
          pairedLocks[posUid] = pairedPosUid;
          pairedLocks[pairedPosUid] = posUid;
        }
      }
      // threed track config will be stored separately
    }
    // -----------------------------------------------

    const positionedTracks = {};
    const positionedTracksToCaseUid = {}; // positionedTrackUid => { caseUid }
    // create default track options for heatmap track
    positionedTracks[view["2d"].contents[0].uid] = {
      uid: view["2d"].contents[0].uid,
      type: view["2d"].contents[0].type,
      server: view["2d"].contents[0].server,
      tilesetUid: view["2d"].contents[0].tilesetUid,
      // TODO: dynamically calculate the height so the heatmap is square
      height: 170,
      // width: 260,
      options: {
        ...addDefaultOptions(view["2d"].contents[0].type),
        name: view["2d"].contents[0].name,
      },
    };

    positionedTracksToCaseUid[view["2d"].contents[0].uid] = {
      caseUid: caseUid,
    };

    // let cumHeight = 0;
    // let cumWidth = 0;

    // FIXME: linear-2d-rectangle-domains aliases are "horizontal-2d-rectangle-domains"
    // and "vertical-2d-rectangle-domains"
    // TODO: check track alias to get the name for horizontal and vertical track --
    // line => horizontal-line, vertical-line
    // point => horizontal-point, vertical-point
    // bar => horizontal-bar, vertical-bar
    // 1d-heatmap => horizontal-1d-heatmap, vertical-1d-heatmap
    // gene-annotations => horizontal-gene-annotations, vertical-gene-annotations
    // linear-2d-rectangle-domains => horizontal-2d-rectangle-domains, vertical-2d-rectangle-domains
    // chromosome-labels => horizontal-chromosome-labels, vertical-chromosome-labels
    // -----------------------------------------------------------------------------
    // FIXME: need to add position (hor/ver) to enable select on 1d tracks
    // create default track options for 1d tracks
    for (const track of view["1d"]) {
      for (const position in track.positions) {
        const trackUid = track.positions[position];
        positionedTracksToCaseUid[trackUid] = { caseUid: caseUid };
        // positioned track type from alias
        let positionedTrackType = track.type;
        const ori = positionToOrientation(position); // orientation
        const aliases = TRACKS_INFO_BY_TYPE[track.type].aliases;
        if (aliases && ori) {
          const alias = aliases.find((el) => el.startsWith(ori));
          if (alias) {
            positionedTrackType = alias;
          }
        }
        positionedTracks[trackUid] = {
          uid: trackUid,
          // type: positionToOrientation(position) + "-" + track.type,
          type: positionedTrackType,
          options: { ...addDefaultOptions(track.type), name: track.name },
        };
        positionedTracks[trackUid].server = track.server;
        positionedTracks[trackUid].tilesetUid = track.tilesetUid;
        const defaultHW = defaultHeightWidth(track.type, position);
        if (ori === "horizontal") {
          positionedTracks[trackUid].height = defaultHW;
          // cumHeight += defaultHW;
        } else if (ori === "vertical") {
          positionedTracks[trackUid].width = defaultHW;
          // cumWidth += defaultHW;
        }
        /*
        if (track.type !== "chromosome-labels") {
          positionedTracks[trackUid].server = track.server;
          positionedTracks[trackUid].tilesetUid = track.tilesetUid;
          if (ori === "horizontal") {
            positionedTracks[trackUid].height = 60;
            // positionedTracks[trackUid].width = 150;
          } else if (ori === "vertical") {
            positionedTracks[trackUid].width = 60;
            // positionedTracks[trackUid].height = 150;
          }
        } else {
          positionedTracks[trackUid].chromInfoPath = chromInfoPath;
          if (ori === "horizontal") {
            positionedTracks[trackUid].height = 30;
          } else if (ori === "vertical") {
            positionedTracks[trackUid].width = 30;
          }
        }
        */
      }
    }
    /*
    if (cumHeight > 250 || cumWidth > 250) {
      // TODO: dynamically change canvas size
      throw new Error("Too many tracks");
    }
    const centerHeight = 300 - cumWidth;
    positionedTracks[view["2d"].contents[0].uid].height = 200;
    console.log("centerHeight", centerHeight);
    */

    const views = [
      {
        ...view,
        uid: "aa",
        initialXDomain: initialXDomain,
        initialYDomain: initialYDomain,
      },
    ];

    // add zoom view if exist zoomLocation---------------------
    if (
      action.type === "ADD_CASE_PAIRED" &&
      action.config.zoomXDomain &&
      action.config.zoomYDomain
    ) {
      console.log("add paired zoom");
      const newView = deepCopy(views[0]);
      newView.uid = "bb";
      newView.initialXDomain = [...action.config.zoomXDomain];
      newView.initialYDomain = [...action.config.zoomYDomain];
      views.push(newView);
      const viewportUid = uid();
      const viewportType = "viewport-projection-center";
      views[0]["2d"].contents.push({
        type: viewportType,
        uid: viewportUid,
        fromViewUid: "bb",
      });
      positionedTracks[viewportUid] = {
        type: viewportType,
        uid: viewportUid,
        fromViewUid: "bb",
        options: addDefaultOptions(viewportType),
      };
    }
    // --------------------------------------------------------------

    const viewConfig = viewsToViewConfig(
      views,
      positionedTracks,
      chromInfoPath
    );

    let colormap = {};
    if (state.cases.length > 0 && state.cases[0].uid in state.threeCases) {
      colormap = state.threeCases[state.cases[0].uid].colormap;
    } else {
      const colors = makeColorGradient(chroms.length);
      for (let i = 0; i < chroms.length; i++) {
        colormap[chroms[i]] = colors[i];
      }
    }

    const updatedConfigs = {
      cases: state.cases.concat({ uid: caseUid, views: views }),
      pairedLocks: { ...state.pairedLocks, ...pairedLocks },
      positionedTracks: { ...state.positionedTracks, ...positionedTracks },
      positionedTracksToCaseUid: {
        ...state.positionedTracksToCaseUid,
        ...positionedTracksToCaseUid,
      },
      threeCases: {
        ...state.threeCases,
        [caseUid]: { ...threed, colormap },
      },
      chromInfoPath: chromInfoPath,
      viewConfigs: { ...state.viewConfigs, [caseUid]: viewConfig },
      numViews: state.numViews || 1,
    };
    return updatedConfigs;
  } else if (action.type === "ADD_ZOOMVIEW") {
    const [initialXYDomains, selectedXYDomains] = action.xyDomains;
    const { cases, positionedTracks, chromInfoPath } = state;

    const updatedCases = [];
    const updatedPositionedTracks = deepCopy(positionedTracks);
    const updatedViewConfigs = {};

    for (const prevCase of cases) {
      const newCase = deepCopy(prevCase);
      const views = newCase.views;
      // if already exist selected view, clear it
      // TODO: check each content if its type is viewport-projection-center
      // and delete it from positionedTracks and positionedTracksToCaseUid
      if (views.length === 2) {
        views.pop();
        views[0]["2d"].contents.pop();
      }
      views[0].initialXDomain = [...initialXYDomains.xDomain];
      views[0].initialYDomain = [...initialXYDomains.yDomain];
      // views[0].layout.w = 6;
      const newView = deepCopy(views[0]);
      newView.uid = "bb";
      newView.initialXDomain = [...selectedXYDomains.xDomain];
      newView.initialYDomain = [...selectedXYDomains.yDomain];
      // newView.layout.x = 6;
      // newView.layout.y = 12;
      views.push(newView);
      const viewportUid = uid();
      const viewportType = "viewport-projection-center";
      views[0]["2d"].contents.push({
        type: viewportType,
        uid: viewportUid,
        fromViewUid: "bb",
      });
      updatedPositionedTracks[viewportUid] = {
        type: viewportType,
        uid: viewportUid,
        fromViewUid: "bb",
        options: addDefaultOptions(viewportType),
      };
      updatedCases.push(newCase);
      const viewConfig = viewsToViewConfig(
        views,
        updatedPositionedTracks,
        chromInfoPath
      );
      updatedViewConfigs[newCase.uid] = viewConfig;
    }
    const updatedConfigs = {
      cases: updatedCases,
      pairedLocks: state.pairedLocks,
      threeCases: state.threeCases,
      positionedTracks: updatedPositionedTracks,
      positionedTracksToCaseUid: state.positionedTracksToCaseUid,
      chromInfoPath: chromInfoPath,
      viewConfigs: updatedViewConfigs,
      numViews: 2,
    };
    return updatedConfigs;
  } else if (action.type === "REMOVE_ZOOMVIEW") {
    const [initialXYDomains] = action.xyDomains;
    const { cases, positionedTracks, chromInfoPath } = state;

    const updatedCases = [];
    const updatedPositionedTracks = deepCopy(positionedTracks);
    const updatedViewConfigs = {};

    for (const prevCase of cases) {
      const newCase = deepCopy(prevCase);
      const views = newCase.views;
      // TODO: check each content type
      if (views.length === 2) {
        views.pop();
        views[0]["2d"].contents.pop();
        // TODO: delete trackOptions in positionedTracks
        // views[0].layout.w = 12;
      }
      views[0].initialXDomain = [...initialXYDomains.xDomain];
      views[0].initialYDomain = [...initialXYDomains.yDomain];
      updatedCases.push(newCase);
      const viewConfig = viewsToViewConfig(
        views,
        updatedPositionedTracks,
        chromInfoPath
      );
      updatedViewConfigs[newCase.uid] = viewConfig;
    }

    const updatedConfigs = {
      cases: updatedCases,
      pairedLocks: state.pairedLocks,
      threeCases: state.threeCases,
      positionedTracks: updatedPositionedTracks,
      positionedTracksToCaseUid: state.positionedTracksToCaseUid,
      chromInfoPath: chromInfoPath,
      viewConfigs: updatedViewConfigs,
      numViews: 1,
    };
    return updatedConfigs;
  } else if (action.type === "UPDATE_OVERLAYS") {
    const { overlays, xyDomains } = action;
    const { cases, positionedTracks, chromInfoPath } = state;
    const updatedCases = [];
    const updatedPositionedTracks = deepCopy(positionedTracks);
    const updatedViewConfigs = {};
    // TODO: separate overlay style for each case
    for (const overlay of overlays) {
      updatedPositionedTracks[overlay.uid] = {
        uid: overlay.uid,
        options: {
          extent: [overlay.extent],
          fill: overlay.options.higlass.fill,
          fillOpacity: +overlay.options.higlass.fillOpacity,
          stroke: overlay.options.higlass.stroke,
          strokeOpacity: +overlay.options.higlass.strokeOpacity,
          strokeWidth: +overlay.options.higlass.strokeWidth,
          strokePos: ["left", "right"],
        },
      };
    }
    for (const prevCase of cases) {
      const newCase = deepCopy(prevCase);
      const views = newCase.views;
      for (let i = 0; i < views.length; i++) {
        const view = views[i];
        view.initialXDomain = [...xyDomains[i].xDomain];
        view.initialYDomain = [...xyDomains[i].yDomain];
        view.overlays = overlays.map((overlay) => overlay.uid);
      }
      updatedCases.push(newCase);
      const viewConfig = viewsToViewConfig(
        views,
        updatedPositionedTracks,
        chromInfoPath
      );
      updatedViewConfigs[newCase.uid] = viewConfig;
    }
    const updatedConfigs = {
      cases: updatedCases,
      pairedLocks: state.pairedLocks,
      threeCases: state.threeCases,
      positionedTracks: updatedPositionedTracks,
      positionedTracksToCaseUid: state.positionedTracksToCaseUid,
      chromInfoPath: chromInfoPath,
      viewConfigs: updatedViewConfigs,
      numViews: state.numViews,
    };
    return updatedConfigs;
  } else if (action.type === "REMOVE_OVERLAYS") {
    // TODO: fix this if no exists overlays we can skip
    const { xyDomains } = action;
    const { cases, positionedTracks, chromInfoPath } = state;
    const updatedCases = [];
    const updatedPositionedTracks = deepCopy(positionedTracks);
    const updatedViewConfigs = {};
    // TODO: delete overlay in positionedTracks
    for (const prevCase of cases) {
      const newCase = deepCopy(prevCase);
      const views = newCase.views;
      for (let i = 0; i < views.length; i++) {
        const view = views[i];
        view.initialXDomain = [...xyDomains[i].xDomain];
        view.initialYDomain = [...xyDomains[i].yDomain];
        view.overlays = [];
      }
      updatedCases.push(newCase);
      const viewConfig = viewsToViewConfig(
        views,
        updatedPositionedTracks,
        chromInfoPath
      );
      updatedViewConfigs[newCase.uid] = viewConfig;
    }
    const updatedConfigs = {
      cases: updatedCases,
      pairedLocks: state.pairedLocks,
      threeCases: state.threeCases,
      positionedTracks: updatedPositionedTracks,
      positionedTracksToCaseUid: state.positionedTracksToCaseUid,
      chromInfoPath: chromInfoPath,
      viewConfigs: updatedViewConfigs,
      numViews: state.numViews,
    };
    return updatedConfigs;
  } else if (action.type === "UPDATE_TRACKS") {
    const { updatedTracks, xyDomains } = action;
    const { cases, positionedTracks, chromInfoPath, pairedLocks } = state;

    const updatedCases = [];
    const updatedPositionedTracks = deepCopy(positionedTracks);
    const updatedViewConfigs = {};

    for (const track of updatedTracks) {
      for (const option of track.options) {
        // option = { name, value }
        if (option.value !== undefined) {
          updatedPositionedTracks[track.uid].options[option.name] =
            option.value;
        }
      }
      // update pair locked tracks ---------------------------
      const pairedTrackUid = pairedLocks[track.uid];
      if (pairedTrackUid in updatedPositionedTracks) {
        for (const option of track.options) {
          if (option.value === undefined) {
            continue;
          }
          // FIXME: some options are not in defaultOptions e.g. dataTransform
          // instead need to check if is in availableOptions
          const availOptions =
            TRACKS_INFO_BY_TYPE[updatedPositionedTracks[pairedTrackUid].type]
              .availableOptions;
          if (availOptions.includes(option.name)) {
            // TODO: for option=dataTransform/maxZoom, make sure the paired track has the new value
            if (option.name === "dataTransform" || option.name === "maxZoom") {
              console.log("option.value", option.value);

              const inlineOptions = Object.values(
                OPTIONS_INFO[option.name].inlineOptions
              );
              // BEWARE: some option value can be null
              const isInlineOption =
                inlineOptions.findIndex((op) => op.value === option.value) >= 0;
              let isGeneratedOption = false;
              if (!isInlineOption) {
                // try with generated options
                const pairedTrackObj = action.hgcRefs.current[
                  state.positionedTracksToCaseUid[pairedTrackUid].caseUid
                ].api.getTrackObject("aa", pairedTrackUid);

                console.log("pairedTrackObj", pairedTrackObj);

                if (pairedTrackObj) {
                  const generatedOptions =
                    OPTIONS_INFO[option.name].generateOptions(pairedTrackObj);
                  console.log("generatedOptions", generatedOptions);
                  isGeneratedOption =
                    generatedOptions.findIndex(
                      (op) => op.value === option.value
                    ) >= 0;
                }
              }
              console.log("isInlineOption", isInlineOption, isGeneratedOption);
              if (isInlineOption || isGeneratedOption) {
                updatedPositionedTracks[pairedTrackUid].options[option.name] =
                  option.value;
              }
              // otherwise just don't update the paired track option value
            } else {
              updatedPositionedTracks[pairedTrackUid].options[option.name] =
                option.value;
            }
          }
        }
      }
    }
    // -----------------------------------------------------------

    for (const prevCase of cases) {
      const newCase = deepCopy(prevCase);
      const views = newCase.views;
      for (let i = 0; i < views.length; i++) {
        const view = views[i];
        view.initialXDomain = [...xyDomains[i].xDomain];
        view.initialYDomain = [...xyDomains[i].yDomain];
      }
      updatedCases.push(newCase);
      const viewConfig = viewsToViewConfig(
        views,
        updatedPositionedTracks,
        chromInfoPath
      );
      updatedViewConfigs[newCase.uid] = viewConfig;
    }

    const updatedConfigs = {
      cases: updatedCases,
      pairedLocks: pairedLocks,
      threeCases: state.threeCases,
      positionedTracks: updatedPositionedTracks,
      positionedTracksToCaseUid: state.positionedTracksToCaseUid,
      chromInfoPath: chromInfoPath,
      viewConfigs: updatedViewConfigs,
      numViews: state.numViews,
    };
    return updatedConfigs;
  } else if (action.type === "LOAD_CONFIG") {
    const { config, g3dBlobs } = action;
    const chromInfoPath = config.genomeAssembly.chromInfoPath;
    const loadedViewConfigs = {};
    const loadedThreeCases = {};
    for (let i = 0; i < config.cases.length; i += 1) {
      const ca = config.cases[i];
      const viewConfig = viewsToViewConfig(
        ca.views,
        config.positionedTracks,
        chromInfoPath
      );
      loadedViewConfigs[ca.uid] = viewConfig;
      if (g3dBlobs.length > 0) {
        loadedThreeCases[ca.uid] = config.threeCases[ca.uid];
        if (i < g3dBlobs.length) {
          loadedThreeCases[ca.uid].fileObj = g3dBlobs[i];
        } else {
          loadedThreeCases[ca.uid].fileObj = g3dBlobs[g3dBlobs.length - 1];
        }
      }
    }

    const loadedConfigs = {
      cases: config.cases,
      pairedLocks: config.pairedLocks,
      threeCases: loadedThreeCases,
      positionedTracks: config.positionedTracks,
      positionedTracksToCaseUid: config.positionedTracksToCaseUid,
      chromInfoPath,
      viewConfigs: loadedViewConfigs,
      numViews: config.numViews,
    };
    return loadedConfigs;
  }
  return defaultConfigs;
};

const ConfigProvider = (props) => {
  const [configs, dispatchConfigsAction] = useReducer(
    configsReducer,
    defaultConfigs
  );

  const hgcRefs = useRef({});

  const addCaseHandler = (caseConfig) => {
    dispatchConfigsAction({ type: "ADD_CASE", config: caseConfig });
  };

  const addPairedCaseHandler = (caseConfig) => {
    dispatchConfigsAction({ type: "ADD_CASE_PAIRED", config: caseConfig });
  };

  const addZoomViewHandler = (xyDomains) => {
    dispatchConfigsAction({
      type: "ADD_ZOOMVIEW",
      xyDomains: xyDomains,
    });
  };

  const removeZoomViewHandler = (xyDomains) => {
    dispatchConfigsAction({
      type: "REMOVE_ZOOMVIEW",
      xyDomains: xyDomains,
    });
  };

  const updateOverlaysHandler = (overlays, xyDomains) => {
    dispatchConfigsAction({
      type: "UPDATE_OVERLAYS",
      overlays: overlays,
      xyDomains: xyDomains,
    });
  };

  const removeOverlaysHandler = (xyDomains) => {
    dispatchConfigsAction({ type: "REMOVE_OVERLAYS", xyDomains: xyDomains });
  };

  const updateTrackOptionsHandler = (updatedTracks, xyDomains) => {
    // updatedTracks is a list of object with the format
    // uid: trackUid
    // options: [{name: optionName, value: optionValue}]
    console.log("UPDATE_TRACKS", updatedTracks);
    // FIXME: bool type option need to convert 'false' to false
    dispatchConfigsAction({
      type: "UPDATE_TRACKS",
      updatedTracks,
      xyDomains,
      hgcRefs,
    });
  };

  const loadConfigHandler = (config, g3dBlobs) => {
    dispatchConfigsAction({ type: "LOAD_CONFIG", config, g3dBlobs });
  };

  const configContext = {
    cases: configs.cases,
    pairedLocks: configs.pairedLocks,
    threeCases: configs.threeCases,
    positionedTracks: configs.positionedTracks,
    positionedTracksToCaseUid: configs.positionedTracksToCaseUid,
    chromInfoPath: configs.chromInfoPath,
    viewConfigs: configs.viewConfigs,
    numViews: configs.numViews,
    hgcRefs: hgcRefs,
    addCase: addCaseHandler,
    addPairedCase: addPairedCaseHandler,
    addZoomView: addZoomViewHandler,
    removeZoomView: removeZoomViewHandler,
    updateOverlays: updateOverlaysHandler,
    removeOverlays: removeOverlaysHandler,
    updateTrackOptions: updateTrackOptionsHandler,
    loadConfig: loadConfigHandler,
  };

  return (
    <ConfigContext.Provider value={configContext}>
      {props.children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;
