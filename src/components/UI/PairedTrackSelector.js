import React from "react";
import { useFormikContext } from "formik";
import TrackSelector from "./TrackSelector";

const PairedTrackSelector = (props) => {
  const { name, pairTrack } = props;
  const { setFieldValue } = useFormikContext();

  const datasetChangeHandler = (dataset) => {
    setFieldValue(`${name}.server`, dataset.server);
    setFieldValue(`${name}.tilesetUid`, dataset.tilesetUid);
    setFieldValue(`${name}.name`, dataset.name);
  };

  return (
    <>
      <p>
        Select paired track for <strong>{pairTrack.name}</strong>
      </p>
      <p>
        Datatype:<strong>{pairTrack.datatype}</strong>, Tracktype:
        <strong>{pairTrack.type}</strong>
      </p>
      <label>Dataset:</label>
      <TrackSelector
        datatype={props.datatype}
        assembly={props.assemblyName}
        trackSourceServers={props.trackSourceServers}
        onDatasetChange={datasetChangeHandler}
      />
    </>
  );
};

export default PairedTrackSelector;
