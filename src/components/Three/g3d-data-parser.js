import Segment from "./g3djs/segment";

const g3dDataParser = (data, chromInfo, resolution, setData, setChroms) => {
  const cats = Object.keys(data);
  const chroms = Object.keys(data[cats[0]]);

  const bins = {}; // index by category

  for (const cat of cats) {
    const catBins = {}; // index by chr

    for (const chr of chroms) {
      const segments = [];
      const segmentIndex = new Array(chromInfo.getChromBins(chr, resolution));
      const currData = data[cat][chr];
      let bi, x, y, z;
      let maxX = currData.x[0];
      let minX = maxX;
      let maxY = currData.y[0];
      let minY = maxY;
      let maxZ = currData.z[0];
      let minZ = maxZ;
      let currSegment = new Segment();
      let currStop = 0;

      for (let i = 0; i < currData.start.length; i++) {
        bi = Math.floor(currData.start[i] / resolution);
        x = currData.x[i];
        y = currData.y[i];
        z = currData.z[i];
        if (!currSegment.add(bi, [x, y, z])) {
          // if not the next of current segment
          // save the current segment and start a new one
          segments.push(currSegment);
          currSegment = new Segment(bi, [x, y, z]);
        }
        // update the max and min of coordinates for current chr
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        maxZ = Math.max(maxZ, z);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        minZ = Math.min(minZ, z);
      }
      if (!currSegment.isEmpty()) {
        segments.push(currSegment);
      }

      // each non-segment bin is mapped to the next segment index
      segments.forEach((segment, index) => {
        segmentIndex.fill(index, currStop, segment.end + 1);
        currStop = segment.end + 1;
      });
      // the non-segment bins at the end without segment follow, mapped to segments.length
      if (currStop < segmentIndex.length) {
        segmentIndex.fill(segments.length, currStop);
      }

      catBins[chr] = {
        segments,
        binToSegment: segmentIndex,
        max: { x: maxX, y: maxY, z: maxZ },
        min: { x: minX, y: minY, z: minZ },
      };
    }
    bins[cat] = catBins;
  }

  if (setChroms !== undefined) {
    console.log("set g3d chroms");
    setChroms([...chroms]);
  }

  if (setData !== undefined) {
    console.log("set g3d data");
    setData(bins);
  }
};

export default g3dDataParser;
