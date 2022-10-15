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
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { ChromosomeInfo } from "higlass";
import Backbone from "./Backbone";
import OverlaysTrack from "./OverlaysTrack";
import classes from "./ThreeTrack.module.css";

const getBounds = (chroms, data, category) => {
  const maxBound = {};
  const minBound = {};
  const axes = ["x", "y", "z"];
  for (const chr of chroms) {
    const { max, min } = data[category][chr];
    for (const axis of axes) {
      if (axis in maxBound) {
        maxBound[axis] = Math.max(maxBound[axis], max[axis]);
      } else {
        maxBound[axis] = max[axis];
      }
      if (axis in minBound) {
        minBound[axis] = Math.min(minBound[axis], min[axis]);
      } else {
        minBound[axis] = min[axis];
      }
    }
  }
  return { max: maxBound, min: minBound };
};

const lastElem = (arr) => {
  return arr[arr.length - 1];
};

const getZoomBounds = (binRanges, data) => {
  if (!binRanges || !data) {
    return undefined;
  }
  const xyzCenters = [];
  for (const chr in binRanges) {
    for (const binRange of binRanges[chr]) {
      const { binToSegment, segments, max } = data[chr];
      const startBin = binRange[0];
      const startSegment = binToSegment[startBin];
      const endBin = binRange[1] - 1;
      const endSegment = binToSegment[endBin];
      const startPoint =
        segments[startSegment].points[
          Math.max(0, startBin - segments[startSegment].start)
        ];
      let endPoint = lastElem(lastElem(segments).points);
      if (endSegment < segments.length) {
        if (endBin >= segments[endSegment].start) {
          endPoint =
            segments[endSegment].points[endBin - segments[endSegment].start];
        } else {
          endPoint = lastElem(segments[endSegment - 1].points);
        }
      }
      xyzCenters.push([
        (startPoint[0] + endPoint[0]) / 2,
        (startPoint[1] + endPoint[1]) / 2,
        (startPoint[2] + endPoint[2]) / 2,
      ]);
    }
  }
  let xCenter = 0;
  let yCenter = 0;
  let zCenter = 0;
  for (let i = 0; i < xyzCenters.length; i++) {
    xCenter += xyzCenters[i][0];
    yCenter += xyzCenters[i][1];
    zCenter += xyzCenters[i][2];
  }
  xCenter /= xyzCenters.length;
  yCenter /= xyzCenters.length;
  zCenter /= xyzCenters.length;
  return [-xCenter, -yCenter, -zCenter];
};

// DONE: use chromInfoPath from genomeAssemply props
// const chromInfoPath = "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv";

// DONE: add overlays
// TODO: add zoom view
// FIXME: when init with partial genome regions, chromosomes not visible will always be grey
// TODO: different resolutions from base and zoom-in views

const MainScene = (props) => {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    if (props.exportSvg) {
      const link = document.createElement("a");
      link.setAttribute("download", "3d-base.png");
      link.setAttribute(
        "href",
        gl.domElement
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream")
      );
      link.click();
      props.onFinishExportSvg();
    }
  }, [props.exportSvg]);

  const {
    g3dChroms,
    segmentData,
    chromColors,
    category,
    viewingBinRanges,
    viewingChroms,
    overlays,
    chromInfo,
    resolution,
  } = props;

  return (
    <>
      <group>
        {g3dChroms &&
          segmentData &&
          chromColors &&
          g3dChroms.map((chrom) => {
            console.log(
              chrom,
              segmentData[category][chrom],
              viewingBinRanges[chrom]
            );
            return (
              <Backbone
                key={chrom}
                segmentData={segmentData[category][chrom]}
                color={chromColors[chrom]}
                visible={viewingChroms.includes(chrom)}
                showViewRangeOnly={false}
                binRanges={viewingBinRanges[chrom]}
              />
            );
          })}
      </group>
      <group>
        {segmentData && (
          <OverlaysTrack
            overlays={overlays}
            chromInfo={chromInfo}
            resolution={resolution}
            segmentData={segmentData[category]}
          />
        )}
      </group>
    </>
  );
};

