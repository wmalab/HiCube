import { useState, useCallback, useEffect, useMemo } from "react";
import { ChromosomeInfo } from "higlass";

function chromBound(chromInfo, currentChrom) {
  // const start = chromInfo.chrPositions[currentChrom].pos;
  const start = chromInfo.chrPositions[currentChrom].pos + 1;
  const end = start + chromInfo.chromLengths[currentChrom] - 1;
  return [start, end];
}

function shouldUpdateDomain(domain, bound) {
  if (!domain) {
    return false;
  }
  if (domain[0] >= bound[0] && domain[1] <= bound[1]) {
    return false;
  }
  return true;
}

// TODO: get which chrom from the absolute positions
// if is outside of the current chrom need to bounce back
// how to init current chrom? this should from the initial XY domains
// from add a case, and if positions span multiple chromosomes,
// pick the first one
// try init currChrom with chr1 first
const useChromBound = (chromInfoPath) => {
  const [chromInfo, setChromInfo] = useState();
  // put these to configs
  // const [currentXChrom, setCurrentXChrom] = useState("chr1");
  // const [currentYChrom, setCurrentYChrom] = useState("chr1");

  const navChroms = useCallback(
    (chrom, direction) => {
      if (!chromInfo) {
        return undefined;
      }
      const { chrPositions, cumPositions } = chromInfo;
      const index = chrPositions[chrom].id;
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < cumPositions.length) {
        return cumPositions[newIndex].chr;
      }
      return undefined;
    },
    [chromInfo]
  );

  const getChromBound = useCallback(
    (chrom) => chromBound(chromInfo, chrom),
    [chromInfo]
  );

  const allChroms = useMemo(
    () => (chromInfo ? chromInfo.cumPositions.map((el) => el.chr) : []),
    [chromInfo]
  );

  const getBounds = useCallback(
    (xChrom, yChrom) => {
      if (!chromInfo) {
        return undefined;
      }
      return {
        xDomain: chromBound(chromInfo, xChrom),
        yDomain: chromBound(chromInfo, yChrom),
      };
    },
    [chromInfo]
  );

  const chromPositions = useMemo(() => {
    if (!chromInfo) {
      return undefined;
    }
    // chr : { prev: chr, next: chr, start: pos, end: pos }
    const { cumPositions, chromLengths } = chromInfo;
    return cumPositions.reduce((dict, el, index, array) => {
      dict[el.chr] = {
        prev: index > 0 ? array[index - 1].chr : null,
        next: index < array.length - 1 ? array[index + 1].chr : null,
        start: el.pos,
        end: el.pos + chromLengths[el.chr] - 1,
      };
      return dict;
    }, {});
  }, [chromInfo]);

  useEffect(() => {
    if (chromInfoPath) {
      ChromosomeInfo(chromInfoPath, (newChromInfo) => {
        setChromInfo(newChromInfo);
      });
    }
  }, [chromInfoPath]);

  const validateXYDomains = useCallback(
    (location, currentXChrom, currentYChrom) => {
      // check X domain if it's inside the current bound
      // check Y domain if it's inside the current bound
      // no action required
      // require move
      // require move/resize
      if (!chromInfo || !location) {
        return { isUpdate: false };
      }
      const xBound = chromBound(chromInfo, currentXChrom);
      const yBound = chromBound(chromInfo, currentYChrom);
      const { xDomain, yDomain } = location;
      const updateX = shouldUpdateDomain(xDomain, xBound);
      const updateY = shouldUpdateDomain(yDomain, yBound);
      if (!updateX && !updateY) {
        return { isUpdate: false };
      }
      // need to update x or y domains
      // x and y domains can be decimals and beyond [0, totalLength)
      const xLength = xDomain[1] - xDomain[0] + 1;
      const yLength = yDomain[1] - yDomain[0] + 1;
      const ratio = yLength / xLength;
      const newXDomain = [...xDomain];
      const newYDomain = [...yDomain];

      if (updateX) {
        if (xDomain[0] < xBound[0]) {
          newXDomain[0] = xBound[0];
          newXDomain[1] = xBound[0] + xLength - 1;
        } else {
          newXDomain[1] = xBound[1];
          newXDomain[0] = xBound[1] - xLength + 1;
        }
      }

      if (updateY) {
        if (yDomain[0] < yBound[0]) {
          newYDomain[0] = yBound[0];
          newYDomain[1] = yBound[0] + yLength - 1;
        } else {
          newYDomain[1] = yBound[1];
          newYDomain[0] = yBound[1] - yLength + 1;
        }
      }

      // TODO: when new domain too long outside of bound? need to resize
      if (shouldUpdateDomain(newXDomain, xBound)) {
        newXDomain[0] = xBound[0];
        newXDomain[1] = xBound[1];
        const newYLength = (newXDomain[1] - newXDomain[0] + 1) * ratio;
        newYDomain[0] = Math.max(newYDomain[0], yBound[0]);
        newYDomain[1] = newYDomain[0] + newYLength - 1;
      }

      if (shouldUpdateDomain(newYDomain, yBound)) {
        newYDomain[0] = yBound[0];
        newYDomain[1] = yBound[1];
        const newXLength = (newYDomain[1] - newYDomain[0] + 1) / ratio;
        newXDomain[0] = Math.max(newXDomain[0], xBound[0]);
        newXDomain[1] = newXDomain[0] + newXLength - 1;
      }

      return {
        isUpdate: true,
        xDomain: newXDomain,
        yDomain: newYDomain,
        xBound,
        yBound,
      };
    },
    [chromInfo]
  );

  return { validateXYDomains, navChroms, getBounds, allChroms, getChromBound };
};

export default useChromBound;
