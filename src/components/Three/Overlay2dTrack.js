import React from "react";
import { Line, Html } from "@react-three/drei";

const Overlay2dTrack = (props) => {
  const { anchor1, anchor2, options } = props;

  return (
    <group>
      {options.drawAnchor1 && (
        <mesh position={anchor1}>
          <sphereGeometry args={[+options.anchor1Radius, 16, 16]} />
          <meshBasicMaterial color={options.anchor1Color} />
          {options.anchor1Label && (
            <Html
              style={{
                "font-size": options.anchor1LabelSize,
                color: options.anchor1LabelColor,
                "font-weight": options.anchor1LabelWeight,
              }}
            >
              <span>{options.anchor1Label}</span>
            </Html>
          )}
        </mesh>
      )}
      {options.drawAnchor2 && (
        <mesh position={anchor2}>
          <sphereGeometry args={[+options.anchor2Radius, 16, 16]} />
          <meshBasicMaterial color={options.anchor2Color} />
          {options.anchor2Label && (
            <Html
              style={{
                "font-size": options.anchor2LabelSize,
                color: options.anchor2LabelColor,
                "font-weight": options.anchor2LabelWeight,
              }}
            >
              <span>{options.anchor2Label}</span>
            </Html>
          )}
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
