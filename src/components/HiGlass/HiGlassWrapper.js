import React from "react";

import { HiGlassComponent } from "higlass";
import "higlass/dist/hglib.css";

/*
HiGlassWrapper is a wrapper for HiGlassComponent 
so it only re-evaluate under certain conditions
such as props change
*/

const HiGlassWrapper = (props) => {
  console.log("HiGlassWrapper render");

  return (
    <HiGlassComponent
      ref={props.onRef}
      options={props.options}
      viewConfig={props.viewConfig}
    />
  );
};

export default React.memo(HiGlassWrapper);
