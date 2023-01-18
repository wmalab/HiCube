import React, { useMemo } from "react";
import Overlay1dTrack from "./Overlay1dTrack";
import Overlay2dTrack from "./Overlay2dTrack";
import chroma from "chroma-js";

const getPoints = (anchor1, anchor2, segmentData) => {
  // anchor1 and anchor2 should be { chr, bin }
  let points = [];

  const chr = anchor1.chr;
  if (anchor2.chr !== chr) {
    // throw Error("1D annotation should be within one chromosome.");
    return points;
  }
  // check if chr is missing
  if (!segmentData || !(chr in segmentData)) {
    return points;
  }
  const s1 = segmentData[chr].binToSegment[anchor1.bin];
  const s2 = segmentData[chr].binToSegment[anchor2.bin];
  // TODO: assume both anchors are on the same chromosomes now
  const segments = segmentData[chr].segments;
  // make sure the start is not on the last non-segment
  if (s1 >= segments.length) {
    return points;
  }
  const segment1 = segments[s1];
  // get the point to the bin
  const start = Math.max(0, anchor1.bin - segment1.start);
  // FIXME: if bin < segment2.start, end could be negative
  // const end = Math.min(
  //   segment2.points.length,
  //   segment2.points.length - segment2.end + anchor2.bin
  // );

  // const segment2 = segments[s2];
  // const end = anchor2.bin - segment2.start + 1;

  if (s1 === s2) {
    // two anchors on the same segment
    const end = anchor2.bin - segment1.start + 1;
    if (start < end) {
      points = segment1.points.slice(start, end);
    }
  } else {
    points = points.concat(segment1.points.slice(start));
    for (let i = s1 + 1; i < s2; i++) {
      points = points.concat(segments[i].points);
    }
    // make sure s2 is not the last non-segment
    if (s2 < segments.length) {
      const segment2 = segments[s2];
      const end = anchor2.bin - segment2.start + 1;
      if (end > 0) {
        points = points.concat(segment2.points.slice(0, end));
      }
    }
  }
  return points;
};

