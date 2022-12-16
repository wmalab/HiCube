import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

const color2rgb = (color) => {
  const c = new THREE.Color(color);
  return [c.r, c.g, c.b];
};

const Backbone = (props) => {
  const {
    segmentData: { segments, binToSegment },
    visible,
    showViewRangeOnly,
    binRanges,
  } = props;

  // TODO: if showViewRangeOnly is true, only draw viewing binRanges
  // otherwise draw the entire chromosome with non-viewing colored gray
  // TODO: maybe change the gray to white? but whhich value rep white?

  const color = color2rgb(props.color);
  const color2 = color2rgb("white"); // for regions that is not visible
  const transparent = !visible;
  const opacity = transparent ? props.opacity : 1; // TODO make it changeable
  // TODO: fill invisible chromsome with its chosen color instead of gray
  const segmentColors = {};

  const lines = [];

  if (visible) {
    if (!showViewRangeOnly) {
      for (let i = 0; i < segments.length; i++) {
        segmentColors[i] = Array(segments[i].points.length).fill(color2);
      }
    }

    for (const binRange of binRanges) {
      console.log(binRange);

      const startBin = binRange[0];
      const startSegment = binToSegment[startBin];
      const endBin = binRange[1] - 1;
      const endSegment = binToSegment[endBin];

      console.log("startBin=", startBin, "endBin=", endBin);
      console.log("startSegment=", startSegment, segments[startSegment]);
      console.log("endSegment=", endSegment, segments[endSegment]);

      for (let i = startSegment + 1; i < endSegment; i++) {
        console.log("fill segment");
        if (!showViewRangeOnly) {
          segmentColors[i].fill(color);
        } else {
          lines.push(
            <Line
              key={i}
              points={segments[i].points}
              color={color}
              lineWidth={4}
            />
          );
        }
      }
      if (startSegment === endSegment) {
        // only one segment
        if (startSegment < segments.length) {
          // not on the last missing piece
          const segment = segments[startSegment];
          const start = Math.max(0, startBin - segment.start);
          // const end = Math.min(
          //   segment.points.length,
          //   segment.points.length - segment.end + endBin
          // );
          const end = endBin - segment.start + 1;
          if (start < end) {
            if (!showViewRangeOnly) {
              segmentColors[startSegment].fill(color, start, end);
            } else {
              lines.push(
                <Line
                  key={startSegment}
                  points={segment.points.slice(start, end)}
                  color={color}
                  lineWidth={4}
                />
              );
            }
          }
        }
      } else {
        if (startBin <= segments[startSegment].start) {
          if (!showViewRangeOnly) {
            segmentColors[startSegment].fill(color);
          } else {
            lines.push(
              <Line
                key={startSegment}
                points={segments[startSegment].points}
                color={color}
                lineWidth={4}
              />
            );
          }
        } else {
          const segment = segments[startSegment];
          if (!showViewRangeOnly) {
            segmentColors[startSegment].fill(color, startBin - segment.start);
          } else {
            lines.push(
              <Line
                key={startSegment}
                points={segment.points.slice(startBin - segment.start)}
                color={color}
                lineWidth={4}
              />
            );
          }
        }
        if (
          endSegment < segments.length &&
          endBin >= segments[endSegment].start
        ) {
          if (endBin >= segments[endSegment].end) {
            if (!showViewRangeOnly) {
              segmentColors[endSegment].fill(color);
            } else {
              lines.push(
                <Line
                  key={endSegment}
                  points={segments[endSegment].points}
                  color={color}
                  lineWidth={4}
                />
              );
            }
          } else {
            const segment = segments[endSegment];
            console.log(
              "fill endSegment",
              segment.points.length - segment.end + endBin
            );
            if (!showViewRangeOnly) {
              segmentColors[endSegment].fill(
                color,
                0,
                endBin - segment.start + 1
                // segment.points.length - segment.end + endBin
              );
            } else {
              lines.push(
                <Line
                  key={endSegment}
                  points={segment.points.slice(
                    0,
                    endBin - segment.start + 1
                    // segment.points.length - segment.end + endBin
                  )}
                  color={color}
                  lineWidth={4}
                />
              );
            }
          }
        }
      }
    }
  } else {
    for (let i = 0; i < segments.length; i++) {
      segmentColors[i] = Array(segments[i].points.length).fill(color);
    }
  }

  if (showViewRangeOnly) {
    return <group>{lines}</group>;
  }

  return (
    <group>
      {segments.map((segment, index) => (
        <Line
          key={index}
          points={segment.points}
          color="white"
          vertexColors={segmentColors[index]}
          lineWidth={4}
          transparent={transparent}
          opacity={opacity}
        />
      ))}
    </group>
  );

  // return (
  //   <Line
  //     points={points}
  //     color="white"
  //     vertexColors={colors}
  //     lineWidth={3}
  //     dashed={false}
  //     transparent={transparent}
  //     // FIXED: need to set opacity to 1.0 or it will be a white line
  //     opacity={opacity}
  //     // visible={true}
  //   />
  // );
};

export default Backbone;
