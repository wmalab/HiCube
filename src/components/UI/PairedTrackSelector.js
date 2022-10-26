import React from "react";
import { useFormikContext } from "formik";
import TrackSelector from "./TrackSelector";
import Collapsible from "./Collapsible";
import { truncateString } from "../../utils";
import classes from "./PairedTrackSelector.module.css";

const PairedTrackSelector = (props) => {
  const { name, pairTrack } = props;
  const { setFieldValue } = useFormikContext();

  const datasetChangeHandler = (dataset) => {
    setFieldValue(`${name}.server`, dataset.server);
    setFieldValue(`${name}.tilesetUid`, dataset.tilesetUid);
    setFieldValue(`${name}.name`, dataset.name);
  };

  return (
    <Collapsible
      title={truncateString(pairTrack.name, 30)}
      className={classes.enterfield}
    >
      <div>
        <label>Data type:</label>
        <span className={classes.value}>{pairTrack.datatype}</span>
      </div>
      <div>
        <label>Track type:</label>
        <span className={classes.value}>{pairTrack.type}</span>
      </div>
      <div>
        <TrackSelector
          label="Pair dataset"
          datatype={props.datatype}
          assembly={props.assemblyName}
          trackSourceServers={props.trackSourceServers}
          onDatasetChange={datasetChangeHandler}
        />
      </div>
    </Collapsible>
  );
};

export default PairedTrackSelector;
