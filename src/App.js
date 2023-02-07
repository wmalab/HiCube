import React, { useState, useReducer, useContext } from "react";
import ConfigContext from "./store/config-context";
import HiGlassCase from "./components/HiGlass/HiGlassCase";
import ControlPanel from "./components/SideDrawer/ControlPanel";
import GenomePositionBar from "./components/GenomePositionSearch/GenomePositionBar";
import { defaultOptions as options } from "./configs/default-config";
// import GridLayout from "react-grid-layout";
import ThreeTrack from "./components/Three/ThreeTrack";
import ChromBoundManager from "./components/UI/ChromBoundManager";
import { uid, strToInt, download } from "./utils";
import { ChromosomeInfo } from "higlass";
import ErrorBoundary from "./components/UI/ErrorBoundary";
import useChromBound from "./hooks/use-chrombound";
// import "../node_modules/react-grid-layout/css/styles.css";
// import "../node_modules/react-resizable/css/styles.css";

const initOverlay1D = (extent) => {
  let loc, score;
  if (extent.length > 2) {
    loc = extent.slice(0, 2);
    score = extent[2];
  } else {
    loc = extent;
    score = null;
  }
  const defaultColor = score === null ? "blue" : "score";
  return {
    uid: "overlay-1d-" + uid(),
    extent: loc,
    score: score,
    options: {
      higlass: {
        fill: "blue",
        fillOpacity: 0.3,
        stroke: "blue",
        strokeOpacity: 1,
        strokeWidth: 0,
      },
      threed: {
        lineColor: defaultColor,
        lineWidth: 5,
        drawLine: true,
        drawAnchor1: false,
        anchor1Color: defaultColor,
        anchor1Label: "",
        anchor1LabelSize: "12px",
        anchor1LabelColor: "black",
        anchor1LabelWeight: "600",
        anchor1Radius: 1,
        drawAnchor2: false,
        anchor2Color: defaultColor,
        anchor2Label: "",
        anchor2LabelSize: "12px",
        anchor2LabelColor: "black",
        anchor2LabelWeight: "600",
        anchor2Radius: 1,
      },
    },
  };
};

const initOverlay2D = (extent) => {
  let loc, score;
  if (extent.length > 4) {
    loc = extent.slice(0, 4);
    score = extent[4];
  } else {
    loc = extent;
    score = null;
  }
  const defaultColor = score === null ? "blue" : "score";
  return {
    uid: "overlay-2d-" + uid(),
    extent: loc, // this is not nested array
    score: score,
    options: {
      higlass: {
        fill: "blue",
        fillOpacity: 0.3,
        stroke: "blue",
        strokeOpacity: 1,
        strokeWidth: 0,
      },
      threed: {
        lineColor: defaultColor,
        lineWidth: 1,
        drawLine: true,
        drawAnchor1: true,
        anchor1Color: defaultColor,
        anchor1Label: "",
        anchor1LabelSize: "12px",
        anchor1LabelColor: "black",
        anchor1LabelWeight: "600",
        anchor1Radius: 1,
        drawAnchor2: true,
        anchor2Color: defaultColor,
        anchor2Label: "",
        anchor2LabelSize: "12px",
        anchor2LabelColor: "black",
        anchor2LabelWeight: "600",
        anchor2Radius: 1,
      },
    },
  };
};

const defaultOverlays = {
  data1d: [],
  data2d: [],
  min1d: Number.POSITIVE_INFINITY,
  max1d: Number.NEGATIVE_INFINITY,
  min2d: Number.POSITIVE_INFINITY,
  max2d: Number.NEGATIVE_INFINITY,
  colormap1d: { name: "OrRd", vmin: null, vmax: null },
  colormap2d: { name: "OrRd", vmin: null, vmax: null },
};

