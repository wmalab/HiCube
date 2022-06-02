import React, { useState, useEffect, useRef, useReducer } from "react";

import HiGlassWrapper from "./HiGlassWrapper";

// TODO: may need useCallback for handler function
// DONE: handle mainLocation sync
// DONE: handle switch mode between default and select
// DONE: handle create zoom-in view from selected range
// DONE: handle zoomLocation sync

const DEBOUNCE = true;
const DEBOUNCE_TIME = 100;
const DISABLE_NOTIFY_TIME = 100;

const HiGlassCase = (props) => {
  console.log("HiGlassCase render");

  const [mainLocation, setMainLocation] = useState();
  const [zoomLocation, setZoomLocation] = useState();
  const hgcRef = useRef();
  const notify = useRef(true);
  const notifyTimer = useRef();
  const zoomLocationListener = useRef();

  const viewConfigReducer = (state, action) => {
    if (action.type === "CREATE_ZOOM_VIEW") {
      let vcf = hgcRef.current.api.getViewConfig();
      if (vcf.views.length === 2) {
        vcf.views.pop();
        vcf.views[0].tracks.center[0].contents.pop();
        // FIXME create zoom view when exist zoom view not working
        // possibly zoomLocation triggered so the new zoom view
        // revert back to the old location
      }
      const tempView = JSON.parse(JSON.stringify(vcf.views[0]));
      const newView = {
        ...tempView,
        uid: "bb",
        initialXDomain: action.xDomain,
        initialYDomain: action.yDomain,
        layout: {
          w: 12,
          h: 12,
          x: 0,
          y: 0,
          moved: false,
          static: false,
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
      return vcf;
    } else if (action.type === "CLEAR_ZOOM_VIEW") {
      let vcf = hgcRef.current.api.getViewConfig();
      vcf.views.pop();
      vcf.views[0].tracks.center[0].contents.pop();
      return vcf;
    }
  };

  const [viewConfig, dispatchViewConfig] = useReducer(
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
    return () => {
      api.off("location", listenerId, "aa");
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
    hgcRef.current.api.zoomTo("aa", ...xDomain, ...yDomain, 1);
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
        props.onRangeSelection(
          "CREATE",
          {
            xDomain: [...dataRange[0]],
            yDomain: [...dataRange[1]],
          },
          props.id
        );
      }
    } else if (props.mouseTool === "move_clear") {
      props.onRangeSelection(
        "CLEAR",
        { xDomain: [null, null], yDomain: [null, null] },
        props.id
      );
    } else if (props.mouseTool === "add_overlay") {
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
      dispatchViewConfig({
        type: "CREATE_ZOOM_VIEW",
        xDomain: props.rangeSelection.xDomain,
        yDomain: props.rangeSelection.yDomain,
      });
    } else if (props.rangeSelection.type === "CLEAR") {
      dispatchViewConfig({ type: "CLEAR_ZOOM_VIEW" });
    } else if (props.rangeSelection.type === "UPDATE") {
      const { xDomain, yDomain, fromId } = props.rangeSelection;
      if (!fromId || fromId === props.id || !xDomain || !yDomain) {
        return;
      }
      if (notifyTimer.current) {
        clearTimeout(notifyTimer.current);
      }
      notify.current = false;
      hgcRef.current.api.zoomTo("bb", ...xDomain, ...yDomain, 1);
      notifyTimer.current = setTimeout(() => {
        notify.current = true;
        notifyTimer.current = null;
      }, DISABLE_NOTIFY_TIME);
    }
  }, [props.rangeSelection]);

  useEffect(() => {
    if (viewConfig.views.length === 2 && !zoomLocationListener.current) {
      zoomLocationListener.current = hgcRef.current.api.on(
        "location",
        (location) => {
          setZoomLocation(location);
        },
        "bb"
      );
    } else if (viewConfig.views.length === 1 && zoomLocationListener.current) {
      hgcRef.current.api.off("location", zoomLocationListener.current, "bb");
      zoomLocationListener.current = null;
    }
  }, [viewConfig]);

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

  const mouseTool = props.mouseTool === "select" ? "select" : "move";

  return (
    <HiGlassWrapper
      onRef={hgcRef}
      options={props.options}
      viewConfig={viewConfig}
      mouseTool={mouseTool}
    />
  );
};

export default HiGlassCase;
