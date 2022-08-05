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

import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import G3dFile from "./g3djs/g3dFile";
import ChromInfo from "./ChromInfo";
import Segment from "./g3djs/segment";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { ChromosomeInfo } from "higlass";
import Backbone from "./Backbone";
import OverlaysTrack from "./OverlaysTrack";

// DONE: use chromInfoPath from genomeAssemply props
// const chromInfoPath = "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv";

// DONE: add overlays
// TODO: add zoom view
// FIXME: when init with partial genome regions, chromosomes not visible will always be grey

const ThreeTrack = (props) => {
  const {
    genomeAssembly: { chromInfoPath },
    threeFile,
  } = props;
  const [chromInfo, setChromInfo] = useState();
  const g3dFile = useRef(new G3dFile({ blob: threeFile }));
  const [resolutions, setResolutions] = useState();
  const [resolution, setResolution] = useState(props.resolution);
  const [categories, setCategories] = useState();
  const [category, setCategory] = useState(props.category);
  const [segmentData, setSegmentData] = useState();
  const [g3dChroms, setG3dChroms] = useState();
  const [chromColors, setChromColors] = useState();

  useEffect(() => {
    g3dFile.current.readHeader().then(() => {
      setResolutions(g3dFile.current.meta.resolutions);
      setCategories(g3dFile.current.meta.categories);
    });
  }, []);

  useEffect(() => {
    if (chromInfoPath && resolutions && resolutions.length > 0) {
      ChromosomeInfo(chromInfoPath, (newChromInfo) => {
        setChromInfo(new ChromInfo(newChromInfo, resolutions));
      });
    }
  }, [chromInfoPath, resolutions]);

  const parseG3dData = useCallback(
    (data) => {
      const cats = Object.keys(data);
      const chroms = Object.keys(data[cats[0]]);

      const bins = {}; // index by category

      for (const cat of cats) {
        const catBins = {}; // index by chr

        for (const chr of chroms) {
          const segments = [];
          const segmentIndex = new Array(
            chromInfo.getChromBins(chr, resolution)
          );
          const currData = data[cat][chr];
          let bi, x, y, z;
          let maxX = currData.x[0];
          let minX = maxX;
          let maxY = currData.y[0];
          let minY = maxY;
          let maxZ = currData.z[0];
          let minZ = maxZ;
          let currSegment = new Segment();
          let currStop = 0;

          for (let i = 0; i < currData.start.length; i++) {
            bi = Math.floor(currData.start[i] / resolution);
            x = currData.x[i];
            y = currData.y[i];
            z = currData.z[i];
            if (!currSegment.add(bi, [x, y, z])) {
              // if not the next of current segment
              // save the current segment and start a new one
              segments.push(currSegment);
              currSegment = new Segment(bi, [x, y, z]);
            }
            // update the max and min of coordinates for current chr
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            maxZ = Math.max(maxZ, z);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            minZ = Math.min(minZ, z);
          }
          if (!currSegment.isEmpty()) {
            segments.push(currSegment);
          }

          segments.forEach((segment, index) => {
            segmentIndex.fill(index, currStop, segment.end + 1);
            currStop = segment.end + 1;
          });

          if (currStop < segmentIndex.length) {
            segmentIndex.fill(segments.length, currStop);
          }

          catBins[chr] = {
            segments,
            binToSegment: segmentIndex,
            max: { x: maxX, y: maxY, z: maxZ },
            min: { x: minX, y: minY, z: minZ },
          };
        }
        bins[cat] = catBins;
      }

      setG3dChroms([...chroms]);

      setSegmentData(bins);
    },
    [resolution, chromInfo]
  );

  // load data
  useEffect(() => {
    if (!chromInfo) {
      return;
    }
    g3dFile.current.readData(resolution, parseG3dData, category);
  }, [chromInfo, resolution, parseG3dData, category]);

  // setup chromosome colors
  useEffect(() => {
    if (g3dChroms) {
      const colors = {};
      for (const chrom of g3dChroms) {
        colors[chrom] = [Math.random(), Math.random(), Math.random()];
      }
      setChromColors(colors);
    }
  }, [g3dChroms]);

  // get viewing chromosomes from binRanges
  let viewingChroms = [];
  let viewingBinRanges = {};
  if (chromInfo && segmentData && g3dChroms) {
    viewingChroms = chromInfo.mergeChromsFromRanges(
      props.mainLocation.xDomain,
      props.mainLocation.yDomain
    );
    // FIXME: need to exclude chrom not in g3d file
    viewingChroms = viewingChroms.filter((chrom) => g3dChroms.includes(chrom));
    viewingBinRanges = chromInfo.mergeBinsFromRanges(
      props.mainLocation.xDomain,
      props.mainLocation.yDomain,
      resolution
    );
  }

  // convert overlays
  const overlays1d = useMemo(() => {
    if (!chromInfo || props.overlays.length < 1) {
      return [];
    }
    return props.overlays
      .filter((overlay) => overlay.extent.length === 2)
      .map((overlay) => {
        const anchor1 = chromInfo.absToBin(overlay.extent[0], resolution);
        const anchor2 = chromInfo.absToBin(overlay.extent[1], resolution);
        return { anchor1, anchor2, uid: overlay.uid };
      });
  }, [props.overlays, chromInfo, resolution]);

  const overlays2d = useMemo(() => {
    if (!chromInfo || props.overlays.length < 1) {
      return [];
    }
    return props.overlays
      .filter((overlay) => overlay.extent.length > 2)
      .map((overlay) => {
        const anchor1 = chromInfo.absToBin(overlay.extent[0], resolution);
        const anchor2 = chromInfo.absToBin(overlay.extent[2], resolution);
        return { anchor1, anchor2, uid: overlay.uid };
      });
  }, [props.overlays, chromInfo, resolution]);

  return (
    <div style={{ height: 350, width: 350 }}>
      <Canvas>
        <group>
          {g3dChroms &&
            segmentData &&
            chromColors &&
            g3dChroms.map((chrom) => {
              return (
                <Backbone
                  key={chrom}
                  segmentData={segmentData[category][chrom]}
                  color={chromColors[chrom]}
                  visible={viewingChroms.includes(chrom)}
                  binRanges={viewingBinRanges[chrom]}
                />
              );
            })}
        </group>
        <group>
          {segmentData && (
            <OverlaysTrack
              overlays1d={overlays1d}
              overlays2d={overlays2d}
              segmentData={segmentData[category]}
            />
          )}
        </group>
        <OrbitControls zoomSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default ThreeTrack;
