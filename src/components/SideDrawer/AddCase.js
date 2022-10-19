import React, { useState, useContext, useRef } from "react";
import ConfigContext from "../../store/config-context";
import TrackSourceManager from "./TrackSourceManager";
import AssemblySelector from "../UI/AssemblySelector";
import AddCaseForm from "./AddCaseForm";
import PairedCaseForm from "./PairedCaseForm";
import Collapsible from "../UI/Collapsible";
import { uid } from "../../utils";
import classes from "./AddCase.module.css";

// const getHgcViewConfig = (formVals) => {
//   const view = {
//     initialXDomain: [
//       +formVals.initialXDomainStart,
//       +formVals.initialXDomainEnd,
//     ],
//     chromInfoPath: formVals.chromInfoPath,
//     tracks: {
//       top: [],
//       left: [],
//       center: [
//         {
//           uid: "c1",
//           type: "combined",
//           contents: [
//             {
//               uid: "heatmap",
//               server: formVals.heatmap.server,
//               tilesetUid: formVals.heatmap.tilesetUid,
//               type: "heatmap",
//             },
//           ],
//         },
//       ],
//       right: [],
//       bottom: [],
//     },
//   };
//   for (const track of formVals.tracks) {
//     for (const position of track.positions) {
//       if (track.type !== "chromosome-labels") {
//         view.tracks[position].push({
//           uid: uid(),
//           // FIXME: add prefix "horizontal-" solve not selectable
//           type: "horizontal-" + track.type,
//           server: track.server,
//           tilesetUid: track.tilesetUid,
//           height: 60,
//           width: 60,
//         });
//       } else {
//         view.tracks[position].push({
//           uid: uid(),
//           type: track.type,
//           chromInfoPath: track.chromInfoPath,
//           height: 30,
//           width: 30,
//         });
//       }
//     }
//   }
//   const viewConfig = {
//     editable: false,
//     zoomFixed: false,
//     views: [
//       {
//         ...view,
//         uid: "aa",
//         layout: {
//           w: 12,
//           h: 12,
//           x: 0,
//           y: 0,
//           static: true,
//         },
//       },
//     ],
//   };
//   return viewConfig;
// };

const AddCase = (props) => {
  const configCtx = useContext(ConfigContext);

  const fileRef = useRef();
  const g3dFileRef = useRef();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const submitHandler = (formVals) => {
    configCtx.addCase(formVals);
    // const hgcViewConfig = getHgcViewConfig(formVals);
    // console.log(hgcViewConfig);
    // props.onAddCase(hgcViewConfig);
  };

  const pairedSubmitHandler = (formVals) => {
    configCtx.addPairedCase(formVals);
  };

  const configSubmitHandler = () => {
    const fileObj = fileRef.current.files && fileRef.current.files[0];
    const g3dFileObjs = g3dFileRef.current.files;
    if (!fileObj) {
      return;
    }
    props.onSubmitConfig(fileObj, g3dFileObjs);
    // fileRef.current.value = null;
    // g3dFileRef.current.value = null;
  };

  const hasTrackSource = props.trackSourceServers.length > 0;
  const hasZeroCase = configCtx.cases.length === 0;
  const hasOneCase = configCtx.cases.length === 1;

  // const disableAddCase = props.trackSourceServers.length === 0;
  // FIXME: if already start add new case, delete all servers throw error
  return (
    <>
      <Collapsible
        title="Load Config File (JSON)"
        className={classes.enterfield}
        defaultCollapsed
      >
        <label>Config:</label>
        <input type="file" name="file" ref={fileRef} />
        <Collapsible title="3D Genome Structure Model (.g3d)">
          <label>G3D(s):</label>
          <input type="file" name="g3dfiles" ref={g3dFileRef} multiple />
        </Collapsible>
        <button className={classes.submit} onClick={configSubmitHandler}>
          Import Config with G3D File(s)
        </button>
      </Collapsible>
      <TrackSourceManager
        trackSourceServers={props.trackSourceServers}
        onAddServer={props.onAddServer}
        onRemoveServer={props.onRemoveServer}
      />
      {hasZeroCase && (
        <AssemblySelector
          trackSourceServers={props.trackSourceServers}
          onGenomeAssemblyChange={props.onGenomeAssemblyChange}
        />
      )}
      {!hasZeroCase && (
        <Collapsible title="Genome Assembly" className={classes.enterfield}>
          <label>Genome:</label>
          <span className={classes.value}>
            {props.genomeAssembly.assemblyName}
          </span>
        </Collapsible>
      )}
      <div className={classes.action}>
        {!show && hasZeroCase && (
          <button onClick={handleShow} disabled={!hasTrackSource}>
            Add A New Case
          </button>
        )}
        {!show && hasOneCase && (
          <button onClick={handleShow} disabled={!hasTrackSource}>
            Add A Paired Case
          </button>
        )}
      </div>
      {show && hasZeroCase && (
        <AddCaseForm
          trackSourceServers={props.trackSourceServers}
          genomeAssembly={props.genomeAssembly}
          onSubmit={submitHandler}
          onClose={handleClose}
        />
      )}
      {show && hasOneCase && (
        <PairedCaseForm
          genomeAssembly={props.genomeAssembly}
          mainLocation={props.mainLocation}
          trackSourceServers={props.trackSourceServers}
          centerHiC={configCtx.cases[0].views[0]["2d"].contents[0]}
          tracks={configCtx.cases[0].views[0]["1d"]}
          onSubmit={pairedSubmitHandler}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default AddCase;
