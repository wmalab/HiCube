import React, { useRef, useState, useEffect, useMemo } from "react";
import G3dFile from "./g3djs/g3dFile";
import ChromInfo from "./ChromInfo";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ChromosomeInfo } from "higlass";
import Scene from "./Scene";
import g3dDataParser from "./g3d-data-parser";
import { getBounds, getDataBounds } from "./get-data-bound";
import classes from "./ThreeTrack.module.css";

/*
const getBounds = (chroms, data, category) => {
  const maxBound = {};
  const minBound = {};
  const axes = ["x", "y", "z"];
  for (const chr of chroms) {
    const { max, min } = data[category][chr];
    for (const axis of axes) {
      maxBound[axis] = maxBound[axis] > max[axis] ? maxBound[axis] : max[axis];
      minBound[axis] = minBound[axis] < min[axis] ? minBound[axis] : min[axis];
    }
  }
  return { max: maxBound, min: minBound };
};
*/

/*
// get approx viewing regin data bounds
const getDataBounds = (binRanges, data) => {
  // binRanges: { chrom: [[binStart, binEnd (exclude)], ...] }
  // data: { chrom: { segments, binToSegment, max, min }}
  if (!binRanges || !data) {
    return undefined;
  }
  const maxBound = {};
  const minBound = {};
  const axes = ["x", "y", "z"];

  for (const chr in binRanges) {
    if (!(chr in data)) {
      // if that chr is missing
      continue;
    }
    for (const binRange of binRanges[chr]) {
      // console.log(data, chr);
      const { binToSegment, segments } = data[chr];
      const b1 = binRange[0];
      // TODO: need to check if bin is on last non-segment
      const s1 = binToSegment[b1];
      const b2 = binRange[1] - 1;
      const s2 = binToSegment[b2];
      // BEWARE: the startBin and endBin could all end on same non-segment
      // so its actually empty
      if (s1 >= segments.length) {
        continue;
      }
      const segment1 = segments[s1];
      const start = Math.max(0, b1 - segment1.start);
      let p1, p2;
      if (s1 === s2) {
        // on the same segment, make sure b2 is after segment start, otherwise its empty
        const end = b2 - segment1.start + 1;
        if (start < end) {
          p1 = segment1.points[start];
          p2 = segment1.points[end - 1];
        }
      } else {
        // on different segment
        p1 = segment1.points[start];
        // s1 < s2
        p2 = lastElem(segments[s2 - 1].points);
        // if bin2 is on segment
        if (s2 < segments.length) {
          const segment2 = segments[s2];
          const end = b2 - segment2.start + 1;
          if (end > 0) {
            p2 = segment2.points[end - 1];
          }
        }
      }
      axes.forEach((axis, index) => {
        if (p1) {
          maxBound[axis] =
            maxBound[axis] > p1[index] ? maxBound[axis] : p1[index];
          minBound[axis] =
            minBound[axis] < p1[index] ? minBound[axis] : p1[index];
        }
        if (p2) {
          maxBound[axis] =
            maxBound[axis] > p2[index] ? maxBound[axis] : p2[index];
          minBound[axis] =
            minBound[axis] < p2[index] ? minBound[axis] : p2[index];
        }
      });
      // --------------------------------------------------------
    }
  }
  return { max: maxBound, min: minBound };
};
*/

// DONE: use chromInfoPath from genomeAssemply props
// const chromInfoPath = "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv";

// DONE: add overlays
// TODO: add zoom view
// FIXME: when init with partial genome regions, chromosomes not visible will always be grey
// TODO: different resolutions from base and zoom-in views
/*
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
    groupPosition,
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
    <group position={groupPosition}>
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
    </group>
  );
};
*/

/*
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

  console.log(zoomChroms);

  const backbones = [];
  if (zoomChroms) {
    zoomChroms.forEach((chrom) => {
      if (chrom in zoomSegmentData[category]) {
        backbones.push(
          <Backbone
            key={chrom}
            segmentData={zoomSegmentData[category][chrom]}
            color={chromColors[chrom]}
            visible={true}
            showViewRangeOnly={true}
            binRanges={zoomBinRanges[chrom]}
          />
        );
      }
    });
  }

  return (
    <>
      <group position={zoomCameraPosition}>
        <group>
          {backbones}
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
*/

