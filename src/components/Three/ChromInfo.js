class ChromInfo {
  constructor(chromInfo, resolutions) {
    this.chromInfo = chromInfo;
    this.chroms = [];
    this.chromLengths = {};
    this.chromBins = {};

    chromInfo.cumPositions.map((cumPos) => {
      const chrom = cumPos.chr;
      this.chroms.push(chrom);
      const chromLength = Number(chromInfo.chromLengths[chrom]);
      this.chromLengths[chrom] = chromLength;

      resolutions.map((resolution) => {
        if (!(resolution in this.chromBins)) {
          this.chromBins[resolution] = {};
        }
        this.chromBins[resolution][chrom] = Math.ceil(chromLength / resolution);
      });
    });
  }

  absToChr(absPosition) {
    return this.chromInfo.absToChr(absPosition);
  }

  absToBin(absPosition, resolution) {
    const [chrom, pos] = this.absToChr(absPosition);
    const bin = this.posToBin(pos, resolution);
    return { chr: chrom, bin: bin };
  }

  posToBin(position, resolution) {
    return Math.floor(position / resolution);
  }

  getChromBins(chrom, resolution) {
    return this.chromBins[resolution][chrom];
  }

  // given a range in absolute scale, return all chromosomes within the range
  getChromsFromRange(range) {
    if (!range || range.length !== 2) {
      return [];
    }
    const [start, end] = range;
    const [chromStart] = this.absToChr(start);
    const [chromEnd] = this.absToChr(end);
    // find all the chroms that are visible
    const chromStartIndex = this.chroms.findIndex(
      (chrom) => chrom === chromStart
    );
    const chromEndIndex = this.chroms.findIndex((chrom) => chrom === chromEnd);
    return this.chroms.slice(chromStartIndex, chromEndIndex + 1);
  }

  mergeChromsFromRanges(range1, range2) {
    const chroms1 = this.getChromsFromRange(range1);
    const chroms2 = this.getChromsFromRange(range2);
    return [...new Set([...chroms1, ...chroms2])];
  }

  // given a range in absolute scale and resolution,
  // return [startBin, endBin] range for all chromosomes within the range
  getBinsFromRange(range, resolution) {
    if (!range || range.length !== 2) {
      return {};
    }
    const [start, end] = range;
    const [chromStart, posStart] = this.absToChr(start);
    const [chromEnd, posEnd] = this.absToChr(end);
    const chromStartIndex = this.chroms.findIndex(
      (chrom) => chrom === chromStart
    );
    const chromEndIndex = this.chroms.findIndex((chrom) => chrom === chromEnd);
    const binRanges = {};
    const binStart = this.posToBin(posStart, resolution);
    const binEnd = this.posToBin(posEnd, resolution);

    if (chromStartIndex === chromEndIndex) {
      binRanges[chromStart] = [binStart, binEnd + 1];
    } else {
      binRanges[chromStart] = [
        binStart,
        this.getChromBins(chromStart, resolution),
      ];
      binRanges[chromEnd] = [0, binEnd + 1];

      for (let i = chromStartIndex + 1; i < chromEndIndex; i++) {
        const chrom = this.chroms[i];
        // TODO: for full chromosome bin range maybe use other way to represent?
        binRanges[chrom] = [0, this.getChromBins(chrom, resolution)];
      }
    }
    return binRanges;
  }

  mergeBinsFromRanges(range1, range2, resolution) {
    const binRanges1 = this.getBinsFromRange(range1, resolution);
    const binRanges2 = this.getBinsFromRange(range2, resolution);
    const merged = {};

    for (const chrom in binRanges1) {
      merged[chrom] = [binRanges1[chrom]];
    }

    for (const chrom in binRanges2) {
      if (chrom in merged) {
        const prev = merged[chrom][0];
        const curr = binRanges2[chrom];

        if (prev[1] < curr[0]) {
          merged[chrom].push(curr);
        } else if (curr[1] < prev[0]) {
          merged[chrom].unshift(curr);
        } else {
          merged[chrom] = [
            [Math.min(prev[0], curr[0]), Math.max(prev[1], curr[1])],
          ];
        }
      } else {
        merged[chrom] = [binRanges2[chrom]];
      }
    }

    return merged;
  }
}

export default ChromInfo;
