import React, { useState, useEffect, useRef, useCallback } from "react";

import HiGlassWrapper from "./HiGlassWrapper";

// TODO: may need useCallback for handler function

const DEBOUNCE = true;
const DEBOUNCE_TIME = 100;

const HiGlassCase = (props) => {
  console.log("HiGlassCase render");

  const [mainLocation, setMainLocation] = useState();
  const hgcRef = useRef();
  const notifyLocationChange = useRef(true);

  // listen to location changes for the main view
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

  useEffect(() => {
    console.log(props.id, notifyLocationChange.current);

    if (!notifyLocationChange.current) {
      return;
    }
    if (!DEBOUNCE) {
      props.onMainLocationChange(mainLocation, props.id);
      return;
    }
    const identifier = setTimeout(() => {
      props.onMainLocationChange(mainLocation, props.id);
    }, DEBOUNCE_TIME);
    return () => {
      clearTimeout(identifier);
    };
  }, [mainLocation]);

  useEffect(() => {
    const { xDomain, yDomain, fromId } = props.mainLocation;
    if (!fromId || fromId === props.id || !xDomain || !yDomain) {
      return;
    }
    notifyLocationChange.current = false;
    hgcRef.current.api.zoomTo("aa", ...xDomain, ...yDomain, 1);
    const identifier = setTimeout(() => {
      notifyLocationChange.current = true;
    }, 100);
    // return () => {
    //   clearTimeout(identifier);
    // };
  }, [props.mainLocation]);

  return (
    <HiGlassWrapper
      onRef={hgcRef}
      options={props.options}
      viewConfig={props.viewConfig}
    />
  );
};

export default HiGlassCase;
