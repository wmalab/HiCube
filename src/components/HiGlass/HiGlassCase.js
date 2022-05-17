import React, { useState, useEffect, useRef, useCallback } from "react";

import HiGlassWrapper from "./HiGlassWrapper";

// TODO: may need useCallback for handler function
// DONE: handle mainLocation sync
// TODO: handle switch mode between default and select
// TODO: handle create zoom-in view from selected range
// TODO: handle zoomLocation sync

const DEBOUNCE = true;
const DEBOUNCE_TIME = 100;
const DISABLE_NOTIFY_TIME = 100;

const HiGlassCase = (props) => {
  console.log("HiGlassCase render");

  const [mainLocation, setMainLocation] = useState();
  const hgcRef = useRef();
  const notify = useRef(true);
  const notifyTimer = useRef();
  // const [viewConfig, setViewConfig] = useState(props.viewConfig);

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


  return (
    <HiGlassWrapper
      onRef={hgcRef}
      options={props.options}
      viewConfig={props.viewConfig}
      mouseTool={props.mouseTool}
    />
  );
};

export default HiGlassCase;
