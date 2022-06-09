import React, { useState, useReducer } from "react";
import HiGlassCase from "./components/HiGlass/HiGlassCase";
import TrackSourceManager from "./components/SideDrawer/TrackSourceManager";
import AddCase from "./components/SideDrawer/AddCase";
import ToolBar from "./components/SideDrawer/ToolBar";
import {
  defaultOptions as options,
  defaultViewConfig as viewConfig,
} from "./components/Config/default-config";
import GridLayout from "react-grid-layout";
import { uid } from "./utils";
import "../node_modules/react-grid-layout/css/styles.css";
import "../node_modules/react-resizable/css/styles.css";

const overlaysReducer = (state, action) => {
  if (action.type === "ADD_1D") {
    return state.concat({
      uid: "overlay-1d-" + uid(),
      extent: action.extent,
    });
  } else if (action.type === "ADD_2D") {
    return state.concat({
      uid: "overlay-2d-" + uid(),
      extent: action.extent,
    });
  } else if (action.type === "CLEAR") {
    return [];
  } else if (action.type === "REMOVE") {
    return state.filter(overlay => overlay.uid !== action.uuid);
  }
};

const configsReducer = (state, action) => {};

// TODO: add HGC dynamically with button click
// HGCs should have diff viewconfig and id otherwise same props
// TODO: hold a list of viewconfig as state to pass to HGC
// TODO: need an index for all the tracks
// TODO: if move create zoom view here,
// need to change initialXDomain to current location
// TODO: add case need to set initialXDomain to current location

export default function App() {
  console.log("App render");

  const [mainLocation, setMainLocation] = useState({
    xDomain: null,
    yDomain: null,
    fromId: null,
  });

  const [mouseTool, setMouseTool] = useState("move");
  const [rangeSelection, setRangeSelection] = useState({
    type: null,
    xDomain: null,
    yDomain: null,
    fromId: null,
  });

  const [overlays, dispatchOverlaysAction] = useReducer(overlaysReducer, []);

  // const [configs, dispatchConfigsAction] = useReducer(configsReducer, []);
  const [trackSourceServers, setTrackSourceServers] = useState([]);
  const [configs, setConfigs] = useState([]);

  const locationChangeHandler = (location, id) => {
    console.log(id, "location change");

    setMainLocation({ ...location, fromId: id });
  };

  const activateSelectHandler = () => {
    setMouseTool("select");
  };

  const createZoomInHandler = () => {
    setMouseTool("move_create");
  };

  const cancelSelectHandler = () => {
    setMouseTool("move_cancel");
  };

  const clearSelectHandler = () => {
    setMouseTool("move_clear");
  };

  const addOverlayHandler = () => {
    setMouseTool("add_overlay");
  };

  const clearOverlaysHandler = () => {
    dispatchOverlaysAction({ type: "CLEAR" });
  };

  const rangeSelectionChangeHandler = (type, location, id) => {
    setRangeSelection({ ...location, fromId: id, type: type });
  };

  const createOverlayHandler = (type, location, id) => {
    console.log(location);
    if (type === "1D") {
      dispatchOverlaysAction({
        type: "ADD_1D",
        extent: [...location[0]],
      });
    } else if (type === "2D") {
      dispatchOverlaysAction({
        type: "ADD_2D",
        extent: [...location[0], ...location[1]],
      });
    }
  };

  const removeOverlayHandler = (overlayUid) => {
    dispatchOverlaysAction({ type: "REMOVE", uuid: overlayUid });
  };

  const addCaseHandler = (hgcViewConfig) => {
    setConfigs((prevConfigs) => {
      // FIXME: cannot select on 1D tracks
      return [...prevConfigs, [uid(), viewConfig]];
    });
  };

  const nViews =
    !rangeSelection.xDomain || rangeSelection.xDomain.every((e) => e === null)
      ? 1
      : 2;

  const layout = configs.map((config, idx) => {
    return {
      i: config[0],
      x: 0,
      y: 3 * idx,
      w: 4 * nViews,
      h: 3,
      static: true,
    };
  });

  const addServerHandler = (serverURL) => {
    setTrackSourceServers((prevTrackSourceServers) => {
      return prevTrackSourceServers.concat({ uuid: uid(), url: serverURL });
    });
  };

  const removeServerHandler = (serverUid) => {
    setTrackSourceServers((prevTrackSourceServers) => {
      return prevTrackSourceServers.filter(
        (trackSourceServer) => trackSourceServer.uuid !== serverUid
      );
    });
  };

  return (
    <div>
      <TrackSourceManager
        trackSourceServers={trackSourceServers}
        onAddServer={addServerHandler}
        onRemoveServer={removeServerHandler}
      />
      <AddCase
        trackSourceServers={trackSourceServers}
        onAddCase={addCaseHandler}
      />
      <ToolBar
        onSelect={activateSelectHandler}
        onCancel={cancelSelectHandler}
        onAddZoomIn={createZoomInHandler}
        onRemoveZoomIn={clearSelectHandler}
        overlays={overlays}
        onAddOverlay={addOverlayHandler}
        onRemoveOverlays={clearOverlaysHandler}
        onRemoveOverlay={removeOverlayHandler}
      />
      <p>
        {mainLocation.xDomain &&
          `xDomain: ${mainLocation.xDomain[0]}--${mainLocation.xDomain[1]}`}
      </p>
      <p>
        {mainLocation.yDomain &&
          `yDomain: ${mainLocation.yDomain[0]}--${mainLocation.yDomain[1]}`}
      </p>
      <p>
        {rangeSelection.xDomain &&
          `select xDomain: ${rangeSelection.xDomain[0]}--${rangeSelection.xDomain[1]}`}
      </p>
      <p>
        {rangeSelection.yDomain &&
          `select yDomain: ${rangeSelection.yDomain[0]}--${rangeSelection.yDomain[1]}`}
      </p>
      {/* <ul>
        {overlays.map((overlay) => {
          return (
            <li key={overlay.uid}>
              <span>
                <strong>{overlay.uid}: </strong>
              </span>
              <span>{`${overlay.extent[0]}-${overlay.extent[1]}`}</span>
              {overlay.extent.length > 2 && (
                <span>{`, ${overlay.extent[2]}-${overlay.extent[3]}`}</span>
              )}
            </li>
          );
        })}
      </ul> */}
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={100}
        width={1200}
      >
        {configs.map((config) => {
          return (
            <div key={config[0]}>
              <HiGlassCase
                key={config[0]}
                id={config[0]}
                options={options}
                viewConfig={config[1]}
                mainLocation={mainLocation}
                onMainLocationChange={locationChangeHandler}
                mouseTool={mouseTool}
                rangeSelection={rangeSelection}
                onRangeSelection={rangeSelectionChangeHandler}
                onCreateOverlay={createOverlayHandler}
                overlays={overlays}
              />
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
}
