import React from "react";
import { Line, Html } from "@react-three/drei";

const Overlay1dTrack = (props) => {
  function setColor(c) {
    if (c === "score") {
      if (props.scoreColor) {
        return props.scoreColor;
      }
      // if no score or valid colormap default color is black
      return "Black";
    }
    // use the manually chosen color
    return c;
  }

  const { points, options } = props;
  const lineColor = setColor(options.lineColor);
  const anchor1Color = setColor(options.anchor1Color);
  const anchor2Color = setColor(options.anchor2Color);
  // FIXME: flash when rotate, may change to Tube?
  return (
    <group>
      {options.drawAnchor1 && points.length > 0 && (
        <mesh position={points[0]}>
          <sphereGeometry args={[+options.anchor1Radius, 16, 16]} />
          <meshBasicMaterial color={anchor1Color} />
          {options.anchor1Label && (
            <Html
              style={{
                fontSize: options.anchor1LabelSize,
                color: options.anchor1LabelColor,
                fontWeight: options.anchor1LabelWeight,
              }}
            >
              <span>{options.anchor1Label}</span>
            </Html>
          )}
        </mesh>
      )}
      {options.drawAnchor2 && points.length > 0 && (
        <mesh position={points[points.length - 1]}>
          <sphereGeometry args={[+options.anchor2Radius, 16, 16]} />
          <meshBasicMaterial color={anchor2Color} />
          {options.anchor2Label && (
            <Html
              style={{
                fontSize: options.anchor2LabelSize,
                color: options.anchor2LabelColor,
                fontWeight: options.anchor2LabelWeight,
              }}
            >
              <span>{options.anchor2Label}</span>
            </Html>
          )}
        </mesh>
      )}
      {options.drawLine && points.length > 1 && (
        <Line
          points={points}
          lineWidth={+options.lineWidth}
          color={lineColor}
          // color={options.lineColor}
          // transparent
          // opacity={0.5}
        />
      )}
    </group>
  );
};

export default Overlay1dTrack;
