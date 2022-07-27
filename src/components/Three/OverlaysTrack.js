import React from "react";
import Overlay1dTrack from "./Overlay1dTrack";
import Overlay2dTrack from "./Overlay2dTrack";

const OverlaysTrack = (props) => {
  const { overlays1d, overlays2d } = props;
  const tracks1d = overlays1d.map((overlay) => (
    <Overlay1dTrack key={overlay.uid} points={overlay.points} />
  ));
  const tracks2d = overlays2d.map((overlay) => (
    <Overlay2dTrack
      key={overlay.uid}
      anchor1={overlay.anchor1}
      anchor2={overlay.anchor2}
    />
  ));
  return (
    <>
      {tracks1d.length > 0 && tracks1d}
      {tracks2d.length > 0 && tracks2d}
    </>
  );
};

export default OverlaysTrack;
