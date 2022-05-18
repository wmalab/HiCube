import React, { useState } from "react";
import HiGlassCase from "./components/HiGlass/HiGlassCase";
import {
  defaultOptions as options,
  defaultViewConfig as viewConfig,
} from "./components/Config/default-config";

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

  const rangeSelectionChangeHandler = (type, location, id) => {
    setRangeSelection({ ...location, fromId: id, type: type });
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
      <button onClick={createZoomInHandler}>Create Zoom-In View</button>
      <button onClick={cancelSelectHandler}>Cancel</button>
      <button onClick={clearSelectHandler}>Clear</button>
      <HiGlassCase
        id="hgc1"
        options={options}
        viewConfig={viewConfig}
        mainLocation={mainLocation}
        onMainLocationChange={locationChangeHandler}
        mouseTool={mouseTool}
        rangeSelection={rangeSelection}
        onRangeSelection={rangeSelectionChangeHandler}
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
      />
    </div>
  );
}
