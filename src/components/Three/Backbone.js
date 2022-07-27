import React from "react";
import { Line } from "@react-three/drei";

const Backbone = (props) => {
  const { points, colors, lw, opacity } = props;
  const transparent = opacity < 1;
  return (
    <Line
      points={points}
      color="white"
      vertexColors={colors}
      lineWidth={lw}
      dashed={false}
      transparent={transparent}
      // FIXED: need to set opacity to 1.0 or it will be a white line
      opacity={opacity}
      // visible={true}
    />
  );
};

export default Backbone;
