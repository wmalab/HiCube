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
};

const addUids = (hic, tracks) => {
  const caseUids = {
    uid: uid(),
    // put hic track to center
    hic: {
      uid: uid(),
      heatmapUid: uid(),
      tilesetUid: hic.tilesetUid,
      server: hic.server,
    },
    tracks: tracks.map((track) => ({
      uid: uid(),
      type: track.type,
      tilesetUid: track.tilesetUid,
      server: track.server,
      positions: track.positions.reduce((prev, curr) => {
        prev[curr] = uid();
        return prev;
      }, {}),
    })),
  };
  return caseUids;
};

const positionToOrientation = (position) => {
  const orientations = {
    top: "horizontal",
    bottom: "horizontal",
    left: "vertical",
    right: "vertical",
  };
  return orientations[position];
};

const configToViewConfig = (
  caseUids,
  positionedTracks,
  chromInfoPath,
  initialXDomain,
  initialYDomain
) => {
  const view = {
    initialXDomain: [...initialXDomain],
    initialYDomain: [...initialYDomain],
    chromInfoPath: chromInfoPath,
    tracks: { top: [], left: [], center: [], right: [], bottom: [] },
  };
  view.tracks.center.push(positionedTracks[caseUids.hic.uid]);
  for (const track of caseUids.tracks) {
    for (const position in track.positions) {
      const trackUid = track.positions[position];
      view.tracks[position].push(positionedTracks[trackUid]);
    }
  }
  const viewConfig = {
    editable: false,
    zoomFixed: false,
    views: [
      {
        ...view,
        uid: "aa",
        layout: {
          w: 12,
          h: 12,
          x: 0,
          y: 0,
          static: true,
        },
      },
    ],
  };
  return viewConfig;
};

const configsReducer = (state, action) => {
  if (action.type === "ADD_CASE") {
    const { chromInfoPath, heatmap, tracks } = action.config;
    const { initialXDomainStart, initialXDomainEnd } = action.config;
    const initialXDomain = [+initialXDomainStart, +initialXDomainEnd];
    const initialYDomain = [+initialXDomainStart, +initialXDomainEnd];

    const caseUids = addUids(heatmap, tracks);
    const positionedTracks = {};
    // create default track options for heatmap track
    positionedTracks[caseUids.hic.uid] = {
      uid: caseUids.hic.uid,
      type: "combined",
      contents: [
        {
          uid: caseUids.hic.heatmapUid,
          type: "heatmap",
          server: caseUids.hic.server,
          tilesetUid: caseUids.hic.tilesetUid,
          options: { ...TRACKS_INFO_BY_TYPE["heatmap"].defaultOptions },
        },
      ],
    };

    // create default track options for 1d tracks
    for (const track of caseUids.tracks) {
      for (const position in track.positions) {
        const trackUid = track.positions[position];
        positionedTracks[trackUid] = {
          uid: trackUid,
          type: positionToOrientation(position) + "-" + track.type,
          options: { ...TRACKS_INFO_BY_TYPE[track.type].defaultOptions },
        };
        if (track.type !== "chromosome-labels") {
          positionedTracks[trackUid].server = track.server;
          positionedTracks[trackUid].tilesetUid = track.tilesetUid;
        } else {
          positionedTracks[trackUid].chromInfoPath = chromInfoPath;
        }
      }
    }
    const viewConfig = configToViewConfig(
      caseUids,
      positionedTracks,
      chromInfoPath,
      initialXDomain,
      initialYDomain
    );

    const updatedConfigs = {
      cases: state.cases.concat(caseUids),
      positionedTracks: { ...state.positionedTracks, ...positionedTracks },
      chromInfoPath: chromInfoPath,
      viewConfigs: { ...state.viewConfigs, [caseUids.uid]: viewConfig },
    };
    return updatedConfigs;
  } else if (action.type === "ADD_ZOOMVIEW") {
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

  const updateTrackOptionsHandler = (xyDomains) => {};

  const configContext = {
    cases: configs.cases,
    positionedTracks: configs.positionedTracks,
    chromInfoPath: configs.chromInfoPath,
    viewConfigs: configs.viewConfigs,
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
