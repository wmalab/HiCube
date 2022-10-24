import { useState, useCallback, useEffect } from "react";
import { ChromosomeInfo } from "higlass";
import { strToInt, numberWithCommas } from "../utils";

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
  const ret = { error, absPos, chrom };
  const { chrPositions, chromLengths } = chromInfo;
  // check chr1
  if (chr in chrPositions) {
    if (firstChrom) {
      // this is the second chr, pick the end position
      ret.absPos = chrPositions[chr].pos + chromLengths[chr] - 1;
    } else {
      // this is the first chr, pick the start position
      ret.absPos = chrPositions[chr].pos;
    }
    ret.chrom = chr;
    return ret;
  }
  // check chr1:10000
  if (chr.includes(":")) {
    const splited = splitToTwo(chr, ":");
    if (!splited.valid) {
      ret.error = "Invalid format";
      return ret;
    }
    if (!(splited.first in chrPositions)) {
      ret.error = `Chromosome name ${splited.first} does not exist`;
      return ret;
    }
    try {
      ret.chrom = splited.first;
      const pos = strToInt(splited.second);
      if (isNaN(pos) || pos < 0 || pos >= chromLengths[ret.chrom]) {
        ret.error = `Invalid position ${splited.second}`;
        return ret;
      }
      ret.absPos = chromInfo.chrToAbs([ret.chrom, pos]);
      return ret;
    } catch (err) {
      ret.error = err;
      return ret;
    }
  }

  // check 10000
  if (!firstChrom) {
    // is the start but without ':'
    ret.error = `Chromosome name ${chr} does not exist`;
    return ret;
  }
  try {
    const pos = strToInt(chr);
    if (!(firstChrom in chromLengths)) {
      ret.error = `Chromosome name ${firstChrom} does not exist`;
      return ret;
    }
    if (isNaN(pos) || pos < 0 || pos >= chromLengths[firstChrom]) {
      ret.error = `Invalid position ${chr}`;
      return ret;
    }
    ret.chrom = firstChrom;
    ret.absPos = chromInfo.chrToAbs([firstChrom, pos]);
    return ret;
  } catch (err) {
    ret.error = err;
    return ret;
  }
};

const chrToInterval = (chr, chromInfo) => {
  let error, startAbsPos, endAbsPos;
  const ret = { error, startAbsPos, endAbsPos };
  const { chrPositions, chromLengths } = chromInfo;

  if (!(chr in chrPositions)) {
    ret.error = `Chromosome name ${chr} does not exist`;
    return ret;
  }
  ret.startAbsPos = chrPositions[chr].pos;
  ret.endAbsPos = ret.startAbsPos + chromLengths[chr] - 1;
  return ret;
};

const convertGenomePosition = (
  position,
  chromInfo,
  onSameChrom = false,
  minDist = 300000
) => {
  let error, startAbsPos, endAbsPos;
  const ret = { error, startAbsPos, endAbsPos };

  if (position.includes("-")) {
    const splited = splitToTwo(position, "-");
    if (!splited.valid) {
      ret.error = "Invalid format";
      return ret;
    }
    const first = chrToAbs(splited.first, chromInfo);
    if (first.error) {
      ret.error = first.error;
      return ret;
    }
    const second = chrToAbs(splited.second, chromInfo, first.chrom);
    if (second.error) {
      ret.error = second.error;
      return ret;
    }
    if (onSameChrom && first.chrom !== second.chrom) {
      ret.error = "Must be on the same chromosome";
      return ret;
    }
    if (second.absPos - first.absPos <= minDist) {
      ret.error = `Genome interval must be at least ${minDist}`;
      return ret;
    }
    ret.startAbsPos = first.absPos;
    ret.endAbsPos = second.absPos;
    return ret;
  }
  // if position does not contain '-', it can only be a chrom name
  const unsplited = chrToInterval(position, chromInfo);
  ret.error = unsplited.error;
  ret.startAbsPos = unsplited.startAbsPos;
  ret.endAbsPos = unsplited.endAbsPos;
  return ret;
};

const useChromInfo = (chromInfoPath) => {
  const [chromInfo, setChromInfo] = useState();
  const [chroms, setChroms] = useState([]);

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
      setChroms(newChromInfo.cumPositions.map((cumPos) => cumPos.chr));
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
      if (position.trim() === "") {
        return "Must not be empty";
      }
      const { error } = convertGenomePosition(position, chromInfo);
      return error;
    },
    [chromInfo]
  );

  const validateGenomePositionOnSameChrom = useCallback(
    (position) => {
      if (!chromInfo) {
        return undefined;
      }
      if (position.trim() === "") {
        return "Must not be empty";
      }
      const { error } = convertGenomePosition(position, chromInfo, true, 5000);
      return error;
    },
    [chromInfo]
  );

  const getGenomePosition = useCallback(
    (position) => {
      if (!chromInfo || position.trim() === "") {
        return undefined;
      }
      const { error, startAbsPos, endAbsPos } = convertGenomePosition(
        position,
        chromInfo
      );
      if (error) {
        return undefined;
      }
      return [startAbsPos, endAbsPos];
    },
    [chromInfo]
  );

  const toGenomePositionString = useCallback(
    (absPos) => {
      if (!chromInfo || !absPos || absPos.length < 2) {
        return "";
      }
      const [startAbsPos, endAbsPos] = absPos;
      if (startAbsPos == null || endAbsPos == null) {
        return "";
      }
      const [startChrom, startPos] = chromInfo.absToChr(startAbsPos);
      const [endChrom, endPos] = chromInfo.absToChr(endAbsPos);
      // if the range is within the same chromosome
      // use format `${chrom}:${start}-${end}`
      const startPosStr = numberWithCommas(startPos);
      const endPosStr = numberWithCommas(endPos);
      if (startChrom === endChrom) {
        return `${startChrom}:${startPosStr}-${endPosStr}`;
      } else {
        return `${startChrom}:${startPosStr}-${endChrom}:${endPosStr}`;
      }
    },
    [chromInfo]
  );

  return {
    validateGenomePosition,
    validateGenomePositionOnSameChrom,
    getGenomePosition,
    toGenomePositionString,
    chroms,
  };
};

export default useChromInfo;
