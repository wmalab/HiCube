import React from "react";
import { Line } from "@react-three/drei";

const Overlay2dTrack = (props) => {
  const { anchor1, anchor2, options } = props;

  return (
    <group>
      {options.drawAnchor1 && (
        <mesh position={anchor1}>
          <sphereGeometry args={[+options.anchor1Radius, 16, 16]} />
          <meshBasicMaterial color={options.anchor1Color} />
        </mesh>
      )}
      {options.drawAnchor2 && (
        <mesh position={anchor2}>
          <sphereGeometry args={[+options.anchor2Radius, 16, 16]} />
          <meshBasicMaterial color={options.anchor2Color} />
        </mesh>
      )}
      {options.drawLine && (
        <Line
          points={[anchor1, anchor2]}
          lineWidth={+options.lineWidth}
          // dashed={true}
          color={options.lineColor}
        />
      )}
    </group>
  );
};

export default Overlay2dTrack;
