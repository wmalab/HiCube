import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useContext,
  useImperativeHandle,
} from "react";
import ConfigContext from "../../store/config-context";

import HiGlassWrapper from "./HiGlassWrapper";
import { download } from "../../utils";

// TODO: may need useCallback for handler function
// DONE: handle mainLocation sync
// DONE: handle switch mode between default and select
// DONE: handle create zoom-in view from selected range
// DONE: handle zoomLocation sync
// TODO: add exportAsPngBlobPromise API for export function

const DEBOUNCE = true;
const DEBOUNCE_TIME = 100;
const DISABLE_NOTIFY_TIME = 100;

const HiGlassCase = (props, ref) => {
  console.log("HiGlassCase render");

  const configCtx = useContext(ConfigContext);

  const [mainLocation, setMainLocation] = useState();
  const [zoomLocation, setZoomLocation] = useState();
  const hgcRef = useRef();
  const notify = useRef(true);
  const notifyTimer = useRef();
  const zoomLocationListener = useRef();

  const getRangeSelection = () => {
    const { dataRange } = hgcRef.current.api.getRangeSelection();
    // if no selection, dataRange = undefined or [null, null]
    // if 1D selection, dataRange = [Array(2), null]
    // if 2D selection, dataRange = [Array(2), Array(2)]

    if (dataRange === undefined || !dataRange[0]) {
      return undefined;
    }
    const xDomain = [...dataRange[0]];
    const yDomain = dataRange[1] ? [...dataRange[1]] : [...dataRange[0]];
    const dim = dataRange[1] ? 2 : 1;
    return { xDomain, yDomain, dim };
  };

  const subscribeZoomLocation = () => {
    zoomLocationListener.current = hgcRef.current.api.on(
      "location",
      (location) => setZoomLocation(location),
      "bb"
    );
  };

  const unsubscribeZoomLocation = () => {
    // add check if view bb and listener exist
    if (!zoomLocationListener.current || props.viewConfig.views.length > 1) {
      return;
    }
    hgcRef.current.api.off("location", zoomLocationListener.current, "bb");
    zoomLocationListener.current = null;
  };

  const exportViewsToSvg = () => {
    const svgStr = hgcRef.current.api.exportAsSvg();
    download(new Blob([svgStr], { type: "image/svg+xml" }), "Views2D.svg");
  };

  const exportViewsToPng = () => {
    hgcRef.current.api.exportAsPngBlobPromise().then((blob) => {
      download(blob, "Views2D.png");
    });
  };

  useImperativeHandle(ref, () => ({
    api: hgcRef.current.api,
    getRangeSelection: getRangeSelection,
    unsubscribeZoomLocation: unsubscribeZoomLocation,
    exportViewsToSvg: exportViewsToSvg,
    exportViewsToPng: exportViewsToPng,
  }));

  const viewConfigReducer = (state, action) => {
    let vcf = hgcRef.current.api.getViewConfig();

    if (action.type === "CREATE_ZOOM_VIEW") {
      if (vcf.views.length === 2) {
        vcf.views.pop();
        vcf.views[0].tracks.center[0].contents.pop();
        // FIXME: create zoom view when exist zoom view not working
        // possibly zoomLocation triggered so the new zoom view
        // revert back to the old location
      }
      vcf.views[0].layout = {
        w: 6,
        h: 12,
        x: 0,
        y: 0,
        static: true,
      };
      const tempView = JSON.parse(JSON.stringify(vcf.views[0]));
      tempView.tracks.top.push({
        ...tempView.tracks.center[0].contents[0],
        uid: Math.random().toString(),
        type: "horizontal-heatmap",
        height: 50,
        options: { labelPosition: "hidden" },
      });
      tempView.tracks.left.push({
        ...tempView.tracks.center[0].contents[0],
        uid: Math.random().toString(),
        type: "vertical-heatmap",
        width: 50,
        options: { labelPosition: "hidden" },
      });
      const newView = {
        ...tempView,
        uid: "bb",
        initialXDomain: action.xDomain,
        initialYDomain: action.yDomain,
        layout: {
          w: 6,
          h: 12,
          x: 6,
          y: 0,
          // moved: false,
          static: true,
        },
      };
      vcf.views.push(newView);
      vcf.views[0].tracks.center[0].contents.push({
        type: "viewport-projection-center",
        uid: "my-track-id",
        fromViewUid: "bb",
        options: {
          projectionFillOpacity: 0.3,
          projectionStrokeColor: "black",
          projectionFillColor: "black",
          projectionStrokeOpacity: 0.3,
          strokeWidth: 1,
        },
      });
    } else if (action.type === "CLEAR_ZOOM_VIEW") {
      // FIXME: after add one case -> create zoom-in -> clear zoom-in
      // then add another case will throw an error
      vcf.views.pop();
      vcf.views[0].tracks.center[0].contents.pop();
      vcf.views[0].layout = {
        w: 12,
        h: 12,
        x: 0,
        y: 0,
        static: true,
      };
    } else if (action.type === "CLEAR_OVERLAYS") {
      for (const view of vcf.views) {
        view.overlays = [];
      }
    } else if (action.type === "CHANGE_OVERLAYS") {
      // TODO: includes all tracks
      for (const view of vcf.views) {
        view.overlays = [];
        for (const overlay of action.overlays) {
          view.overlays.push({
            uid: overlay.uid,
            includes: [
              "c1",
              "OHJakQICQD6gTD7skx4EWA",
              "dqBTMH78Rn6DeSyDBoAEXw",
            ],
            options: {
              extent: [overlay.extent],
            },
          });
        }
      }
    }
    return vcf;
  };

  const [viewConfig, dispatchViewConfigAction] = useReducer(
    viewConfigReducer,
    props.viewConfig
  );

  /* 
  listen to location changes for the main view
  and update state `mainLocation`
  */
  useEffect(() => {
    const api = hgcRef.current.api;
    const listenerId = api.on(
      "location",
      (location) => {
        setMainLocation(location);
      },
      "aa"
    );
    const clickId = api.on("click", (param) => {
      console.log(param);
    });
    return () => {
      api.off("location", listenerId, "aa");
      api.off("click", clickId);
    };
  }, []);

  /*
  when state `mainLocation` updated, forward it to parent
  only when `notify` is enabled to avoid infinite loop
  debounce the forward to avoid too many location updates
  */
  useEffect(() => {
    console.log(props.id, notify.current);

    if (!notify.current) {
      return;
    }
    if (!DEBOUNCE) {
      props.onMainLocationChange(mainLocation, props.id);
      return;
    }
    const timer = setTimeout(() => {
      props.onMainLocationChange(mainLocation, props.id);
    }, DEBOUNCE_TIME);
    return () => {
      clearTimeout(timer);
    };
  }, [mainLocation]);

  /*
  if the mainLocation prop changed from other component
  update the current mainLocation by call api `zoomTo`
  disable `notify` location change before `zoomTo` to avoid infinite loop

  if there is existing timer we need to clear it first 
  to avoid overwrite `notify` to true during current `zoomTo` call
  */
  useEffect(() => {
    const { xDomain, yDomain, fromId } = props.mainLocation;
    if (!fromId || fromId === props.id || !xDomain || !yDomain) {
      return;
    }
    if (notifyTimer.current) {
      clearTimeout(notifyTimer.current);
    }
    notify.current = false;
    // FIXME: invalid viewUid, current viewUids is empty
    try {
      hgcRef.current.api.zoomTo("aa", ...xDomain, ...yDomain, 1);
    } catch (error) {
      console.log(error);
      notify.current = true;
    }
    notifyTimer.current = setTimeout(() => {
      notify.current = true;
      notifyTimer.current = null;
    }, DISABLE_NOTIFY_TIME);
  }, [props.mainLocation]);

  useEffect(() => {
    if (props.mouseTool === "move_create") {
      const { dataRange } = hgcRef.current.api.getRangeSelection();
      if (!dataRange || dataRange.every((e) => e === null)) {
        return;
      }
      if (dataRange.length === 2) {
        // props.onRangeSelection(
        //   "CREATE",
        //   {
        //     xDomain: [...dataRange[0]],
        //     yDomain: [...dataRange[1]],
        //   },
        //   props.id
        // );
        configCtx.addZoomView([
          { xDomain: mainLocation.xDomain, yDomain: mainLocation.yDomain },
          { xDomain: [...dataRange[0]], yDomain: [...dataRange[1]] },
        ]);
      }
    } else if (props.mouseTool === "move_clear") {
      // props.onRangeSelection(
      //   "CLEAR",
      //   { xDomain: [null, null], yDomain: [null, null] },
      //   props.id
      // );
      configCtx.removeZoomView([
        { xDomain: mainLocation.xDomain, yDomain: mainLocation.yDomain },
      ]);
    } else if (props.mouseTool === "add_overlay") {
      // TODO: refactor this part
      const { dataRange } = hgcRef.current.api.getRangeSelection();
      if (!dataRange || dataRange.every((e) => e === null)) {
        return;
      }
      // FIXME: the length of dataRange will still be 2
      // but one of them (the second one) will be null
      if (dataRange[1] === null) {
        props.onCreateOverlay("1D", dataRange, props.id);
      } else {
        props.onCreateOverlay("2D", dataRange, props.id);
      }
    }
  }, [props.mouseTool]);

  useEffect(() => {
    console.log(props.rangeSelection);

    if (!props.rangeSelection) {
      return;
    }

    if (props.rangeSelection.type === "CREATE") {
      dispatchViewConfigAction({
        type: "CREATE_ZOOM_VIEW",
        xDomain: props.rangeSelection.xDomain,
        yDomain: props.rangeSelection.yDomain,
      });
    } else if (props.rangeSelection.type === "CLEAR") {
      dispatchViewConfigAction({ type: "CLEAR_ZOOM_VIEW" });
    } else if (props.rangeSelection.type === "UPDATE") {
      const { xDomain, yDomain, fromId } = props.rangeSelection;
      if (!fromId || fromId === props.id || !xDomain || !yDomain) {
        return;
      }
      if (notifyTimer.current) {
        clearTimeout(notifyTimer.current);
      }
      notify.current = false;
      try {
        hgcRef.current.api.zoomTo("bb", ...xDomain, ...yDomain, 1);
      } catch (error) {
        console.log(error);
        notify.current = true;
      }
      notifyTimer.current = setTimeout(() => {
        notify.current = true;
        notifyTimer.current = null;
      }, DISABLE_NOTIFY_TIME);
    }
  }, [props.rangeSelection]);

  useEffect(() => {
    if (props.overlays.length === 0) {
      // dispatchViewConfigAction({ type: "CLEAR_OVERLAYS" });
      if (mainLocation && mainLocation.xDomain && mainLocation.yDomain) {
        configCtx.removeOverlays([
          { xDomain: mainLocation.xDomain, yDomain: mainLocation.yDomain },
          {
            xDomain: zoomLocation && zoomLocation.xDomain,
            yDomain: zoomLocation && zoomLocation.yDomain,
          },
        ]);
      }
    } else {
      // dispatchViewConfigAction({
      //   type: "CHANGE_OVERLAYS",
      //   overlays: props.overlays,
      // });
      // mainLocation (local) can be null when init
      // BEWARE: zoomLocation is local value,
      // props.rangeSelection is passed as props
      // they have different name
      configCtx.updateOverlays(props.overlays, [
        {
          xDomain: props.mainLocation.xDomain,
          yDomain: props.mainLocation.yDomain,
        },
        {
          xDomain: props.rangeSelection && props.rangeSelection.xDomain,
          yDomain: props.rangeSelection && props.rangeSelection.yDomain,
        },
      ]);
    }
  }, [props.overlays]);

  // FIXME: add listener to zoom view
  useEffect(() => {
    if (props.viewConfig.views.length === 2 && !zoomLocationListener.current) {
      zoomLocationListener.current = hgcRef.current.api.on(
        "location",
        (location) => {
          setZoomLocation(location);
        },
        "bb"
      );
    } else if (
      props.viewConfig.views.length === 1 &&
      zoomLocationListener.current
    ) {
      hgcRef.current.api.off("location", zoomLocationListener.current, "bb");
      zoomLocationListener.current = null;
    }
  }, [props.viewConfig]);

  useEffect(() => {
    console.log(props.id, notify.current);

    if (!notify.current) {
      return;
    }
    if (!DEBOUNCE) {
      props.onRangeSelection("UPDATE", zoomLocation, props.id);
      return;
    }
    const timer = setTimeout(() => {
      props.onRangeSelection("UPDATE", zoomLocation, props.id);
    }, DEBOUNCE_TIME);
    return () => {
      clearTimeout(timer);
    };
  }, [zoomLocation]);

  // const mouseTool = props.mouseTool === "select" ? "select" : "move";

  // TODO: add export as png ----------------------------------------
  useEffect(() => {
    // let isRendering = false;
    // const renderPreview = () => {
    //   if (isRendering) return;
    //   isRendering = true;
    //   window.requestIdleCallback(() => {
    //     const svgStr = hgcRef.current.api.exportAsSvg();
    //     document.getElementById('preview').innerHTML = svgStr;
    //     isRendering = false;
    //   });
    // };
    // hgcRef.current.api.on('location', renderPreview);
    if (props.exportSvg) {
      // const svgStr = hgcRef.current.api.exportAsSvg();
      // document.getElementById('preview').innerHTML = svgStr;
      hgcRef.current.api.exportAsPngBlobPromise().then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("download", "2d-hic.png");
        link.setAttribute("href", blobUrl);
        link.click();
        props.onFinishExportSvg();
      });
    }
  }, [props.exportSvg]);
  // ----------------------------------------------------------------

  console.log(props.viewConfig);

  // FIXME: use viewConfig from context cause reloading Tileset info
  // trigger TrackRenderer -> UNSAFE_componentWillReceiveProps
  // where `if (this.prevPropsStr === nextPropsStr) return;` is false
  // -> syncTrackObjects -> addNewTracks
  // combined track Uid does not generated it's undefined
  return (
    <HiGlassWrapper
      id={props.id}
      onRef={hgcRef}
      options={props.options}
      viewConfig={props.viewConfig}
      mouseTool={props.mouseTool}
    />
  );
};

export default React.forwardRef(HiGlassCase);
