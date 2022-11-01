import React, { useState, useReducer, useContext } from "react";
import ConfigContext from "./store/config-context";
import HiGlassCase from "./components/HiGlass/HiGlassCase";
import ControlPanel from "./components/SideDrawer/ControlPanel";
import GenomePositionBar from "./components/GenomePositionSearch/GenomePositionBar";
import { defaultOptions as options } from "./configs/default-config";
// import GridLayout from "react-grid-layout";
import ThreeTrack from "./components/Three/ThreeTrack";
import { uid, strToInt } from "./utils";
import { ChromosomeInfo } from "higlass";
import ErrorBoundary from "./components/UI/ErrorBoundary";
// import "../node_modules/react-grid-layout/css/styles.css";
// import "../node_modules/react-resizable/css/styles.css";

const initOverlay1D = (extent) => {
  return {
    uid: "overlay-1d-" + uid(),
    extent: extent,
    options: {
      higlass: {
        fill: "blue",
        fillOpacity: 0.3,
        stroke: "blue",
        strokeOpacity: 1,
        strokeWidth: 0,
      },
      threed: {
        lineColor: "blue",
        lineWidth: 5,
        drawLine: true,
        drawAnchor1: false,
        anchor1Color: "blue",
        anchor1Label: "",
        anchor1LabelSize: "12px",
        anchor1LabelColor: "black",
        anchor1LabelWeight: "600",
        anchor1Radius: 1,
        drawAnchor2: false,
        anchor2Color: "blue",
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
  return {
    uid: "overlay-2d-" + uid(),
    extent: extent, // this is not nested array
    options: {
      higlass: {
        fill: "blue",
        fillOpacity: 0.3,
        stroke: "blue",
        strokeOpacity: 1,
        strokeWidth: 0,
      },
      threed: {
        lineColor: "blue",
        lineWidth: 1,
        drawLine: true,
        drawAnchor1: true,
        anchor1Color: "blue",
        anchor1Label: "",
        anchor1LabelSize: "12px",
        anchor1LabelColor: "black",
        anchor1LabelWeight: "600",
        anchor1Radius: 1,
        drawAnchor2: true,
        anchor2Color: "blue",
        anchor2Label: "",
        anchor2LabelSize: "12px",
        anchor2LabelColor: "black",
        anchor2LabelWeight: "600",
        anchor2Radius: 1,
      },
    },
  };
};

const overlaysReducer = (state, action) => {
  if (action.type === "ADD_1D") {
    return state.concat(initOverlay1D(action.extent));
  } else if (action.type === "ADD_2D") {
    return state.concat(initOverlay2D(action.extent));
  } else if (action.type === "ADD_BATCH") {
    return state.concat(
      action.extent1D.map((extent) => initOverlay1D(extent)),
      action.extent2D.map((extent) => initOverlay2D(extent))
    );
  } else if (action.type === "CLEAR") {
    return [];
  } else if (action.type === "REMOVE") {
    return state.filter((overlay) => overlay.uid !== action.uuid);
  } else if (action.type === "UPDATE") {
    const { uuid, extent, options } = action;
    const overlayIndex = state.findIndex((overlay) => overlay.uid === uuid);
    const overlay = state[overlayIndex];
    const updatedOverlay = { ...overlay, extent: extent, options: options };
    const updatedOverlays = [...state];
    updatedOverlays[overlayIndex] = updatedOverlay;
    return updatedOverlays;
  } else if (action.type === "REPLACE") {
    return action.overlays;
  }
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
  const [panelSizes, setPanelSizes] = useState({
    width2d: 350,
    width3d: 350,
    height3d: 350,
  });

  const sizeChangeHandler = (sizes) => {
    setPanelSizes(sizes);
  };

  const [rangeSelection, setRangeSelection] = useState({
    type: null,
    xDomain: null,
    yDomain: null,
    fromId: null,
  });

  const [overlays, dispatchOverlaysAction] = useReducer(overlaysReducer, []);

  const [trackSourceServers, setTrackSourceServers] = useState([]);

  const [genomeAssembly, setGenomeAssembly] = useState({});

  const locationChangeHandler = (location, id) => {
    console.log(id, "location change");

    setMainLocation({ ...location, fromId: id });
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
        if (entries.length === 4) {
          // 1D annotation
          const extent = [];
          for (let i = 0; i < 4; i += 2) {
            extent.push(
              chromInfo.chrToAbs([entries[i], strToInt(entries[i + 1])])
            );
          }
          add1D.push(extent);
        }
        if (entries.length === 8) {
          // 2D annotation
          const extent = [];
          for (let i = 0; i < 8; i += 2) {
            extent.push(
              chromInfo.chrToAbs([entries[i], strToInt(entries[i + 1])])
            );
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
    setRangeSelection({ ...location, fromId: id, type: type });
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

  const updateOverlayHandler = (overlayUid, overlayExtent, overlayOptions) => {
    dispatchOverlaysAction({
      type: "UPDATE",
      uuid: overlayUid,
      extent: overlayExtent,
      options: overlayOptions,
    });
  };

  const removeOverlayHandler = (overlayUid) => {
    dispatchOverlaysAction({ type: "REMOVE", uuid: overlayUid });
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
      setPanelSizes(config.panelSizes);
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
    // convert overlays to chr positions
    if (genomeAssembly && overlays.length > 0) {
      ChromosomeInfo(genomeAssembly.chromInfoPath, (chromInfo) => {
        const lines = overlays.map((overlay) => {
          const { extent } = overlay;
          const loc = [];
          // TODO: what format for exporting annotations? BED-like?
          for (const absPos of extent) {
            const [chrom, pos] = chromInfo.absToChr(absPos);
            loc.push(chrom, pos);
          }
          return loc.join("\t");
        });
        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "annotations.txt";
        link.click();
      });
    }
  };

  console.log("refs", configCtx.hgcRefs);
  console.log("mainLocation", mainLocation);
  console.log("rangeselection", rangeSelection);

  const caselist = [];
  for (const caseConfig of configCtx.cases) {
    const caseUid = caseConfig.uid;
    if (caseUid && configCtx.viewConfigs[caseUid]) {
      caselist.push(
        <div
          key={`${caseUid}-higlass`}
          className="content-item hgc"
          style={{ width: panelSizes.width2d }}
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
          />
        </div>
      );
    }
    if (caseUid && configCtx.threeCases[caseUid]) {
      caselist.push(
        <div
          key={`${caseUid}-threed`}
          className="content-item"
          style={{ width: panelSizes.width3d }}
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
            style={{ height: panelSizes.height3d }}
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
        exportSvg={exportSvg}
        onExportSvg={exportSvgHandler}
        onExportConfig={exportConfigHandler}
        onExportAnnotations={exportAnnotationsHandler}
        panelSizes={panelSizes}
        onSizeChange={sizeChangeHandler}
      />
      <div className="main">
        <div className="genome-position-header">
          {caselist.length > 0 && rangeSelection && rangeSelection.xDomain && (
            <GenomePositionBar
              onPositionChange={rangeSelectionChangeHandler.bind(
                null,
                "UPDATE"
              )}
              positions={rangeSelection}
              name="Zoom Position"
              genomeAssembly={genomeAssembly}
            />
          )}
          {caselist.length > 0 && mainLocation && mainLocation.xDomain && (
            <GenomePositionBar
              onPositionChange={locationChangeHandler}
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
