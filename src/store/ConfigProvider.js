import React, { useState, useReducer, useEffect } from "react";
import ConfigContext from "./config-context";
import TRACKS_INFO_BY_TYPE from "../configs/tracks-info-by-type";
import { uid } from "../utils";

// NOTE: context is suitable for low-frequency changes
// do NOT put location changes inside context
// NOTE: case UUIDs, data UUIDS, track UUIDs
// TODO: may need add views for zoom-in view
// NOTE: we also need the order of tracks
// TODO: where to include initialXDomain
// TODO: add height and width
// TODO: where to add zoomview and overlays in caseUids?
// TODO: 1d, 2d and 3d tracks in caseUids?

const defaultConfigs = {
  cases: [],
  positionedTracks: {}, // uid indexed track config
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
          tilesetUid: hic.tilesetUid,
          server: hic.server,
          type: "heatmap",
        },
      ],
    },
    "1d": tracks.map((track) => ({
      dataUid: uid(),
      type: track.type,
      tilesetUid: track.tilesetUid,
      server: track.server,
      positions: track.positions.reduce((prev, curr) => {
        prev[curr] = uid();
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

const configsReducer = (state, action) => {
  console.log("config reduce");
  if (action.type === "ADD_CASE") {
    const { chromInfoPath, heatmap, tracks } = action.config;
    const { initialXDomainStart, initialXDomainEnd } = action.config;
    const initialXDomain = [+initialXDomainStart, +initialXDomainEnd];
    const initialYDomain = [+initialXDomainStart, +initialXDomainEnd];

    const caseUid = uid();
    const view = addView(heatmap, tracks);
    const positionedTracks = {};
    // create default track options for heatmap track
    positionedTracks[view["2d"].contents[0].uid] = {
      uid: view["2d"].contents[0].uid,
      type: view["2d"].contents[0].type,
      server: view["2d"].contents[0].server,
      tilesetUid: view["2d"].contents[0].tilesetUid,
      options: {
        ...addDefaultOptions(view["2d"].contents[0].type),
      },
    };

    // create default track options for 1d tracks
    for (const track of view["1d"]) {
      for (const position in track.positions) {
        const trackUid = track.positions[position];
        positionedTracks[trackUid] = {
          uid: trackUid,
          type: positionToOrientation(position) + "-" + track.type,
          options: { ...addDefaultOptions(track.type) },
        };
        if (track.type !== "chromosome-labels") {
          positionedTracks[trackUid].server = track.server;
          positionedTracks[trackUid].tilesetUid = track.tilesetUid;
        } else {
          positionedTracks[trackUid].chromInfoPath = chromInfoPath;
        }
      }
    }
    const views = [
      {
        ...view,
        uid: "aa",
        initialXDomain: initialXDomain,
        initialYDomain: initialYDomain,
      },
    ];
    const viewConfig = viewsToViewConfig(
      views,
      positionedTracks,
      chromInfoPath
    );

    const updatedConfigs = {
      cases: state.cases.concat({ uid: caseUid, views: views }),
      positionedTracks: { ...state.positionedTracks, ...positionedTracks },
      chromInfoPath: chromInfoPath,
      viewConfigs: { ...state.viewConfigs, [caseUid]: viewConfig },
      numViews: 1,
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
      if (views.length === 2) {
        views.pop();
        views[0]["2d"].contents.pop();
      }
      views[0].initialXDomain = [...initialXYDomains.xDomain];
      views[0].initialYDomain = [...initialXYDomains.yDomain];
      views[0].layout.w = 6;
      const newView = deepCopy(views[0]);
      newView.uid = "bb";
      newView.initialXDomain = [...selectedXYDomains.xDomain];
      newView.initialYDomain = [...selectedXYDomains.yDomain];
      newView.layout.x = 6;
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
      positionedTracks: updatedPositionedTracks,
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
      if (views.length === 2) {
        views.pop();
        views[0]["2d"].contents.pop();
        // TODO: delete trackOptions in positionedTracks
        views[0].layout.w = 12;
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
      positionedTracks: updatedPositionedTracks,
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
    for (const overlay of overlays) {
      updatedPositionedTracks[overlay.uid] = {
        uid: overlay.uid,
        options: {
          extent: [overlay.extent],
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
      positionedTracks: updatedPositionedTracks,
      chromInfoPath: chromInfoPath,
      viewConfigs: updatedViewConfigs,
      numViews: state.numViews,
    };
    return updatedConfigs;
  } else if (action.type === "REMOVE_OVERLAYS") {
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
      positionedTracks: updatedPositionedTracks,
      chromInfoPath: chromInfoPath,
      viewConfigs: updatedViewConfigs,
      numViews: state.numViews,
    };
    return updatedConfigs;
  } else if (action.type === "UPDATE_TRACKS") {
    const { updatedTracks, xyDomains } = action;
    const { cases, positionedTracks, chromInfoPath } = state;

    const updatedCases = [];
    const updatedPositionedTracks = deepCopy(positionedTracks);
    const updatedViewConfigs = {};

    for (const track of updatedTracks) {
      for (const option of track.options) {
        if (option.value !== undefined) {
          updatedPositionedTracks[track.uid].options[option.name] =
            option.value;
        }
      }
    }

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
      positionedTracks: updatedPositionedTracks,
      chromInfoPath: chromInfoPath,
      viewConfigs: updatedViewConfigs,
      numViews: state.numViews,
    };
    return updatedConfigs;
  }
  return defaultConfigs;
};

const ConfigProvider = (props) => {
  const [configs, dispatchConfigsAction] = useReducer(
    configsReducer,
    defaultConfigs
  );

  const addCaseHandler = (caseConfig) => {
    dispatchConfigsAction({ type: "ADD_CASE", config: caseConfig });
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
    dispatchConfigsAction({ type: "UPDATE_TRACKS", updatedTracks, xyDomains });
  };

  const configContext = {
    cases: configs.cases,
    positionedTracks: configs.positionedTracks,
    chromInfoPath: configs.chromInfoPath,
    viewConfigs: configs.viewConfigs,
    numViews: configs.numViews,
    addCase: addCaseHandler,
    addZoomView: addZoomViewHandler,
    removeZoomView: removeZoomViewHandler,
    updateOverlays: updateOverlaysHandler,
    removeOverlays: removeOverlaysHandler,
    updateTrackOptions: updateTrackOptionsHandler,
  };

  return (
    <ConfigContext.Provider value={configContext}>
      {props.children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;