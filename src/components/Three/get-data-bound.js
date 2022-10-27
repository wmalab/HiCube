import { lastElem } from "../../utils";

export const getBounds = (chroms, data, category) => {
  const maxBound = {};
  const minBound = {};
  const axes = ["x", "y", "z"];
  for (const chr of chroms) {
    if (data && data[category] && data[category][chr]) {
      const { max, min } = data[category][chr];
      for (const axis of axes) {
        maxBound[axis] =
          maxBound[axis] > max[axis] ? maxBound[axis] : max[axis];
        minBound[axis] =
          minBound[axis] < min[axis] ? minBound[axis] : min[axis];
      }
    }
  }
  return { max: maxBound, min: minBound };
};

// get approx viewing regin data bounds
export const getDataBounds = (binRanges, data) => {
  // binRanges: { chrom: [[binStart, binEnd (exclude)], ...] }
  // data: { chrom: { segments, binToSegment, max, min }}
  if (!binRanges || !data) {
    return undefined;
  }
  const maxBound = {};
  const minBound = {};
  const axes = ["x", "y", "z"];

  for (const chr in binRanges) {
    if (!(chr in data)) {
      // if that chr is missing
      continue;
    }
    for (const binRange of binRanges[chr]) {
      // console.log(data, chr);
      const { binToSegment, segments } = data[chr];
      const b1 = binRange[0];
      // TODO: need to check if bin is on last non-segment
      const s1 = binToSegment[b1];
      const b2 = binRange[1] - 1;
      const s2 = binToSegment[b2];
      // BEWARE: the startBin and endBin could all end on same non-segment
      // so its actually empty
      if (s1 >= segments.length) {
        continue;
      }
      const segment1 = segments[s1];
      const start = Math.max(0, b1 - segment1.start);
      let p1, p2;
      if (s1 === s2) {
        // on the same segment, make sure b2 is after segment start, otherwise its empty
        const end = b2 - segment1.start + 1;
        if (start < end) {
          p1 = segment1.points[start];
          p2 = segment1.points[end - 1];
        }
      } else {
        // on different segment
        p1 = segment1.points[start];
        // s1 < s2
        p2 = lastElem(segments[s2 - 1].points);
        // if bin2 is on segment
        if (s2 < segments.length) {
          const segment2 = segments[s2];
          const end = b2 - segment2.start + 1;
          if (end > 0) {
            p2 = segment2.points[end - 1];
          }
        }
      }
      axes.forEach((axis, index) => {
        if (p1) {
          maxBound[axis] =
            maxBound[axis] > p1[index] ? maxBound[axis] : p1[index];
          minBound[axis] =
            minBound[axis] < p1[index] ? minBound[axis] : p1[index];
        }
        if (p2) {
          maxBound[axis] =
            maxBound[axis] > p2[index] ? maxBound[axis] : p2[index];
          minBound[axis] =
            minBound[axis] < p2[index] ? minBound[axis] : p2[index];
        }
      });
      // --------------------------------------------------------
    }
  }
  return { max: maxBound, min: minBound };
};