const findNewMinMax = (oldMin, oldMax, data) => {
  let newMin = oldMin;
  let newMax = oldMax;
  let dataArr;
  if (Array.isArray(data)) {
    dataArr = data;
  } else {
    dataArr = [data];
  }
  for (const el of dataArr) {
    if (el.score !== null && el.score !== undefined) {
      newMin = Math.min(newMin, el.score);
      newMax = Math.max(newMax, el.score);
    }
  }
  return [newMin, newMax];
};

const findNewMin = (data) => {
  let newMin = Number.POSITIVE_INFINITY;
  for (const el of data) {
    if (el.score !== null && el.score !== undefined) {
      newMin = Math.min(newMin, el.score);
    }
  }
  return newMin;
};

const findNewMax = (data) => {
  let newMax = Number.NEGATIVE_INFINITY;
  for (const el of data) {
    if (el.score !== null && el.score !== undefined) {
      newMax = Math.max(newMax, el.score);
    }
  }
  return newMax;
};

const overlaysReducer = (state, action) => {
  if (action.type === "ADD_1D") {
    const data1dObj = initOverlay1D(action.extent);
    const updatedData1d = state.data1d.concat(data1dObj);
    const [updatedMin1d, updatedMax1d] = findNewMinMax(
      state.min1d,
      state.max1d,
      data1dObj
    );
    const updatedOverlays = {
      data1d: updatedData1d,
      data2d: state.data2d,
      min1d: updatedMin1d,
      max1d: updatedMax1d,
      min2d: state.min2d,
      max2d: state.max2d,
      colormap1d: state.colormap1d,
      colormap2d: state.colormap2d,
    };
    return updatedOverlays;
  } else if (action.type === "ADD_2D") {
    const data2dObj = initOverlay2D(action.extent);
    const updatedData2d = state.data2d.concat(data2dObj);
    const [updatedMin2d, updatedMax2d] = findNewMinMax(
      state.min2d,
      state.max2d,
      data2dObj
    );
    const updatedOverlays = {
      data1d: state.data1d,
      data2d: updatedData2d,
      min1d: state.min1d,
      max1d: state.max1d,
      min2d: updatedMin2d,
      max2d: updatedMax2d,
      colormap1d: state.colormap1d,
      colormap2d: state.colormap2d,
    };
    return updatedOverlays;
  } else if (action.type === "ADD_BATCH") {
    const data1dArr = action.extent1D.map((extent) => initOverlay1D(extent));
    const data2dArr = action.extent2D.map((extent) => initOverlay2D(extent));
    const updatedData1d = state.data1d.concat(data1dArr);
    const updatedData2d = state.data2d.concat(data2dArr);
    const [updatedMin1d, updatedMax1d] = findNewMinMax(
      state.min1d,
      state.max1d,
      data1dArr
    );
    const [updatedMin2d, updatedMax2d] = findNewMinMax(
      state.min2d,
      state.max2d,
      data2dArr
    );
    const updatedOverlays = {
      data1d: updatedData1d,
      data2d: updatedData2d,
      min1d: updatedMin1d,
      max1d: updatedMax1d,
      min2d: updatedMin2d,
      max2d: updatedMax2d,
      colormap1d: state.colormap1d,
      colormap2d: state.colormap2d,
    };
    return updatedOverlays;
  } else if (action.type === "CLEAR") {
    return defaultOverlays;
  } else if (action.type === "REMOVE") {
    const updatedOverlays = { ...state };
    let dataK, minK, maxK;
    if (action.uuid.startsWith("overlay-1d")) {
      dataK = "data1d";
      minK = "min1d";
      maxK = "max1d";
    } else if (action.uuid.startsWith("overlay-2d")) {
      dataK = "data2d";
      minK = "min2d";
      maxK = "max2d";
    } else {
      return updatedOverlays;
    }
    const overlayIndex = state[dataK].findIndex(
      (overlay) => overlay.uid === action.uuid
    );
    if (overlayIndex >= 0) {
      const score = state[dataK][overlayIndex].score;
      // delete overlay by uuid
      updatedOverlays[dataK] = state[dataK].filter(
        (overlay) => overlay.uid !== action.uuid
      );
      // update min or max score if the deleted overlay is min or max
      if (score === state[minK]) {
        updatedOverlays[minK] = findNewMin(updatedOverlays[dataK]);
      }
      if (score === state[maxK]) {
        updatedOverlays[maxK] = findNewMax(updatedOverlays[dataK]);
      }
    }
    return updatedOverlays;
  } else if (action.type === "UPDATE") {
    const { uuid, extent, score, options } = action;
    const updatedOverlays = { ...state };
    let dataK, minK, maxK;
    if (uuid.startsWith("overlay-1d")) {
      dataK = "data1d";
      minK = "min1d";
      maxK = "max1d";
    } else if (uuid.startsWith("overlay-2d")) {
      dataK = "data2d";
      minK = "min2d";
      maxK = "max2d";
    } else {
      return updatedOverlays;
    }
    const overlayIndex = state[dataK].findIndex(
      (overlay) => overlay.uid === uuid
    );
    if (overlayIndex >= 0) {
      const overlay = state[dataK][overlayIndex];
      const updatedOverlay = {
        ...overlay,
        score: score,
        extent: extent,
        options: options,
      };
      updatedOverlays[dataK] = [...state[dataK]];
      updatedOverlays[dataK][overlayIndex] = updatedOverlay;
      // update min and max score if need
      if (score !== null && score > state[maxK]) {
        updatedOverlays[maxK] = score;
      }
      if (score !== null && score < state[minK]) {
        updatedOverlays[minK] = score;
      }
    }
    return updatedOverlays;
  } else if (action.type === "REPLACE") {
    return action.overlays;
  } else if (action.type === "UPDATE_COLORMAP") {
    const { colormapKey, options } = action;
    const updatedOverlays = { ...state };
    if (colormapKey === "colormap1d" || colormapKey === "colormap2d") {
      updatedOverlays[colormapKey] = { ...state[colormapKey] };
      for (const optionName in options) {
        if (optionName in state[colormapKey]) {
          updatedOverlays[colormapKey][optionName] = options[optionName];
        }
      }
    }
    return updatedOverlays;
  }
  return defaultOverlays;
};

