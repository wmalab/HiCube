import React from "react";
import { Line } from "@react-three/drei";

const Overlay1dTrack = (props) => {
  const { points } = props;
  // FIXME: flash when rotate, may change to Tube?
  return (
    <group>
      <Line
        points={points}
        lineWidth={20}
        color="hotpink"
        transparent
        opacity={0.5}
      />
    </group>
  );
};

export default Overlay1dTrack;
