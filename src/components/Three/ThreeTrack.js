/*
The ThreeTrack consists of two major components: 
data loader and structure render
data loader:
- g3d format using g3djs
- other format can be converted to g3d
  - use python library g3dtools
- multivec format using HiGlass server
structure render:
- use a similar viewConfig as HiGlass
  - ThreeTrack parse the viewConfig and setup the views and options
  - ThreeView render each view with options
*/


import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { ChromosomeInfo } from "higlass";
import DemoStructure from "./DemoStructure";
import { makeColorGradient } from "../../utils";
import Backbone from "./Backbone";
import OverlaysTrack from "./OverlaysTrack";

// DONE: use chromInfoPath from genomeAssemply props
// const chromInfoPath = "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv";

// DONE: add overlays
// TODO: add zoom view
// FIXME: when init with partial genome regions, chromosomes not visible will always be grey

const ThreeTrack = (props) => {
  const { genomeAssembly: { chromInfoPath } } = props;
  const [chromInfo, setChromInfo] = useState();
  const [demo3d, setDemo3d] = useState();

  useEffect(() => {
    if (chromInfoPath) {
      ChromosomeInfo(chromInfoPath, (newChromInfo) => {
        setChromInfo(newChromInfo);
      });
    }
  }, [chromInfoPath]);

  useEffect(() => {
    if (!chromInfo) {
      return;
    }
    console.log("init demo3d");
    setDemo3d(new DemoStructure(chromInfo));
  }, [chromInfo]);

  let chroms = [];

  if (demo3d) {
    const xChroms = demo3d.chromRange(props.mainLocation.xDomain);
    const yChroms = demo3d.chromRange(props.mainLocation.yDomain);
    chroms = [...new Set([...xChroms, ...yChroms])];
  }

  // TODO: for each chrom calc current view range
  const colorsByChrom = useMemo(() => {
    if (demo3d) {
      const colors = makeColorGradient();
      const colorsMap = {};
      for (let i = 0; i < demo3d.numChroms; i++) {
        const chrom = demo3d.chroms[i];
        colorsMap[chrom] = Array(demo3d.chromsBins[chrom]).fill(colors[i]);
      }
      return colorsMap;
    } else {
      return undefined;
    }
  }, [demo3d]);

  let maskedColors = {};

  // TODO: get the bin range of the x and y domains and see if need to merge them
  // TODO: get the colors of the intervals

  const locationToBinRange = (location) => {
    const xBinRange = demo3d.binRange(location.xDomain);
    const yBinRange = demo3d.binRange(location.yDomain);

    const range = {};
    for (const chrom in xBinRange) {
      range[chrom] = [xBinRange[chrom]];
    }
    for (const chrom in yBinRange) {
      if (chrom in range) {
        const prevR = range[chrom][0];
        const newR = yBinRange[chrom];
        // no overlap
        if (prevR[1] < newR[0]) {
          range[chrom].push(newR);
        } else if (newR[1] < prevR[0]) {
          range[chrom].unshift(newR);
        } else {
          // merge two intervals
          range[chrom] = [
            [Math.min(prevR[0], newR[0]), Math.max(prevR[1], newR[1])],
          ];
        }
      } else {
        range[chrom] = [yBinRange[chrom]];
      }
    }
    return range;
  };

  let zoomSegments = [];
  let zoomSegmentsColors = [];

  if (demo3d && props.zoomLocation.xDomain && props.zoomLocation.yDomain) {
    const range = locationToBinRange(props.zoomLocation);
    for (const chrom in range) {
      for (const interval of range[chrom]) {
        zoomSegments.push(
          demo3d.chrom3d[chrom].slice(interval[0], interval[1])
        );
        zoomSegmentsColors.push(
          colorsByChrom[chrom].slice(interval[0], interval[1])
        );
      }
    }
  }

  if (colorsByChrom && chroms) {
    const xBinRange = demo3d.binRange(props.mainLocation.xDomain);
    const yBinRange = demo3d.binRange(props.mainLocation.yDomain);

    const range = {};
    for (const chrom in xBinRange) {
      range[chrom] = [xBinRange[chrom]];
    }
    for (const chrom in yBinRange) {
      if (chrom in range) {
        const prevR = range[chrom][0];
        const newR = yBinRange[chrom];
        // no overlap
        if (prevR[1] < newR[0]) {
          range[chrom].push(newR);
        } else if (newR[1] < prevR[0]) {
          range[chrom].unshift(newR);
        } else {
          // merge two intervals
          range[chrom] = [
            [Math.min(prevR[0], newR[0]), Math.max(prevR[1], newR[1])],
          ];
        }
      } else {
        range[chrom] = [yBinRange[chrom]];
      }
    }

    // const range = locationToBinRange(props.mainLocation);

    for (const chrom in range) {
      const fill = range[chrom];
      console.log(fill);
      maskedColors[chrom] = [];
      if (fill[0][0] > 0) {
        maskedColors[chrom] = maskedColors[chrom].concat(
          Array(fill[0][0]).fill([1, 1, 1])
        );
      }
      maskedColors[chrom] = maskedColors[chrom].concat(
        colorsByChrom[chrom].slice(fill[0][0], fill[0][1])
      );
      if (fill.length > 1) {
        console.log(fill[1][0] - fill[0][1]);
        maskedColors[chrom] = maskedColors[chrom].concat(
          Array(fill[1][0] - fill[0][1]).fill([1, 1, 1])
        );
        maskedColors[chrom] = maskedColors[chrom].concat(
          colorsByChrom[chrom].slice(fill[1][0], fill[1][1])
        );
      }
      if (fill[fill.length - 1][1] < demo3d.chromsBins[chrom]) {
        maskedColors[chrom] = maskedColors[chrom].concat(
          Array(demo3d.chromsBins[chrom] - fill[fill.length - 1][1]).fill([
            1, 1, 1,
          ])
        );
      }
      console.log(maskedColors[chrom]);
    }
  }

  const overlays1d = useMemo(() => {
    if (demo3d && props.overlays.length > 0) {
      return props.overlays
        .filter((overlay) => overlay.extent.length === 2)
        .map((overlay) => {
          const points = demo3d.absToPoints(
            overlay.extent[0],
            overlay.extent[1]
          );
          return { points, uid: overlay.uid };
        });
    }
    return [];
  }, [props.overlays, demo3d]);

  const overlays2d = useMemo(() => {
    if (demo3d && props.overlays.length > 0) {
      return props.overlays
        .filter((overlay) => overlay.extent.length > 2)
        .map((overlay) => {
          const anchor1 = demo3d.absToPoint(overlay.extent[0]);
          const anchor2 = demo3d.absToPoint(overlay.extent[2]);
          return { anchor1, anchor2, uid: overlay.uid };
        });
    }
    return [];
  }, [props.overlays, demo3d]);

  // TODO: set default camera position so all extent are visible
  // FIXME: seems add one more div wrapper make the canvas not a direct child in flex item
  // and cause random line not coloring right
  return (
    <>
    {zoomSegments.length > 0 && (
      <div style={{ height: 350, width: 350 }}>
        <Canvas>
          <group>
            {zoomSegments.map((segment, index) => {
              return (
                <Backbone 
                  points={segment}
                  colors={zoomSegmentsColors[index]}
                  lw={8}
                  opacity={1}
                />
              );
            })}
          </group>
          <OrbitControls zoomSpeed={0.5} />
        </Canvas>
      </div>
    )}
    <div style={{ height: 350, width: 350 }}>
    <Canvas>
      {/* <color attach="background" args={["black"]} /> */}
      {demo3d && (
        <group>
          {demo3d.chroms.length > 0 &&
            demo3d.chroms.map((chrom) => {
              const visible = chroms.includes(chrom);
              return (
                <Backbone 
                  key={chrom}
                  points={demo3d.chrom3d[chrom]}
                  colors={visible ? maskedColors[chrom] : false}
                  lw={8}
                  opacity={visible ? 1 : 0.01}
                />
              );
            })}
        </group>
      )}
      {demo3d && (
        <OverlaysTrack overlays1d={overlays1d} overlays2d={overlays2d} />
      )}
      <OrbitControls zoomSpeed={0.5} />
    </Canvas>
    </div>
    </>
  );
};

export default ThreeTrack;
