import React from "react";
import { Line, Html } from "@react-three/drei";

const Overlay2dTrack = (props) => {
  function setColor(c) {
    if (c === "score") {
      console.log("scoreColor", props.scoreColor);
      if (props.scoreColor) {
        return props.scoreColor;
      }
      // if no score or valid colormap default color is black
      return "Black";
    }
    // use the manually chosen color
    return c;
  }

  const { anchor1, anchor2, options } = props;
  const lineColor = setColor(options.lineColor);
  const anchor1Color = setColor(options.anchor1Color);
  const anchor2Color = setColor(options.anchor2Color);

  // TODO: take the middle point, allow for more option later
  let point1, point2;
  if (anchor1.length > 0) {
    point1 = anchor1[Math.floor(anchor1.length / 2)];
  }
  if (anchor2.length > 0) {
    point2 = anchor2[Math.floor(anchor2.length / 2)];
  }

  return (
    <group>
      {options.drawAnchor1 && point1 && (
        <mesh position={point1}>
          <sphereGeometry args={[+options.anchor1Radius, 16, 16]} />
          <meshBasicMaterial color={anchor1Color} />
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
      {options.drawAnchor2 && point2 && (
        <mesh position={point2}>
          <sphereGeometry args={[+options.anchor2Radius, 16, 16]} />
          <meshBasicMaterial color={anchor2Color} />
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
      {options.drawLine && point1 && point2 && (
        <Line
          points={[point1, point2]}
          lineWidth={+options.lineWidth}
          // dashed={true}
          color={lineColor}
        />
      )}
    </group>
  );
};

export default Overlay2dTrack;
