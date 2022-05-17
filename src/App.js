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

  // const [selectMode, setSelectMode] = useState(false);
  const [mouseTool, setMouseTool] = useState("move");

  const locationChangeHandler = (location, id) => {
    console.log(id, "location change");

    setMainLocation({ ...location, fromId: id });
  };

  // const toggleSelectModeHandler = () => {
  //   setSelectMode((prevSelectMode) => !prevSelectMode);
  // };
  const toggleMouseToolHandler = () => {
    setMouseTool((prevMouseTool) => {
      if (prevMouseTool === "move") {
        return "select";
      }
      return "move";
    });
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
      {/* <button onClick={toggleSelectModeHandler}>
        {selectMode ? "Select" : "Move"}
      </button> */}
      <button onClick={toggleMouseToolHandler}>{mouseTool}</button>
      <HiGlassCase
        id="hgc1"
        options={options}
        viewConfig={viewConfig}
        mainLocation={mainLocation}
        onMainLocationChange={locationChangeHandler}
        // selectMode={selectMode}
        mouseTool={mouseTool}
      />
      <HiGlassCase
        id="hgc2"
        options={options}
        viewConfig={viewConfig}
        mainLocation={mainLocation}
        onMainLocationChange={locationChangeHandler}
        // selectMode={selectMode}
        mouseTool={mouseTool}
      />
    </div>
  );
}
