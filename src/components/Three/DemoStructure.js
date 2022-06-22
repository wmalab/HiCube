const random = (min, max) => {
  return Math.random() * (max - min) + min;
};

const randomVec = (min, max, dim = 3) => {
  const vec = [];
  for (let i = 0; i < dim; i++) {
    vec.push(random(min, max));
  }
  return vec;
};

const addVec = (v1, v2) => {
  const dim = v1.length;
  const sum = [];
  for (let i = 0; i < dim; i++) {
    sum.push(v1[i] + v2[i]);
  }
  return sum;
};

const randomWalk = (start, resolution, length) => {
  const steps = Math.ceil(length / resolution);
  const path = [start];
  for (let i = 1; i < steps; i++) {
    const lastStep = path[path.length - 1];
    const newStep = addVec(lastStep, randomVec(-1, 1));
    path.push(newStep);
  }
  return path;
};

class DemoStructure {
  constructor(chromInfo, baseResolution = 500000) {
    this.chromInfo = chromInfo;
    this.chrom3d = {};
    this.baseNumBins = 0;
    this.baseResolution = baseResolution;
    this.chroms = [];
    this.chromsBins = {};
    for (const chrom in this.chromInfo.chromLengths) {
      this.chroms.push(chrom);
      const chromLength = this.chromInfo.chromLengths[chrom];
      this.chrom3d[chrom] = randomWalk(
        randomVec(-10, 10),
        baseResolution,
        Number(chromLength)
      );
      const bins = this.chrom3d[chrom].length;
      this.chromsBins[chrom] = bins;
      this.baseNumBins += bins;
    }
    console.log(this.chromsBins);
    console.log(this.baseNumBins);
    console.log(Object.keys(this.chromInfo));
  }

  points(chrom) {
    return this.chrom3d[chrom];
  }

  get numChroms() {
    return this.chroms.length;
  }

  chromRange(absDomain) {
    if (absDomain) {
      const [chrom1] = this.chromInfo.absToChr(absDomain[0]);
      const [chrom2] = this.chromInfo.absToChr(absDomain[1]);
      // find all the chroms that are visible
      const chromStart = this.chromInfo.cumPositions.findIndex(
        (cumPos) => cumPos.chr === chrom1
      );
      const chromEnd = this.chromInfo.cumPositions.findIndex(
        (cumPos) => cumPos.chr === chrom2
      );
      const chroms = this.chroms.slice(chromStart, chromEnd + 1);
      console.log(chroms);
      return chroms;
    }
    return [];
  }

  absToPoint(absPos) {
    // get the chrom & position
    const [chrom, pos] = this.chromInfo.absToChr(absPos);
    // get bin index
    const bin = Math.floor(pos / this.baseResolution);
    // return the 3d point of the bin
    return this.chrom3d[chrom][bin];
  }

  absToPoints(absPos1, absPos2) {
    // get all points between absPos1 and absPos2
    // TODO: make sure 1d overlay not include multiple chroms
    const [chrom1, pos1] = this.chromInfo.absToChr(absPos1);
    const [chrom2, pos2] = this.chromInfo.absToChr(absPos2);
    const bin1 = Math.floor(pos1 / this.baseResolution);
    const bin2 = Math.floor(pos2 / this.baseResolution);
    return this.chrom3d[chrom1].slice(bin1, bin2 + 1);
  }

  binRange(absDomain) {
    if (absDomain) {
      const range = {};
      const [chrom1, pos1] = this.chromInfo.absToChr(absDomain[0]);
      const [chrom2, pos2] = this.chromInfo.absToChr(absDomain[1]);
      const chromStart = this.chroms.findIndex((chrom) => chrom === chrom1);
      const chromEnd = this.chroms.findIndex((chrom) => chrom === chrom2);
      if (chromStart === chromEnd) {
        range[chrom1] = [
          Math.floor(pos1 / this.baseResolution),
          Math.floor(pos2 / this.baseResolution) + 1,
        ];
      } else {
        range[chrom1] = [
          Math.floor(pos1 / this.baseResolution),
          this.chromsBins[chrom1],
        ];
        range[chrom2] = [0, Math.floor(pos2 / this.baseResolution) + 1];
        const otherChroms = this.chroms.slice(chromStart + 1, chromEnd);
        for (const chrom of otherChroms) {
          range[chrom] = [0, this.chromsBins[chrom]];
        }
      }
      return range;
    }
    return {};
  }
}

export default DemoStructure;
