import React, { useState, useContext } from "react";
import ConfigContext from "../../store/config-context";
import TrackSourceManager from "./TrackSourceManager";
import AddCaseForm from "./AddCaseForm";
import { uid } from "../../utils";

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

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const submitHandler = (formVals) => {
    configCtx.addCase(formVals);
    // const hgcViewConfig = getHgcViewConfig(formVals);
    // console.log(hgcViewConfig);
    // props.onAddCase(hgcViewConfig);
  };

  const disableAddCase = props.trackSourceServers.length === 0;
  // FIXME: if already start add new case, delete all servers throw error
  return (
    <>
      <TrackSourceManager
        trackSourceServers={props.trackSourceServers}
        onAddServer={props.onAddServer}
        onRemoveServer={props.onRemoveServer}
      />
      {!show && (
        <button onClick={handleShow} disabled={disableAddCase}>
          Add A New Case
        </button>
      )}
      {show && (
        <AddCaseForm
          trackSourceServers={props.trackSourceServers}
          onSubmit={submitHandler}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default AddCase;
