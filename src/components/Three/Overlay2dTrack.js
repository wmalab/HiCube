import React from "react";
import { Line } from "@react-three/drei";

const Overlay2dTrack = (props) => {
  const { anchor1, anchor2 } = props;

  return (
    <group>
      <mesh position={anchor1}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="hotpink" />
      </mesh>
      <mesh position={anchor2}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="hotpink" />
      </mesh>
      <Line
        points={[anchor1, anchor2]}
        lineWidth={5}
        // dashed={true}
        color="hotpink"
      />
    </group>
  );
};

export default Overlay2dTrack;
