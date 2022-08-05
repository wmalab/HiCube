import React from "react";
import Overlay1dTrack from "./Overlay1dTrack";
import Overlay2dTrack from "./Overlay2dTrack";

const OverlaysTrack = (props) => {
  const { overlays1d, overlays2d, segmentData } = props;

  const tracks1d = overlays1d.map((overlay) => {
    const { anchor1, anchor2 } = overlay;
    const chr = anchor1.chr;
    if (anchor2.chr !== chr) {
      throw Error("1D annotation should be within one chromosome.");
    }
    const s1 = segmentData[chr].binToSegment[anchor1.bin];
    const s2 = segmentData[chr].binToSegment[anchor2.bin];
    // TODO: assume both anchors are on the same chromosomes now
    const segments = segmentData[chr].segments;
    const segment1 = segments[s1];
    const segment2 = segments[s2];
    // get the point to the bin
    const start = Math.max(0, anchor1.bin - segment1.start);
    const end = Math.min(
      segment2.points.length,
      segment2.points.length - segment2.end + anchor2.bin
    );
    let points = [];
    if (s1 === s2) {
      // two anchors on the same segment
      if (start < end) {
        points = segment1.points.slice(start, end);
      }
    } else {
      points = points.concat(segment1.points.slice(start));
      for (let i = s1 + 1; i < s2; i++) {
        points = points.concat(segments[i].points);
      }
      points = points.concat(segment2.points.slice(0, end));
    }

    return <Overlay1dTrack key={overlay.uid} points={points} />;
  });

  const tracks2d = overlays2d.map((overlay) => {
    const { anchor1, anchor2 } = overlay;

    const s1 = segmentData[anchor1.chr].binToSegment[anchor1.bin]; // segment index
    const s2 = segmentData[anchor2.chr].binToSegment[anchor2.bin];

    const segment1 = segmentData[anchor1.chr].segments[s1];
    const segment2 = segmentData[anchor2.chr].segments[s2];
    // get the point to the bin
    // TODO: what if bin is missing?
    const point1 = segment1.points[anchor1.bin - segment1.start];
    const point2 = segment2.points[anchor2.bin - segment2.start];

    return (
      <Overlay2dTrack key={overlay.uid} anchor1={point1} anchor2={point2} />
    );
  });

  return (
    <>
      {tracks1d.length > 0 && tracks1d}
      {tracks2d.length > 0 && tracks2d}
    </>
  );
};

export default OverlaysTrack;
