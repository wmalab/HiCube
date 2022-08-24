import React from "react";
import { Line } from "@react-three/drei";

const Overlay1dTrack = (props) => {
  const { points, options } = props;
  // FIXME: flash when rotate, may change to Tube?
  return (
    <group>
      {options.drawAnchor1 && (
        <mesh position={points[0]}>
          <sphereGeometry args={[+options.anchor1Radius, 16, 16]} />
          <meshBasicMaterial color={options.anchor1Color} />
        </mesh>
      )}
      {options.drawAnchor2 && (
        <mesh position={points[points.length - 1]}>
          <sphereGeometry args={[+options.anchor2Radius, 16, 16]} />
          <meshBasicMaterial color={options.anchor2Color} />
        </mesh>
      )}
      {options.drawLine && (
        <Line
          points={points}
          lineWidth={+options.lineWidth}
          color={options.lineColor}
          // transparent
          // opacity={0.5}
        />
      )}
    </group>
  );
};

export default Overlay1dTrack;
