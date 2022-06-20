import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { ChromosomeInfo } from "higlass";
import DemoStructure from "./DemoStructure";
import { makeColorGradient } from "../../utils";

const chromInfoPath = "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv";

const ThreeTrack = (props) => {
  const [chromInfo, setChromInfo] = useState();
  const [demo3d, setDemo3d] = useState();

  useEffect(() => {
    ChromosomeInfo(chromInfoPath, (newChromInfo) => {
      console.log("load chromInfo");
      setChromInfo(newChromInfo);
    });
  }, []);

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

  if (colorsByChrom && chroms) {
    const xBinRange = demo3d.binRange(props.mainLocation.xDomain);
    const yBinRange = demo3d.binRange(props.mainLocation.yDomain);
    console.log(xBinRange, yBinRange);
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

  // TODO: set default camera position so all extent are visible
  return (
    <Canvas>
      {/* <color attach="background" args={["black"]} /> */}
      {demo3d && (
        <group>
          {demo3d.chroms.length > 0 &&
            demo3d.chroms.map((chrom) => {
              if (chroms.includes(chrom)) {
                return (
                  <Line
                    key={chrom}
                    points={demo3d.chrom3d[chrom]}
                    color="white"
                    vertexColors={maskedColors[chrom]}
                    lineWidth={5}
                    dashed={false}
                    transparent={false}
                    // FIXED: need to set opacity to 1.0 or it will be a white line
                    opacity={1}
                    // visible={true}
                  />
                );
              } else {
                return (
                  <Line
                    key={chrom}
                    points={demo3d.chrom3d[chrom]}
                    color="white"
                    vertexColors={false}
                    lineWidth={5}
                    dashed={false}
                    transparent={true}
                    opacity={0.02}
                    // visible={false}
                  />
                );
              }
            })}
        </group>
      )}
      <OrbitControls zoomSpeed={0.5} />
    </Canvas>
  );
};

export default ThreeTrack;
