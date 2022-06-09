import React from "react";

const OverlayList = (props) => {
  return (
    <ul>
      {props.overlays.map((overlay) => {
        return (
          <li key={overlay.uid}>
            <span>{`${overlay.extent[0]}-${overlay.extent[1]}`}</span>
            {overlay.extent.length > 2 && (
              <span>{`, ${overlay.extent[2]}-${overlay.extent[3]}`}</span>
            )}
            <button onClick={props.onRemoveOverlay.bind(null, overlay.uid)}>
              <ion-icon name="trash-outline"></ion-icon>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const ToolBar = (props) => {
  return (
    <div>
      <div>
        <button onClick={props.onSelect}>Select Zoom-In Region</button>
        <button onClick={props.onCancel}>Cancel</button>
        <button onClick={props.onAddZoomIn}>+ Create Zoom-In View</button>
        <button onClick={props.onRemoveZoomIn}>- Remove Zoom-In View</button>
      </div>
      <div>
        <button onClick={props.onSelect}>Select Overlay Region</button>
        <button onClick={props.onCancel}>Cancel</button>
        <button onClick={props.onAddOverlay}>+ Add Overlay</button>
        <button onClick={props.onRemoveOverlays}>- Remove All Overlays</button>
        <OverlayList overlays={props.overlays} onRemoveOverlay={props.onRemoveOverlay} />
      </div>
    </div>
  );
};

export default ToolBar;
