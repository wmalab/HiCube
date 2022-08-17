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

export default OverlayList;