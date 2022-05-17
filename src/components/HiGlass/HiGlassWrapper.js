import React, { useEffect, useState } from "react";

import { HiGlassComponent } from "higlass";
import "higlass/dist/hglib.css";

/*
HiGlassWrapper is a wrapper for HiGlassComponent 
so it only re-evaluate under certain conditions
such as props change
*/

const HiGlassWrapper = (props) => {
  console.log("HiGlassWrapper render");

  // const [isSelectEnabled, setIsSelectEnabled] = useState(false);
  const [activate, setActivate] = useState();

  /*
  force this component re-evaluate after mouseTool changed
  by calling api.activateTool(...)
  */
  useEffect(() => {
    // if (props.activateSelect) {
    //   props.onRef.current.api.activateTool("select");
    //   setIsSelectEnabled(true);
    // } else {
    //   props.onRef.current.api.activateTool("move");
    //   setIsSelectEnabled(false);
    // }
    setActivate({activate: true});
  }, [props.activateSelect]);

  return (
    <HiGlassComponent
      ref={props.onRef}
      options={props.options}
      viewConfig={props.viewConfig}
    />
  );
};

export default React.memo(HiGlassWrapper);
