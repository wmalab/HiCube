import React from "react";
import OverlayList from "./OverlayList";
import Collapsible from "../UI/Collapsible";
import classes from "./ToolBar.module.css";

// const OverlayList = (props) => {
//   return (
//     <ul>
//       {props.overlays.map((overlay) => {
//         return (
//           <li key={overlay.uid}>
//             <span>{`${overlay.extent[0]}-${overlay.extent[1]}`}</span>
//             {overlay.extent.length > 2 && (
//               <span>{`, ${overlay.extent[2]}-${overlay.extent[3]}`}</span>
//             )}
//             <button onClick={props.onRemoveOverlay.bind(null, overlay.uid)}>
//               <ion-icon name="trash-outline"></ion-icon>
//             </button>
//           </li>
//         );
//       })}
//     </ul>
//   );
// };

const ToolBar = (props) => {
  return (
    <>
      <Collapsible title="Zoom-In View">
        <div className={classes.action}>
          <button onClick={props.onSelect}>Select Zoom-In Region</button>
          <button onClick={props.onCancel}>Cancel</button>
          <button onClick={props.onAddZoomIn}>Create Zoom-In View</button>
          <button onClick={props.onRemoveZoomIn}>Remove Zoom-In View</button>
        </div>
      </Collapsible>
      <Collapsible title="Annotations">
        <div className={classes.action}>
          <button onClick={props.onSelect}>Select Annotation Region</button>
          <button onClick={props.onCancel}>Cancel</button>
          <button onClick={props.onAddOverlay}>Add Annotation</button>
          <button onClick={props.onRemoveOverlays}>
            Remove All Annotations
          </button>
        </div>
        <OverlayList
          overlays={props.overlays}
          onUpdateOverlay={props.onUpdateOverlay}
          onRemoveOverlay={props.onRemoveOverlay}
          genomeAssembly={props.genomeAssembly}
        />
      </Collapsible>
    </>
  );
};

export default ToolBar;
