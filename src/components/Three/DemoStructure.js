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
    this.chroms = [];
    for (const chrom in this.chromInfo.chromLengths) {
      this.chroms.push(chrom);
      const chromLength = this.chromInfo.chromLengths[chrom];
      this.chrom3d[chrom] = randomWalk(
        randomVec(-10, 10),
        baseResolution,
        Number(chromLength)
      );
      this.baseNumBins += this.chrom3d[chrom].length;
    }
    console.log(this.baseNumBins);
    console.log(Object.keys(this.chromInfo));
  }

  points(chrom) {
    return this.chrom3d[chrom];
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
      const chroms = this.chromInfo.cumPositions
        .slice(chromStart, chromEnd + 1)
        .map((cumPos) => cumPos.chr);
      console.log(chroms);
      return chroms;
    }
    return [];
  }
}

export default DemoStructure;
