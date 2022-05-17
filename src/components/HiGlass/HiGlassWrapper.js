import React, { useEffect, useState } from "react";

import { HiGlassComponent } from "higlass";
import "higlass/dist/hglib.css";

/*
HiGlassWrapper is a wrapper for HiGlassComponent 
so it only re-evaluate under certain conditions
such as props change
*/

const MOUSE_TOOL_MOVE = "move";
const MOUSE_TOOL_SELECT = "select";

const HiGlassWrapper = (props) => {
  console.log("HiGlassWrapper render");

  const [isSelectEnabled, setIsSelectEnabled] = useState(false);

  /*
  force this component re-evaluate after mouseTool changed
  by calling api.activateTool(...)
  */
  const { mouseTool } = props;

  useEffect(() => {
    if (mouseTool === "select") {
      props.onRef.current.api.activateTool(MOUSE_TOOL_SELECT);
      setIsSelectEnabled(true);
    } else {
      props.onRef.current.api.activateTool(MOUSE_TOOL_MOVE);
      setIsSelectEnabled(false);
    }
  }, [mouseTool]);

  return (
    <HiGlassComponent
      ref={props.onRef}
      options={props.options}
      viewConfig={props.viewConfig}
    />
  );
};

export default React.memo(HiGlassWrapper);
