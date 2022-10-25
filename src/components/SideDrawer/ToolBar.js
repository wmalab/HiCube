import React, { useState, useRef } from "react";
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
  const fileRef = useRef();
  const [enteredText, setEnteredText] = useState();

  const textareaChangeHandler = (event) => {
    setEnteredText(event.target.value);
  };

  const submitHandler = () => {
    // TODO: validate enteredText before submit
    props.onAddOverlay({
      fileObj: fileRef.current.files[0],
      enteredText: enteredText,
    });
    fileRef.current.value = null;
    setEnteredText("");
  };

  return (
    <>
      <Collapsible title="Zoom View">
        <div className={classes.action}>
          <button onClick={props.onSelect}>Select Zoom Region</button>
          <button onClick={props.onCancel}>Cancel</button>
          <button onClick={props.onAddZoomIn}>Create Zoom View</button>
          <button onClick={props.onRemoveZoomIn}>Remove Zoom View</button>
        </div>
      </Collapsible>
      <Collapsible title="Annotations">
        <div className={classes.action}>
          <div>
            <label>Upload:</label>
            <input type="file" name="file" ref={fileRef} />
          </div>
          <div>
            <label className={classes.textinput}>
              Enter genomic intervals (1 per line):
            </label>
            <textarea
              cols={35}
              rows={6}
              onChange={textareaChangeHandler}
              value={enteredText}
              placeholder="e.g. chrom start chrom end 
              or chrom x-start chrom x-end chrom y-start chrom y-end"
            />
          </div>
          <button onClick={props.onSelect}>Select Annotation Region</button>
          <button onClick={props.onCancel}>Cancel</button>
          <button onClick={submitHandler}>Add Annotation</button>
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
