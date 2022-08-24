import React, { useState, useReducer, useContext } from "react";
import ConfigContext from "./store/config-context";
import HiGlassCase from "./components/HiGlass/HiGlassCase";
import ControlPanel from "./components/SideDrawer/ControlPanel";
import GenomePositionBar from "./components/GenomePositionSearch/GenomePositionBar";
import { defaultOptions as options } from "./configs/default-config";
// import GridLayout from "react-grid-layout";
import ThreeTrack from "./components/Three/ThreeTrack";
import { uid } from "./utils";
import "../node_modules/react-grid-layout/css/styles.css";
import "../node_modules/react-resizable/css/styles.css";

const overlaysReducer = (state, action) => {
  if (action.type === "ADD_1D") {
    return state.concat({
      uid: "overlay-1d-" + uid(),
      extent: action.extent,
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
          anchor1Color: "",
          anchor1Radius: 1,
          drawAnchor2: false,
          anchor2Color: "",
          anchor2Radius: 1,
        },
      },
    });
  } else if (action.type === "ADD_2D") {
    return state.concat({
      uid: "overlay-2d-" + uid(),
      extent: action.extent,
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
          anchor1Radius: 1,
          drawAnchor2: true,
          anchor2Color: "blue",
          anchor2Radius: 1,
        },
      },
    });
  } else if (action.type === "CLEAR") {
    return [];
  } else if (action.type === "REMOVE") {
    return state.filter((overlay) => overlay.uid !== action.uuid);
  } else if (action.type === "UPDATE") {
    const { uuid, options } = action;
    const overlayIndex = state.findIndex((overlay) => overlay.uid === uuid);
    const overlay = state[overlayIndex];
    const updatedOverlay = { ...overlay, options: options };
    const updatedOverlays = [...state];
    updatedOverlays[overlayIndex] = updatedOverlay;
    return updatedOverlays;
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
    setMouseTool("move_create");
  };

  const cancelSelectHandler = () => {
    setMouseTool("move_cancel");
  };

  const clearSelectHandler = () => {
    setMouseTool("move_clear");
  };

  const addOverlayHandler = () => {
    setMouseTool("add_overlay");
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

  const updateOverlayHandler = (overlayUid, overlayOptions) => {
    dispatchOverlaysAction({
      type: "UPDATE",
      uuid: overlayUid,
      options: overlayOptions,
    });
  };

  const removeOverlayHandler = (overlayUid) => {
    dispatchOverlaysAction({ type: "REMOVE", uuid: overlayUid });
  };

  // const nViews =
  //   !rangeSelection.xDomain || rangeSelection.xDomain.every((e) => e === null)
  //     ? 1
  //     : 2;
  const nViews = configCtx.numViews > 1 ? 2 : 1;

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

  return (
    <div>
      <ControlPanel
        trackSourceServers={trackSourceServers}
        onAddServer={addServerHandler}
        onRemoveServer={removeServerHandler}
        genomeAssembly={genomeAssembly}
        onGenomeAssemblyChange={genomeAssemblyChangeHandler}
        mainLocation={mainLocation}
        // onAddCase={addCaseHandler}
        // configs={configs}
        onSelect={activateSelectHandler}
        onCancelSelect={cancelSelectHandler}
        onAddZoomIn={createZoomInHandler}
        onRemoveZoomIn={clearSelectHandler}
        overlays={overlays}
        onAddOverlay={addOverlayHandler}
        onUpdateOverlay={updateOverlayHandler}
        onRemoveOverlays={clearOverlaysHandler}
        onRemoveOverlay={removeOverlayHandler}
      />
      <div style={{ position: "absolute", left: "330px", paddingLeft: "10px" }}>
        {rangeSelection && rangeSelection.xDomain && (
          <GenomePositionBar
            positions={rangeSelection}
            name="Zoom view"
            genomeAssembly={genomeAssembly}
          />
        )}
        <GenomePositionBar
          onPositionChange={locationChangeHandler}
          positions={mainLocation}
          name="Base view"
          genomeAssembly={genomeAssembly}
        />
        <div
        // className="content"
        // className="layout"
        // layout={layout}
        // cols={12}
        // rowHeight={100}
        // width={1200}
        >
          {configCtx.cases.map((caseUids) => {
            return (
              <>
                <div key={caseUids.uid + "-higlass"} className="content-item">
                  <HiGlassCase
                    id={caseUids.uid}
                    options={options}
                    viewConfig={configCtx.viewConfigs[caseUids.uid]}
                    mainLocation={mainLocation}
                    onMainLocationChange={locationChangeHandler}
                    mouseTool={mouseTool}
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
                  />
                </div>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}
