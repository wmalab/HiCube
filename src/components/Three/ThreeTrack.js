import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { ChromosomeInfo } from "higlass";
import DemoStructure from "./DemoStructure";

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

  return (
    <Canvas>
      {demo3d && (
        <group>
          {demo3d.chroms.length > 0 &&
            demo3d.chroms.map((chrom) => {
              if (chroms.includes(chrom)) {
                return (
                  <Line
                    key={chrom}
                    points={demo3d.chrom3d[chrom]}
                    color="black"
                    lineWidth={5}
                    dashed={false}
                    transparent={false}
                    // FIXED: need to set opacity to 1.0 or it will be a white line
                    opacity={1}
                  />
                );
              } else {
                return (
                  <Line
                    key={chrom}
                    points={demo3d.chrom3d[chrom]}
                    color="grey"
                    lineWidth={5}
                    dashed={false}
                    transparent={true}
                    opacity={0.1}
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