const ThreeTrack = (props) => {
  const threed = props.threed;
  const { chromInfoPath } = props.genomeAssembly;
  const [chromInfo, setChromInfo] = useState();
  const g3dFile = useRef(new G3dFile({ blob: threed.fileObj }));
  const [resolutions, setResolutions] = useState();
  const resolution = +threed.resolution;
  const [categories, setCategories] = useState();
  const category = threed.category;
  const [segmentData, setSegmentData] = useState();
  const [zoomSegmentData, setZoomSegmentData] = useState();
  const [g3dChroms, setG3dChroms] = useState();
  const chromColors = threed.colormap;
  const [viewingChroms, setViewingChroms] = useState();
  const [viewingBinRanges, setViewingBinRanges] = useState();
  const [zoomResolution, setZoomResolution] = useState();
  const [zoomChroms, setZoomChroms] = useState();
  const [zoomBinRanges, setZoomBinRanges] = useState();

  // FIXME: some chromosome may be missing

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

  // load base data
  useEffect(() => {
    if (!chromInfo || !resolution || !category) {
      return;
    }
    const parser = (data) => {
      console.log("load base g3d data");
      g3dDataParser(data, chromInfo, resolution, setSegmentData, setG3dChroms);
    };
    g3dFile.current.readData(resolution, parser, category);
  }, [chromInfo, resolution, category]);

  // get viewing chromosomes from binRanges
  // TODO: refactor this
  /*
  let viewingChroms = [];
  let viewingBinRanges = {};
  if (chromInfo && segmentData && g3dChroms) {
    viewingChroms = chromInfo.mergeChromsFromRanges(
      props.mainLocation.xDomain,
      props.mainLocation.yDomain
    );
    // need to exclude chrom not in g3d file
    viewingChroms = viewingChroms.filter((chrom) => g3dChroms.includes(chrom));
    viewingBinRanges = chromInfo.mergeBinsFromRanges(
      props.mainLocation.xDomain,
      props.mainLocation.yDomain,
      resolution
    );
  }
  */

  useEffect(() => {
    if (chromInfo && g3dChroms) {
      const chrs = chromInfo.mergeChromsFromRanges(
        props.mainLocation.xDomain,
        props.mainLocation.yDomain
      );
      // need to exclude chrom not in g3d file
      setViewingChroms(chrs.filter((chrom) => g3dChroms.includes(chrom)));
      setViewingBinRanges(
        chromInfo.mergeBinsFromRanges(
          props.mainLocation.xDomain,
          props.mainLocation.yDomain,
          resolution
        )
      );
    }
  }, [props.mainLocation, chromInfo, g3dChroms, resolution]);

  // get zoom-in chromosomes from location
  // get zoom-in binRanges from location
  // TODO: refactor this
  /*
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
    // FIXME: need to filter chrom not in g3d file
    zoomBinRanges = chromInfo.mergeBinsFromRanges(
      props.zoomLocation.xDomain,
      props.zoomLocation.yDomain,
      zoomResolution
    );
  }
  */

  useEffect(() => {
    if (resolutions && resolutions.length > 0) {
      setZoomResolution(Math.min(...resolutions));
    }
  }, [resolutions]);

  useEffect(() => {
    if (
      chromInfo &&
      props.zoomLocation.xDomain &&
      props.zoomLocation.yDomain &&
      zoomResolution &&
      g3dChroms
    ) {
      const chrs = chromInfo.mergeChromsFromRanges(
        props.zoomLocation.xDomain,
        props.zoomLocation.yDomain
      );
      setZoomChroms(chrs.filter((chrom) => g3dChroms.includes(chrom)));
      setZoomBinRanges(
        chromInfo.mergeBinsFromRanges(
          props.zoomLocation.xDomain,
          props.zoomLocation.yDomain,
          zoomResolution
        )
      );
    }
  }, [props.zoomLocation, chromInfo, zoomResolution, g3dChroms]);

  useEffect(() => {
    if (!props.zoomLocation.xDomain || !props.zoomLocation.yDomain) {
      // TODO: need to empty data
      return;
    }
    if (zoomSegmentData) {
      return;
    }
    if (!resolutions || !chromInfo || !category) {
      return;
    }
    // TODO: zoom resolution should be able to be set as props
    const zoomRes = Math.min(...resolutions);
    const parser = (data) => {
      console.log("load zoom g3d data");
      g3dDataParser(data, chromInfo, zoomRes, setZoomSegmentData);
    };
    g3dFile.current.readData(zoomRes, parser, category);
    // g3dFile.current.readData(zoomResolution, parseData, category, toLoadChroms);
  }, [props.zoomLocation, resolutions, chromInfo, category, zoomSegmentData]);

  /*
  const isZoomSegmentDataLoaded = (chroms) => {
    if (zoomSegmentData) {
      return true;
    }
    return false;
  };
  */

  // find the camera postions of all chromosomes
  const position = useMemo(() => {
    if (g3dChroms && segmentData) {
      const bounds = getBounds(g3dChroms, segmentData, category);
      const xLen = bounds.max.x - bounds.min.x;
      const yLen = bounds.max.y - bounds.min.y;
      const zLen = bounds.max.z - bounds.min.z;
      // return [xLen / 2, yLen / 2, bounds.max.z + zLen / 3];
      const cx = (bounds.max.x + bounds.min.x) / 2;
      const cy = (bounds.max.y + bounds.min.y) / 2;
      const cz = (bounds.max.z + bounds.min.z) / 2;
      if (isNaN(xLen) || isNaN(yLen) || isNaN(zLen)) {
        return undefined;
      }
      return {
        groupPosition: [-cx, -cy, -cz],
        cameraPosition: [
          xLen / 2,
          yLen / 2,
          Math.max(...Object.values(bounds.max)),
        ],
      };
    } else {
      return undefined;
    }
  }, [g3dChroms, segmentData, category]);

  const getZoomPosition = () => {
    if (!zoomBinRanges || !zoomSegmentData || !zoomSegmentData[category]) {
      return undefined;
    }

    const bounds = getDataBounds(
      zoomBinRanges,
      zoomSegmentData && zoomSegmentData[category]
    );
    if (!bounds) {
      return undefined;
    }

    const xLen = bounds.max.x - bounds.min.x;
    const yLen = bounds.max.y - bounds.min.y;
    const zLen = bounds.max.z - bounds.min.z;

    const cx = (bounds.max.x + bounds.min.x) / 2;
    const cy = (bounds.max.y + bounds.min.y) / 2;
    const cz = (bounds.max.z + bounds.min.z) / 2;

    if (isNaN(xLen) || isNaN(yLen) || isNaN(zLen)) {
      return undefined;
    }

    return {
      groupPosition: [-cx, -cy, -cz],
      // cameraPosition: [xLen / 2, yLen / 2, bounds.max.z + zLen / 3],
      cameraPosition: [
        xLen / 2,
        yLen / 2,
        Math.max(...Object.values(bounds.max)),
      ],
    };
  };

  const zoomPosition = getZoomPosition();

  console.log("zoomPosition", zoomPosition);
  console.log("zoomLocation", props.zoomLocation);
  console.log("zoomSegmentData", zoomSegmentData);

  return (
    <>
      {props.zoomLocation.xDomain && props.zoomLocation.yDomain && (
        <div
          className={classes.threeview}
          style={{ height: props.panelHeight[1] }}
          // style={props.style}
        >
          {zoomPosition && zoomSegmentData && (
            <Canvas
              gl={{ preserveDrawingBuffer: true }}
              // camera={{ position: zoomPosition.cameraPosition }}
            >
              <color attach="background" args={["white"]} />
              <ambientLight />
              <Scene
                groupPosition={zoomPosition.groupPosition}
                chroms={g3dChroms}
                segmentData={zoomSegmentData[category]}
                chromColors={chromColors}
                opacity={threed.opacity}
                viewingBinRanges={zoomBinRanges}
                viewingChroms={zoomChroms}
                showViewRangeOnly={true}
                overlays={props.overlays}
                chromInfo={chromInfo}
                resolution={zoomResolution}
                exportSvg={props.exportSvg && props.exportSvg[2]}
                onFinishExportSvg={props.onFinishExportSvg}
                svgName="3D-Zoom"
              />
              <OrbitControls zoomSpeed={0.5} />
            </Canvas>
          )}
          {zoomPosition === undefined && (
            <p className={classes.message}>
              No available 3D structure data in this region.
            </p>
          )}
        </div>
      )}
      <div
        className={classes.threeview}
        style={{ height: props.panelHeight[0] }}
        // style={props.style}
      >
        {position && segmentData && (
          <Canvas
            gl={{ preserveDrawingBuffer: true }}
            camera={{ position: position.cameraPosition }}
          >
            <color attach="background" args={["white"]} />
            <ambientLight />
            <Scene
              groupPosition={position.groupPosition}
              chroms={g3dChroms}
              segmentData={segmentData[category]}
              chromColors={chromColors}
              opacity={threed.opacity}
              viewingBinRanges={viewingBinRanges}
              viewingChroms={viewingChroms}
              showViewRangeOnly={false}
              overlays={props.overlays}
              chromInfo={chromInfo}
              resolution={resolution}
              exportSvg={props.exportSvg && !props.exportSvg[2]}
              onFinishExportSvg={props.onFinishExportSvg}
              svgName="3D-Base"
            />
            <OrbitControls zoomSpeed={0.5} />
          </Canvas>
        )}
      </div>
    </>
  );
};

export default ThreeTrack;
