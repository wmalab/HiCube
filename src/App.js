import React, { useState, useReducer } from "react";
import HiGlassCase from "./components/HiGlass/HiGlassCase";
import {
  defaultOptions as options,
  defaultViewConfig as viewConfig,
} from "./components/Config/default-config";

const uid = () =>
  String(Date.now().toString(32) + Math.random().toString(16)).replace(
    /\./g,
    ""
  );

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
  }
};

const configsReducer = (state, action) => {};

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

  const [configs, dispatchConfigsAction] = useReducer(configsReducer, []);

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

  return (
    <div style={{ width: "400px", height: "800px" }}>
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
      <button onClick={activateSelectHandler}>Select</button>
      <button onClick={cancelSelectHandler}>Cancel</button>
      <br />
      <button onClick={createZoomInHandler}>+ Create Zoom-In View</button>
      <button onClick={clearSelectHandler}>- Clear Zoom-In View</button>
      <br />
      <button onClick={addOverlayHandler}>+ Add Overlay</button>
      <button onClick={clearOverlaysHandler}>- Clear Overlays</button>
      <ul>
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
      </ul>
      <HiGlassCase
        id="hgc1"
        options={options}
        viewConfig={viewConfig}
        mainLocation={mainLocation}
        onMainLocationChange={locationChangeHandler}
        mouseTool={mouseTool}
        rangeSelection={rangeSelection}
        onRangeSelection={rangeSelectionChangeHandler}
        onCreateOverlay={createOverlayHandler}
        overlays={overlays}
      />
      <HiGlassCase
        id="hgc2"
        options={options}
        viewConfig={viewConfig}
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
}