const OverlaysTrack = (props) => {
  const { overlays, chromInfo, resolution, segmentData } = props;
  // let vmin1d, vmax1d, vmin2d, vmax2d, colorScale1d, colorScale2d;

  const overlays1d = useMemo(() => {
    if (!chromInfo || !resolution || overlays.data1d.length < 1) {
      return [];
    }
    return overlays.data1d.map((overlay) => {
      const anchor1 = chromInfo.absToBin(overlay.extent[0], resolution);
      const anchor2 = chromInfo.absToBin(overlay.extent[1], resolution);
      return {
        anchor1,
        anchor2,
        score: overlay.score,
        uid: overlay.uid,
        options: overlay.options.threed,
      };
    });
  }, [overlays, chromInfo, resolution]);

  // TODO: if the x or y region is very long, only using the first bin seems not enough
  const overlays2d = useMemo(() => {
    if (!chromInfo || !resolution || overlays.data2d.length < 1) {
      return [];
    }
    return overlays.data2d.map((overlay) => {
      const anchor1 = {};
      const anchor2 = {};
      anchor1.start = chromInfo.absToBin(overlay.extent[0], resolution);
      anchor1.end = chromInfo.absToBin(overlay.extent[1], resolution);
      anchor2.start = chromInfo.absToBin(overlay.extent[2], resolution);
      anchor2.end = chromInfo.absToBin(overlay.extent[3], resolution);
      return {
        anchor1,
        anchor2,
        score: overlay.score,
        uid: overlay.uid,
        options: overlay.options.threed,
      };
    });
  }, [overlays, chromInfo, resolution]);

  const { colormap1d, colormap2d } = overlays;

  const vmin1d = colormap1d.vmin != null ? colormap1d.vmin : overlays.min1d;
  const vmax1d = colormap1d.vmax != null ? colormap1d.vmax : overlays.max1d;
  const vmin2d = colormap2d.vmin != null ? colormap2d.vmin : overlays.min2d;
  const vmax2d = colormap2d.vmax != null ? colormap2d.vmax : overlays.max2d;

  const colorScale1d = useMemo(() => {
    if (vmin1d >= vmax1d) {
      return undefined;
    }
    return chroma.scale(colormap1d.name).domain([vmin1d, vmax1d]);
  }, [vmin1d, vmax1d, colormap1d.name]);

  const colorScale2d = useMemo(() => {
    if (vmin2d >= vmax2d) {
      return undefined;
    }
    return chroma.scale(colormap2d.name).domain([vmin2d, vmax2d]);
  }, [vmin2d, vmax2d, colormap2d.name]);
  // FIXME: what if the 1d annotation is only 1 bin?

  const tracks1d = [];

  overlays1d.forEach((overlay) => {
    const { anchor1, anchor2 } = overlay;
    /*
    let points = [];

    const chr = anchor1.chr;
    if (anchor2.chr !== chr) {
      // throw Error("1D annotation should be within one chromosome.");
      return;
    }
    const s1 = segmentData[chr].binToSegment[anchor1.bin];
    const s2 = segmentData[chr].binToSegment[anchor2.bin];
    // TODO: assume both anchors are on the same chromosomes now
    const segments = segmentData[chr].segments;
    // make sure the start is not on the last non-segment
    if (s1 >= segments.length) {
      return;
    }
    const segment1 = segments[s1];
    // get the point to the bin
    const start = Math.max(0, anchor1.bin - segment1.start);
    // FIXME: if bin < segment2.start, end could be negative
    // const end = Math.min(
    //   segment2.points.length,
    //   segment2.points.length - segment2.end + anchor2.bin
    // );

    // const segment2 = segments[s2];
    // const end = anchor2.bin - segment2.start + 1;

    if (s1 === s2) {
      // two anchors on the same segment
      const end = anchor2.bin - segment1.start + 1;
      if (start < end) {
        points = segment1.points.slice(start, end);
      }
    } else {
      points = points.concat(segment1.points.slice(start));
      for (let i = s1 + 1; i < s2; i++) {
        points = points.concat(segments[i].points);
      }
      // make sure s2 is not the last non-segment
      if (s2 < segments.length) {
        const segment2 = segments[s2];
        const end = anchor2.bin - segment2.start + 1;
        if (end > 0) {
          points = points.concat(segment2.points.slice(0, end));
        }
      }
    }
    */
    let scoreColor;
    if (overlay.score !== null && colorScale1d !== undefined) {
      scoreColor = colorScale1d(overlay.score).hex();
    }

    const points = getPoints(anchor1, anchor2, segmentData);

    if (points.length > 0) {
      tracks1d.push(
        <Overlay1dTrack
          key={overlay.uid}
          points={points}
          scoreColor={scoreColor}
          options={overlay.options}
        />
      );
    }
  });

  const tracks2d = [];

  overlays2d.forEach((overlay) => {
    const { anchor1, anchor2 } = overlay;
    // anchor = { start: { chr, bin }, end: { chr, bin } }
    // for points on anchor1
    const points1 = getPoints(anchor1.start, anchor1.end, segmentData);
    // for points on anchor2
    const points2 = getPoints(anchor2.start, anchor2.end, segmentData);

    /*
    const s1 = segmentData[anchor1.chr].binToSegment[anchor1.bin]; // segment index
    const s2 = segmentData[anchor2.chr].binToSegment[anchor2.bin];

    const segment1 = segmentData[anchor1.chr].segments[s1];
    const segment2 = segmentData[anchor2.chr].segments[s2];
    // get the point to the bin
    // TODO: what if bin is missing?
    const point1 = segment1.points[anchor1.bin - segment1.start];
    const point2 = segment2.points[anchor2.bin - segment2.start];
    */

    let scoreColor;
    if (overlay.score !== null && colorScale2d !== undefined) {
      scoreColor = colorScale2d(overlay.score).hex();
    }

    if (points1.length > 0 || points2.length > 0) {
      tracks2d.push(
        <Overlay2dTrack
          key={overlay.uid}
          anchor1={points1}
          anchor2={points2}
          scoreColor={scoreColor}
          options={overlay.options}
        />
      );
    }
  });

  return (
    <>
      {tracks1d.length > 0 && tracks1d}
      {tracks2d.length > 0 && tracks2d}
    </>
  );
};

export default OverlaysTrack;
