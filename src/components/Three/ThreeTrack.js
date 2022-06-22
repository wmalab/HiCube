import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { ChromosomeInfo } from "higlass";
import DemoStructure from "./DemoStructure";
import { makeColorGradient } from "../../utils";

const chromInfoPath = "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv";

// TODO: add overlays

// a single sphere
const Overlay1DTrack = (props) => {
  const { points } = props;
  // FIXME: flash when rotate, may change to Tube?
  return (
    <group>
      <Line
        points={points}
        lineWidth={20}
        color="hotpink"
        transparent
        opacity={0.5}
      />
    </group>
  );
};

// two sphere each end and connected by a line
const Overlay2DTrack = (props) => {
  const { anchor1, anchor2 } = props;

  return (
    <group>
      <mesh position={anchor1}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="hotpink" />
      </mesh>
      <mesh position={anchor2}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="hotpink" />
      </mesh>
      <Line
        points={[anchor1, anchor2]}
        lineWidth={5}
        dashed={true}
        color="hotpink"
      />
    </group>
  );
};

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
                    lineWidth={8}
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
                    lineWidth={8}
                    dashed={false}
                    transparent={true}
                    opacity={0.01}
                    // visible={false}
                  />
                );
              }
            })}
        </group>
      )}
      {demo3d &&
        overlays2d.length > 0 &&
        overlays2d.map((overlay) => (
          <Overlay2DTrack
            key={overlay.uid}
            anchor1={overlay.anchor1}
            anchor2={overlay.anchor2}
          />
        ))}
      {demo3d &&
        overlays1d.length > 0 &&
        overlays1d.map((overlay) => (
          <Overlay1DTrack key={overlay.uid} points={overlay.points} />
        ))}
      <OrbitControls zoomSpeed={0.5} />
    </Canvas>
  );
};

export default ThreeTrack;
