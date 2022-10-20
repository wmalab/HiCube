import { useState, useCallback, useEffect } from "react";
import { ChromosomeInfo } from "higlass";
import { strToInt } from "../utils";

const splitToTwo = (str, sep) => {
  const items = str.split(sep);
  if (items.length !== 2) {
    return { valid: false, first: null, second: null };
  }
  return { valid: true, first: items[0].trim(), second: items[1].trim() };
};

const chrToAbs = (chr, chromInfo, firstChrom = "") => {
  // `chr`: chr1, chr1:10000, 100000 (if has firstChrom)
  let error, absPos, chrom;
  // check chr1
  if (chr in chromInfo.chrPositions) {
    if (firstChrom) {
      // this is the second chr, pick the end position
      absPos =
        chromInfo.chrPositions[chr].pos + chromInfo.chromLengths[chr] - 1;
    } else {
      // this is the first chr, pick the start position
      absPos = chromInfo.chrPositions[chr].pos;
    }
    return { error, absPos, chrom: chr };
  }
  // check chr1:10000
  if (chr.includes(":")) {
    const splited = splitToTwo(chr, ":");
    if (!splited.valid) {
      error = "Wrong format";
      return { error, absPos, chrom };
    }
    if (!(splited.first in chromInfo.chrPositions)) {
      error = "Wrong format";
      return { error, absPos, chrom };
    }
    try {
      const pos = strToInt(splited.second);
      if (
        isNaN(pos) ||
        pos < 0 ||
        pos >= chromInfo.chromLengths[splited.first]
      ) {
        error = "Wrong format";
        return { error, absPos, chrom };
      }
      absPos = chromInfo.chrToAbs([splited.first, pos]);
      return { error, absPos, chrom: splited.first };
    } catch (err) {
      error = err;
      return { error, absPos, chrom };
    }
  }

  // check 10000
  if (!firstChrom) {
    error = "Wrong format";
    return { error, absPos, chrom };
  }
  try {
    const pos = strToInt(chr);
    if (!(firstChrom in chromInfo.chromLengths)) {
      error = "Wrong format";
      return { error, absPos, chrom };
    }
    if (isNaN(pos) || pos < 0 || pos >= chromInfo.chromLengths[firstChrom]) {
      error = "Wrong format";
      return { error, absPos, chrom };
    }
    absPos = chromInfo.chrToAbs([firstChrom, pos]);
    return { error, absPos, chrom: firstChrom };
  } catch (err) {
    error = err;
    return { error, absPos, chrom };
  }
};

const chrToInterval = (chr, chromInfo) => {
  let error, absPos1, absPos2;
  if (!(chr in chromInfo.chrPositions)) {
    error = "Wrong format";
    return { error, absPos1, absPos2 };
  }
  absPos1 = chromInfo.chrPositions[chr].pos;
  absPos2 = absPos1 + chromInfo.chromLengths[chr] - 1;
  return { error, absPos1, absPos2 };
};

const useChromInfo = (chromInfoPath) => {
  const [chromInfo, setChromInfo] = useState();

  // fetch the latest chromosome info
  // ChromosomeInfo API -------------------------------------
  // absToChr: f()
  // chrPositions: {chr1: {id: 0, chr: 'chr1', pos: 0}, ...}
  // chrToAbs: f()
  // chromLengths: {chr1: 249250621, ...}
  // cumPositions: [{id: 0, chr: 'chr1', pos: 0}, ...]
  // totalLength
  // --------------------------------------------------------
  useEffect(() => {
    ChromosomeInfo(chromInfoPath, (newChromInfo) => {
      setChromInfo(newChromInfo);
    });
  }, [chromInfoPath]);

  // validate genome position
  // case 1: no sep => chr1
  // case 2: sep by - => (start)-(end)
  // case 2.1.1: (start) no sep => chr1
  // case 2.1.2: (start) sep by : => chr1:1000
  // case 2.2.1: (end) no sep => chr2
  // case 2.2.2: (end) sep by : => chr2:2000
  const validateGenomePosition = useCallback(
    (required, position) => {
      if (!chromInfo) {
        return undefined;
      }
      if (!required && position.trim() === "") {
        return undefined;
      }
      if (position.includes("-")) {
        const splited = splitToTwo(position, "-");
        if (!splited.valid) {
          return "Wrong format";
        }
        const first = chrToAbs(splited.first, chromInfo);
        if (first.error) {
          return first.error;
        }
        const second = chrToAbs(splited.second, chromInfo, first.chrom);
        if (second.error) {
          return second.error;
        }
        if (second.absPos - first.absPos <= 2000) {
          return "Too short";
        }
        console.log(first.absPos, second.absPos);
      } else {
        const { error, absPos1, absPos2 } = chrToInterval(position, chromInfo);
        console.log(absPos1, absPos2);
        return error;
      }
    },
    [chromInfo]
  );

  return { validateGenomePosition };
};

export default useChromInfo;
