import React from "react";
import { Line } from "@react-three/drei";

const Backbone = (props) => {
  const {
    segmentData: { segments, binToSegment },
    color,
    visible,
    showViewRangeOnly,
    binRanges,
  } = props;

  // TODO: if showViewRangeOnly is true, only draw viewing binRanges
  // otherwise draw the entire chromosome with non-viewing colored gray
  // TODO: maybe change the gray to white? but whhich value rep white?

  const transparent = !visible;
  const opacity = transparent ? 0.03 : 1;
  // TODO: fill invisible chromsome with its chosen color instead of gray
  const segmentColors = {};

  if (visible) {
    for (let i = 0; i < segments.length; i++) {
      segmentColors[i] = Array(segments[i].points.length).fill([1, 1, 1]);
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
        segmentColors[i].fill(color);
      }
      if (startSegment === endSegment) {
        // only one segment
        if (startSegment < segments.length) {
          // not on the last missing piece
          const segment = segments[startSegment];
          const start = Math.max(0, startBin - segment.start);
          const end = Math.min(
            segment.points.length,
            segment.points.length - segment.end + endBin
          );
          if (start < end) {
            segmentColors[startSegment].fill(color, start, end);
          }
        }
      } else {
        if (startBin <= segments[startSegment].start) {
          segmentColors[startSegment].fill(color);
        } else {
          const segment = segments[startSegment];
          segmentColors[startSegment].fill(color, startBin - segment.start);
        }
        if (
          endSegment < segments.length &&
          endBin >= segments[endSegment].start
        ) {
          if (endBin >= segments[endSegment].end) {
            segmentColors[endSegment].fill(color);
          } else {
            const segment = segments[endSegment];
            console.log(
              "fill endSegment",
              segment.points.length - segment.end + endBin
            );
            segmentColors[endSegment].fill(
              color,
              0,
              segment.points.length - segment.end + endBin
            );
          }
        }
      }
    }
  } else {
    for (let i = 0; i < segments.length; i++) {
      segmentColors[i] = Array(segments[i].points.length).fill(color);
    }
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