const ZoomScene = (props) => {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    if (props.exportSvg) {
      const link = document.createElement("a");
      link.setAttribute("download", "3d-zoom.png");
      link.setAttribute(
        "href",
        gl.domElement
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream")
      );
      link.click();
      props.onFinishExportSvg();
    }
  }, [props.exportSvg]);

  const {
    zoomCameraPosition,
    zoomChroms,
    zoomSegmentData,
    category,
    chromColors,
    zoomBinRanges,
    overlays,
    chromInfo,
    zoomResolution,
  } = props;

  return (
    <>
      <group position={zoomCameraPosition}>
        <group>
          {zoomChroms &&
            zoomChroms.map((chrom) => {
              return (
                <Backbone
                  key={chrom}
                  segmentData={zoomSegmentData[category][chrom]}
                  color={chromColors[chrom]}
                  visible={true}
                  showViewRangeOnly={true}
                  binRanges={zoomBinRanges[chrom]}
                />
              );
            })}
        </group>
        <group>
          {zoomSegmentData && (
            <OverlaysTrack
              overlays={overlays}
              chromInfo={chromInfo}
              resolution={zoomResolution}
              segmentData={zoomSegmentData[category]}
            />
          )}
        </group>
      </group>
    </>
  );
};

const ThreeTrack = (props) => {
  const {
    genomeAssembly: { chromInfoPath },
    threed,
  } = props;
  const [chromInfo, setChromInfo] = useState();
  const g3dFile = useRef(new G3dFile({ blob: threed.fileObj }));
  const [resolutions, setResolutions] = useState();
  const resolution = +threed.resolution;
  const [categories, setCategories] = useState();
  const category = threed.category;
  const [segmentData, setSegmentData] = useState();
  const [zoomSegmentData, setZoomSegmentData] = useState({});
  const [g3dChroms, setG3dChroms] = useState();
  // const [chromColors, setChromColors] = useState();
  const chromColors = threed.colormap;

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
  // useEffect(() => {
  //   if (g3dChroms) {
  //     const colors = {};
  //     for (const chrom of g3dChroms) {
  //       colors[chrom] = [Math.random(), Math.random(), Math.random()];
  //     }
  //     setChromColors(colors);
  //   }
  // }, [g3dChroms]);

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
    // console.log(props.mainLocation, resolution, viewingBinRanges);
  }

  // TODO: set zoom-in view resolution to the highest, make changeable later
  // get zoom-in chromosomes from location
  // check if need to load data from g3dfile
  // check if need to delete old data
  // get zoom-in binRanges from location
  let zoomResolution = undefined;
  let zoomChroms = [];
  let zoomBinRanges = {};
  if (
    chromInfo &&
    props.zoomLocation.xDomain &&
    props.zoomLocation.yDomain &&
    resolutions &&
    resolutions.length > 0
  ) {
    zoomResolution = Math.min(...resolutions);
    zoomChroms = chromInfo.mergeChromsFromRanges(
      props.zoomLocation.xDomain,
      props.zoomLocation.yDomain
    );
    zoomBinRanges = chromInfo.mergeBinsFromRanges(
      props.zoomLocation.xDomain,
      props.zoomLocation.yDomain,
      zoomResolution
    );
  }

  useEffect(() => {
    if (!zoomChroms || zoomChroms.length < 1) {
      return;
    }
    let toLoadChroms = [...zoomChroms]; // zoomChroms that need to load
    if (category in zoomSegmentData) {
      toLoadChroms = zoomChroms.filter(
        (chr) => !(chr in zoomSegmentData[category])
      );
    }
    if (toLoadChroms.length < 1) {
      return;
    }
    const parseData = (data) => {
      const cats = Object.keys(data);
      const chroms = Object.keys(data[cats[0]]);

      const bins = {}; // index by category

      for (const cat of cats) {
        const catBins = {}; // index by chr

        for (const chr of chroms) {
          const segments = [];
          const segmentIndex = new Array(
            chromInfo.getChromBins(chr, zoomResolution)
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
            bi = Math.floor(currData.start[i] / zoomResolution);
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

      setZoomSegmentData((prevZoomSegmentData) => {
        console.log("load zoomSegmentData");
        if (category in prevZoomSegmentData) {
          for (const chr in prevZoomSegmentData[category]) {
            if (zoomChroms.includes(chr)) {
              bins[category][chr] = prevZoomSegmentData[category][chr];
            }
          }
        }
        return bins;
      });
    };
    g3dFile.current.readData(zoomResolution, parseData, category, toLoadChroms);
  }, [props.zoomLocation]);

  // convert overlays
  // const overlays1d = useMemo(() => {
  //   if (!chromInfo || props.overlays.length < 1) {
  //     return [];
  //   }
  //   return props.overlays
  //     .filter((overlay) => overlay.extent.length === 2)
  //     .map((overlay) => {
  //       const anchor1 = chromInfo.absToBin(overlay.extent[0], resolution);
  //       const anchor2 = chromInfo.absToBin(overlay.extent[1], resolution);
  //       return { anchor1, anchor2, uid: overlay.uid };
  //     });
  // }, [props.overlays, chromInfo, resolution]);

  // const overlays2d = useMemo(() => {
  //   if (!chromInfo || props.overlays.length < 1) {
  //     return [];
  //   }
  //   return props.overlays
  //     .filter((overlay) => overlay.extent.length > 2)
  //     .map((overlay) => {
  //       const anchor1 = chromInfo.absToBin(overlay.extent[0], resolution);
  //       const anchor2 = chromInfo.absToBin(overlay.extent[2], resolution);
  //       return { anchor1, anchor2, uid: overlay.uid };
  //     });
  // }, [props.overlays, chromInfo, resolution]);

  // TODO: make load data into a custom hook with its own load ready state
  const isZoomSegmentDataLoaded = (chroms) => {
    if (!(category in zoomSegmentData)) {
      return false;
    }
    for (const chr of chroms) {
      if (!(chr in zoomSegmentData[category])) {
        return false;
      }
    }
    return true;
  };

  // find the camera postions of all chromosomes
  const cameraPosition = useMemo(() => {
    if (g3dChroms && segmentData) {
      // const maxBound = {};
      // const minBound = {};
      // const axes = ["x", "y", "z"];
      // for (const chr of g3dChroms) {
      //   const { max, min } = segmentData[category][chr];
      //   for (const axis of axes) {
      //     if (axis in maxBound) {
      //       maxBound[axis] = Math.max(maxBound[axis], max[axis]);
      //     } else {
      //       maxBound[axis] = max[axis];
      //     }
      //     if (axis in minBound) {
      //       minBound[axis] = Math.min(minBound[axis], min[axis]);
      //     } else {
      //       minBound[axis] = min[axis];
      //     }
      //   }
      // }
      const bounds = getBounds(g3dChroms, segmentData, category);
      const xLen = bounds.max.x - bounds.min.x;
      const yLen = bounds.max.y - bounds.min.y;
      const zLen = bounds.max.z - bounds.min.z;
      return [xLen / 2, yLen / 2, bounds.max.z + zLen / 3];
    } else {
      return undefined;
    }
  }, [g3dChroms, segmentData, category]);

  // find carmera positon for zoom-in chromosomes
  // const zoomCarmeraPosition = useMemo(() => {
  //   if (zoomChroms && zoomSegmentData) {
  //     const bounds = getBounds(zoomChroms, zoomSegmentData, category);
  //     const xLen = bounds.max.x - bounds.min.x;
  //     const yLen = bounds.max.y - bounds.min.y;
  //     const zLen = bounds.max.z - bounds.min.z;
  //     return [xLen / 2, yLen / 2, bounds.max.z];
  //   } else {
  //     return undefined;
  //   }
  // }, [zoomSegmentData, category]);
  const zoomCameraPosition = getZoomBounds(
    zoomBinRanges,
    zoomSegmentData[category]
  );

  // TODO: find zoom camera position using start, end and middle points
  console.log("cameraPosition", cameraPosition);
  // console.log("zoomCameraPosition", zoomCameraPosition);

  return (
    <>
      {props.zoomLocation.xDomain &&
        props.zoomLocation.yDomain &&
        isZoomSegmentDataLoaded(zoomChroms) && (
          <div className={classes.threeview}>
            {zoomCameraPosition && (
              <Canvas
                gl={{ preserveDrawingBuffer: true }}
                pixelRatio={[1, 2]}
                // camera={{ position: zoomCameraPosition }}
                // camera={{position: [0, 0, 0]}}
              >
                <ZoomScene
                  zoomCameraPosition={zoomCameraPosition}
                  zoomChroms={zoomChroms}
                  zoomSegmentData={zoomSegmentData}
                  category={category}
                  chromColors={chromColors}
                  zoomBinRanges={zoomBinRanges}
                  overlays={props.overlays}
                  chromInfo={chromInfo}
                  zoomResolution={zoomResolution}
                  exportSvg={props.exportSvg && props.exportSvg[2]}
                  onFinishExportSvg={props.onFinishExportSvg}
                />
                <OrbitControls zoomSpeed={0.5} />
              </Canvas>
            )}
          </div>
        )}
      <div className={classes.threeview}>
        {cameraPosition && (
          <Canvas
            gl={{ preserveDrawingBuffer: true }}
            pixelRatio={[1, 2]}
            camera={{ position: cameraPosition }}
          >
            <MainScene
              g3dChroms={g3dChroms}
              segmentData={segmentData}
              chromColors={chromColors}
              category={category}
              viewingBinRanges={viewingBinRanges}
              viewingChroms={viewingChroms}
              overlays={props.overlays}
              chromInfo={chromInfo}
              resolution={resolution}
              exportSvg={props.exportSvg && !props.exportSvg[2]}
              onFinishExportSvg={props.onFinishExportSvg}
            />
            <OrbitControls zoomSpeed={0.5} />
          </Canvas>
        )}
      </div>
    </>
  );
};

export default ThreeTrack;