// TODO: add HGC dynamically with button click
// HGCs should have diff viewconfig and id otherwise same props
// TODO: hold a list of viewconfig as state to pass to HGC
// TODO: need an index for all the tracks
// TODO: if move create zoom view here,
// need to change initialXDomain to current location
// TODO: add case need to set initialXDomain to current location
// TODO: genome position search bar

export default function App() {
  console.log("App render");

  const configCtx = useContext(ConfigContext);

  const [mainLocation, setMainLocation] = useState({
    xDomain: null,
    yDomain: null,
    fromId: null,
  });

  const [mouseTool, setMouseTool] = useState("move");
  const [exportSvg, setExportSvg] = useState(false);
  // const [panelSizes, setPanelSizes] = useState({
  //   width2d: 350,
  //   width3d: 350,
  //   height3d: 350,
  // });
  const panelSizes = configCtx.panelSizes;

  const sizeChangeHandler = (sizes) => {
    // setPanelSizes(sizes);
    configCtx.updatePanelSizes(sizes, [mainLocation, rangeSelection]);
  };

  const [rangeSelection, setRangeSelection] = useState({
    type: null,
    xDomain: null,
    yDomain: null,
    fromId: null,
  });

  const [overlays, dispatchOverlaysAction] = useReducer(
    overlaysReducer,
    defaultOverlays
  );

  const [trackSourceServers, setTrackSourceServers] = useState([]);

  const [genomeAssembly, setGenomeAssembly] = useState({});

  const { validateXYDomains, navChroms, allChroms, chromFromPosition } =
    useChromBound(genomeAssembly.chromInfoPath);

  const freeRoam = configCtx.freeRoam;

  const freeRoamClickHandler = () => {
    configCtx.switchFreeRoam(
      {
        x: chromFromPosition(mainLocation.xDomain[0]),
        y: chromFromPosition(mainLocation.yDomain[0]),
      },
      [mainLocation, rangeSelection],
      validateXYDomains
    );
  };

  const locationChangeHandler = (location, id) => {
    console.log("location changed.", "id: ", id, "location: ", location);
    // this is the approach works mostly now
    // but one not working is when fromId = "user_entered"
    // to allow HiGlassCase to notify the location change back
    // because zoomTo does not always change the internal location
    // exactly to the x and y domains provided
    // but if the internal location is still out of bound,
    // it could trigger a bounce loop, so leave it to not notify back now
    // TODO: need to make sure new location is not out of bound and update mainLocation
    const { isUpdate, xDomain, yDomain } = validateXYDomains(
      location,
      configCtx.currentChroms.x,
      configCtx.currentChroms.y
    );
    if (isUpdate && !freeRoam) {
      console.log("Out of bound. New location: x: ", xDomain, "y: ", yDomain);
      // setMainLocation({ xDomain, yDomain, fromId: "user_entered" });
      setMainLocation({ xDomain, yDomain, fromId: "bound" });
    } else {
      setMainLocation({ ...location, fromId: id });
    }
  };

  const activateSelectHandler = () => {
    setMouseTool("select");
  };

  const createZoomInHandler = () => {
    // get range selection for each case
    const caseUids = configCtx.cases.map((val) => val.uid);
    let newZoomLocation;
    for (const caseUid of caseUids) {
      const range = configCtx.hgcRefs.current[caseUid].getRangeSelection();
      if (range) {
        newZoomLocation = range;
      }
    }
    if (newZoomLocation) {
      configCtx.addZoomView([mainLocation, newZoomLocation]);
    }
    // setMouseTool("move_create");
    setMouseTool("move");
  };

  const cancelSelectHandler = () => {
    // setMouseTool("move_cancel");
    setMouseTool("move");
  };

  const clearSelectHandler = () => {
    // setMouseTool("move_clear");
    // check if has zoom view
    if (!rangeSelection.xDomain || !rangeSelection.yDomain) {
      return;
    }
    // unsubscribe zoom location change
    const caseUids = configCtx.cases.map((val) => val.uid);
    for (const caseUid of caseUids) {
      configCtx.hgcRefs.current[caseUid].unsubscribeZoomLocation();
    }
    configCtx.removeZoomView([mainLocation]);
    // set zoom location to none
    setRangeSelection({
      type: null,
      xDomain: null,
      yDomain: null,
      fromId: null,
    });
    setMouseTool("move");
  };

  const convertStrToOverlays = (str) => {
    if (!genomeAssembly) {
      return;
    }
    ChromosomeInfo(genomeAssembly.chromInfoPath, (chromInfo) => {
      // process string to get annotations
      const lines = str.split("\n");
      const add1D = [];
      const add2D = [];
      for (const line of lines) {
        const entries = line.split(/\s+/);
        if (entries.length === 4 || entries.length === 5) {
          // 1D annotation
          const extent = [];
          for (let i = 0; i < 4; i += 2) {
            extent.push(
              chromInfo.chrToAbs([entries[i], strToInt(entries[i + 1])])
            );
          }
          if (entries.length === 5) {
            extent.push(parseFloat(entries[4]));
          }
          add1D.push(extent);
        }
        if (entries.length === 8 || entries.length === 9) {
          // 2D annotation
          const extent = [];
          for (let i = 0; i < 8; i += 2) {
            extent.push(
              chromInfo.chrToAbs([entries[i], strToInt(entries[i + 1])])
            );
          }
          if (entries.length === 9) {
            extent.push(parseFloat(entries[8]));
          }
          add2D.push(extent);
        }
      }
      dispatchOverlaysAction({
        type: "ADD_BATCH",
        extent1D: add1D,
        extent2D: add2D,
      });
    });
  };

  const addOverlayHandler = (appendData) => {
    if (appendData.fileObj) {
      appendData.fileObj.text().then((text) => convertStrToOverlays(text));
    }

    if (appendData.enteredText) {
      convertStrToOverlays(appendData.enteredText);
    }
    // setMouseTool("add_overlay");
    // get range selection 1D or 2D ------------------
    const caseUids = configCtx.cases.map((val) => val.uid);
    let newOverlay;
    for (const caseUid of caseUids) {
      const range = configCtx.hgcRefs.current[caseUid].getRangeSelection();
      if (range) {
        newOverlay = range;
      }
    }
    if (newOverlay) {
      if (newOverlay.dim === 1) {
        dispatchOverlaysAction({
          type: "ADD_1D",
          extent: [...newOverlay.xDomain],
        });
      } else if (newOverlay.dim === 2) {
        dispatchOverlaysAction({
          type: "ADD_2D",
          extent: [...newOverlay.xDomain, ...newOverlay.yDomain],
        });
      }
    }
    // -----------------------------------------------------
    setMouseTool("move");
  };

  const clearOverlaysHandler = () => {
    dispatchOverlaysAction({ type: "CLEAR" });
  };

  const rangeSelectionChangeHandler = (type, location, id) => {
    const { isUpdate, xDomain, yDomain } = validateXYDomains(
      location,
      configCtx.currentChroms.x,
      configCtx.currentChroms.y
    );
    if (isUpdate && !freeRoam) {
      setRangeSelection({ xDomain, yDomain, fromId: "bound", type: "UPDATE" });
    } else {
      setRangeSelection({ ...location, fromId: id, type: type });
    }
  };

  const createOverlayHandler = (type, location, id) => {
    if (type === "1D") {
      dispatchOverlaysAction({
        type: "ADD_1D",
        extent: [...location[0]],
      });
    } else if (type === "2D") {
      dispatchOverlaysAction({
        type: "ADD_2D",
        extent: [...location[0], ...location[1]],
      });
    }
  };

  const updateOverlayHandler = (
    overlayUid,
    overlayExtent,
    overlayScore,
    overlayOptions
  ) => {
    dispatchOverlaysAction({
      type: "UPDATE",
      uuid: overlayUid,
      extent: overlayExtent,
      score: overlayScore,
      options: overlayOptions,
    });
  };

  const removeOverlayHandler = (overlayUid) => {
    dispatchOverlaysAction({ type: "REMOVE", uuid: overlayUid });
  };

  const updateOverlayCmapHandler = (colormapKey, options) => {
    dispatchOverlaysAction({ type: "UPDATE_COLORMAP", colormapKey, options });
  };

  // const nViews = configCtx.numViews > 1 ? 2 : 1;

  /*
  const layout = configCtx.cases.map((caseUids, idx) => {
    return {
      i: caseUids.uid,
      x: 0,
      y: 3 * idx,
      w: 4 * nViews,
      h: 3,
      static: true,
    };
  });
  */

  const addServerHandler = (serverURL) => {
    setTrackSourceServers((prevTrackSourceServers) => {
      return prevTrackSourceServers.concat({ uuid: uid(), url: serverURL });
    });
  };

  const removeServerHandler = (serverUid) => {
    setTrackSourceServers((prevTrackSourceServers) => {
      return prevTrackSourceServers.filter(
        (trackSourceServer) => trackSourceServer.uuid !== serverUid
      );
    });
  };

  const genomeAssemblyChangeHandler = (updatedAssembly) => {
    setGenomeAssembly(updatedAssembly);
  };

  const exportSvgHandler = (caseUid, type, isZoom) => {
    setExportSvg([caseUid, type, isZoom]);
  };

  const finishExportSvgHandler = () => {
    setExportSvg(false);
  };

  const exportConfigHandler = () => {
    // three config need file name
    // TODO: need to update initialX/Y Domain in views (main and zoom)
    const exportThreeCases = {};
    for (const caseUid in configCtx.threeCases) {
      exportThreeCases[caseUid] = { ...configCtx.threeCases[caseUid] };
      exportThreeCases[caseUid].fileObj = {
        name: configCtx.threeCases[caseUid].fileObj.name,
      };
    }
    const exportCases = configCtx.getCaseCopy([mainLocation, rangeSelection]);
    const config = {
      // cases: configCtx.cases,
      cases: exportCases,
      pairedLocks: configCtx.pairedLocks,
      positionedTracks: configCtx.positionedTracks,
      positionedTracksToCaseUid: configCtx.positionedTracksToCaseUid,
      // threeCases: configCtx.threeCases,
      threeCases: exportThreeCases,
      genomeAssembly: genomeAssembly,
      // viewConfigs: configCtx.viewConfigs,
      numViews: configCtx.numViews,
      overlays: overlays,
      mainXDomain: mainLocation.xDomain,
      mainYDomain: mainLocation.yDomain,
      zoomXDomain: rangeSelection.xDomain,
      zoomYDomain: rangeSelection.yDomain,
      trackSourceServers: trackSourceServers,
      panelSizes: panelSizes,
    };
    // export as JSON file for downloading
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "config.json";
    link.click();
  };

  const loadConfigHandler = (configBlob, g3dBlobs) => {
    configCtx.deleteAllCases();
    setMainLocation({
      xDomain: null,
      yDomain: null,
      fromId: null,
    });
    setRangeSelection({
      type: null,
      xDomain: null,
      yDomain: null,
      fromId: null,
    });
    dispatchOverlaysAction({ type: "CLEAR" });
    configBlob.text().then((text) => {
      const config = JSON.parse(text);
      // setPanelSizes(config.panelSizes);
      setGenomeAssembly(config.genomeAssembly);
      setTrackSourceServers(config.trackSourceServers);
      configCtx.loadConfig(config, g3dBlobs);
      setMainLocation({
        xDomain: config.mainXDomain,
        yDomain: config.mainYDomain,
        fromId: "loaded",
      });
      setRangeSelection({
        type: "CREATE",
        xDomain: config.zoomXDomain,
        yDomain: config.zoomYDomain,
        fromId: "loaded",
      });
      dispatchOverlaysAction({ type: "REPLACE", overlays: config.overlays });
    });
  };

  const exportAnnotationsHandler = () => {
    // convert old overlays format to new
    // convert overlays to chr positions
    if (genomeAssembly) {
      ChromosomeInfo(genomeAssembly.chromInfoPath, (chromInfo) => {
        const createLines = (overlay) => {
          const { extent, score } = overlay;
          const loc = [];
          // TODO: what format for exporting annotations? BED-like?
          for (const absPos of extent) {
            const [chrom, pos] = chromInfo.absToChr(absPos);
            loc.push(chrom, pos);
          }
          if (score !== null) {
            loc.push(score);
          }
          return loc.join("\t");
        };
        let lines = [];
        if (overlays.data1d.length > 0) {
          lines = lines.concat(overlays.data1d.map(createLines));
        }
        if (overlays.data2d.length > 0) {
          lines = lines.concat(overlays.data2d.map(createLines));
        }
        if (lines.length > 0) {
          const blob = new Blob([lines.join("\n")], { type: "text/plain" });
          download(blob, "annotations.txt");
          // const blobUrl = URL.createObjectURL(blob);
          // const link = document.createElement("a");
          // link.href = blobUrl;
          // link.download = "annotations.txt";
          // link.click();
        }
      });
    }
  };

  const zoomPositionBarChangeHandler = (xyDomain) => {
    configCtx.updateLocation([mainLocation, xyDomain]);
    setRangeSelection({ ...xyDomain, fromId: "user_entered", type: "UPDATE" });
  };

  const basePositionBarChangeHandler = (xyDomain) => {
    configCtx.updateLocation([xyDomain, rangeSelection]);
    setMainLocation({ ...xyDomain, fromId: "user_entered" });
  };

  const updateChromsHandler = (newChroms) => {
    configCtx.updateCurrentChroms(
      newChroms,
      [mainLocation, rangeSelection],
      validateXYDomains
    );
  };

  // this approach didn't work well when there is 2 cases
  // when set fromId="user_entered" it went into a infinite loop
  // between the 2 cases one update to the new location another to old location
  // when set fromId="bound", only the case starts with out of bound to the new location
  // the other one stay the old location (but if scroll a bit will update that one?)
  /*
  useEffect(() => {
    const { isUpdate, xDomain, yDomain, xBound, yBound } = validXYDomains(mainLocation);
    if (isUpdate) {
      console.log(xDomain, yDomain, xBound, yBound);
      setMainLocation({ xDomain, yDomain, fromId: "bound" });
    }
  }, [mainLocation, validXYDomains]);
  */

  /*
  useEffect(() => {
    const { isUpdate, xDomain, yDomain } = validXYDomains(rangeSelection);
    if (isUpdate) {
      setRangeSelection({
        xDomain,
        yDomain,
        fromId: "user_entered",
        type: "UPDATE",
      });
    }
  }, [rangeSelection, validXYDomains]);
  */

  // console.log("refs", configCtx.hgcRefs);
  console.log("App mainLocation: ", mainLocation);
  // console.log("App rangeSelection: ", rangeSelection);

  const caselist = [];
  for (const caseConfig of configCtx.cases) {
    const caseUid = caseConfig.uid;
    if (caseUid && configCtx.viewConfigs[caseUid]) {
      caselist.push(
        <div
          key={`${caseUid}-higlass`}
          className="content-item hgc"
          style={{ width: panelSizes.higlass.width }}
        >
          <HiGlassCase
            id={caseUid}
            ref={(el) => (configCtx.hgcRefs.current[caseUid] = el)}
            options={options}
            viewConfig={configCtx.viewConfigs[caseUid]}
            mainLocation={mainLocation}
            onMainLocationChange={locationChangeHandler}
            mouseTool={mouseTool}
            exportSvg={
              exportSvg &&
              exportSvg[0] === caseUid &&
              exportSvg[1] === "higlass"
            }
            onFinishExportSvg={finishExportSvgHandler}
            rangeSelection={rangeSelection}
            onRangeSelection={rangeSelectionChangeHandler}
            onCreateOverlay={createOverlayHandler}
            overlays={overlays}
            // onValidXYDomains={validXYDomains}
          />
        </div>
      );
    }
    if (caseUid && configCtx.threeCases[caseUid]) {
      caselist.push(
        <div
          key={`${caseUid}-threed`}
          className="content-item"
          style={{ width: panelSizes.threed.width }}
        >
          <ThreeTrack
            threed={configCtx.threeCases[caseUid]}
            genomeAssembly={genomeAssembly}
            mainLocation={mainLocation}
            zoomLocation={rangeSelection}
            overlays={overlays}
            exportSvg={
              exportSvg &&
              exportSvg[0] === caseUid &&
              exportSvg[1] === "threed" &&
              exportSvg
            }
            onFinishExportSvg={finishExportSvgHandler}
            panelHeight={panelSizes.threed.height}
            // style={{ height: panelSizes.threed.height[0] }}
          />
        </div>
      );
    }
  }

  return (
    <div>
      <ControlPanel
        trackSourceServers={trackSourceServers}
        onAddServer={addServerHandler}
        onRemoveServer={removeServerHandler}
        genomeAssembly={genomeAssembly}
        onGenomeAssemblyChange={genomeAssemblyChangeHandler}
        mainLocation={mainLocation}
        zoomLocation={rangeSelection}
        onSubmitConfig={loadConfigHandler}
        onSelect={activateSelectHandler}
        onCancelSelect={cancelSelectHandler}
        onAddZoomIn={createZoomInHandler}
        onRemoveZoomIn={clearSelectHandler}
        overlays={overlays}
        onAddOverlay={addOverlayHandler}
        onUpdateOverlay={updateOverlayHandler}
        onRemoveOverlays={clearOverlaysHandler}
        onRemoveOverlay={removeOverlayHandler}
        onUpdateOverlayCmap={updateOverlayCmapHandler}
        exportSvg={exportSvg}
        onExportSvg={exportSvgHandler}
        onExportConfig={exportConfigHandler}
        onExportAnnotations={exportAnnotationsHandler}
        panelSizes={panelSizes}
        onSizeChange={sizeChangeHandler}
      />
      <div className="main">
        <div className="genome-position-header">
          {caselist.length > 0 && (
            <ChromBoundManager
              currentChroms={configCtx.currentChroms}
              allChroms={allChroms}
              onUpdateCurrentChroms={updateChromsHandler}
              onNavChroms={navChroms}
              freeRoam={freeRoam}
              onFreeRoamClick={freeRoamClickHandler}
            />
          )}
          {caselist.length > 0 && rangeSelection && rangeSelection.xDomain && (
            <GenomePositionBar
              // onPositionChange={rangeSelectionChangeHandler.bind(
              //   null,
              //   "UPDATE"
              // )}
              onPositionChange={zoomPositionBarChangeHandler}
              positions={rangeSelection}
              name="Zoom Position"
              genomeAssembly={genomeAssembly}
            />
          )}
          {caselist.length > 0 && mainLocation && mainLocation.xDomain && (
            <GenomePositionBar
              // onPositionChange={locationChangeHandler}
              onPositionChange={basePositionBarChangeHandler}
              positions={mainLocation}
              name="Base Position"
              genomeAssembly={genomeAssembly}
            />
          )}
        </div>
        <div className="content">
          {/* {configCtx.cases.map((caseUids) => {
            return (
              <>
                <div
                  key={caseUids.uid + "-higlass"}
                  className="content-item hgc"
                >
                  <HiGlassCase
                    id={caseUids.uid}
                    ref={(el) => (configCtx.hgcRefs.current[caseUids.uid] = el)}
                    options={options}
                    viewConfig={configCtx.viewConfigs[caseUids.uid]}
                    mainLocation={mainLocation}
                    onMainLocationChange={locationChangeHandler}
                    mouseTool={mouseTool}
                    exportSvg={
                      exportSvg &&
                      exportSvg[0] === caseUids.uid &&
                      exportSvg[1] === "higlass"
                    }
                    onFinishExportSvg={finishExportSvgHandler}
                    rangeSelection={rangeSelection}
                    onRangeSelection={rangeSelectionChangeHandler}
                    onCreateOverlay={createOverlayHandler}
                    overlays={overlays}
                  />
                </div>
                <div key={caseUids.uid + "-3d"} className="content-item">
                  <ThreeTrack
                    threed={configCtx.threeCases[caseUids.uid]}
                    genomeAssembly={genomeAssembly}
                    mainLocation={mainLocation}
                    zoomLocation={rangeSelection}
                    overlays={overlays}
                    exportSvg={
                      exportSvg &&
                      exportSvg[0] === caseUids.uid &&
                      exportSvg[1] === "threed" &&
                      exportSvg
                    }
                    onFinishExportSvg={finishExportSvgHandler}
                  />
                </div>
              </>
            );
          })} */}
          {caselist}
        </div>
      </div>
    </div>
  );
}
