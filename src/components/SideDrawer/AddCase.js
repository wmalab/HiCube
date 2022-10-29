import React, { useState, useContext, useRef } from "react";
import ConfigContext from "../../store/config-context";
import TrackSourceManager from "./TrackSourceManager";
import AssemblySelector from "../UI/AssemblySelector";
import AddCaseForm from "./AddCaseForm";
import PairedCaseForm from "./PairedCaseForm";
import Collapsible from "../UI/Collapsible";
import CaseManager from "./CaseManager";
import classes from "./AddCase.module.css";

const AddCase = (props) => {
  const configCtx = useContext(ConfigContext);

  const fileRef = useRef();
  const g3dFileRef = useRef();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const submitHandler = (formVals) => {
    configCtx.addCase(formVals);
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
  return (
    <>
      <Collapsible
        title="Load Config File (JSON)"
        className={classes.enterfield}
        defaultCollapsed
      >
        <label>Config:</label>
        <input type="file" name="file" ref={fileRef} accept=".json" />
        <Collapsible title="3D Genome Structure Model (.g3d)">
          <label>G3D(s):</label>
          <input type="file" name="g3dfiles" ref={g3dFileRef} multiple accept=".g3d" />
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
          zoomLocation={props.zoomLocation}
          trackSourceServers={props.trackSourceServers}
          centerHiC={configCtx.cases[0].views[0]["2d"].contents[0]}
          tracks={configCtx.cases[0].views[0]["1d"]}
          onSubmit={pairedSubmitHandler}
          onClose={handleClose}
        />
      )}
      {!hasZeroCase && (
        <CaseManager />
      )}
    </>
  );
};

export default AddCase;
