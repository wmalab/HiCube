import React, { useState, useEffect } from "react";
import { Field, useField, useFormikContext } from "formik";
import TrackSelector from "./TrackSelector";

// for datatype `chromsizes` we don't need select dataset
const DATA_TYPES = {
  "gene-annotation": {
    "track-type": ["gene-annotation"],
  },
  matrix: {
    "track-type": ["linear-heatmap"],
  },
  "2d-rectangle-domains": {
    "track-type": ["2d-rectangle-domains", "linear-2d-rectangle-domains"],
  },
  vector: {
    "track-type": ["line", "bar", "point", "1d-heatmap"],
  },
  chromsizes: {
    "track-type": ["chromosome-labels", "2d-chromosome-grid"],
  },
};

const TRACK_ORIENTATION = {
  "gene-annotation": "1d",
  "linear-heatmap": "1d",
  "2d-rectangle-domains": "2d",
  "linear-2d-rectangle-domains": "1d",
  line: "1d",
  bar: "1d",
  point: "1d",
  "1d-heatmap": "1d",
  "chromosome-labels": "1d",
  "2d-chromosome-grid": "2d",
};

const findTracktypes = (datatype) => {
  if (datatype in DATA_TYPES) {
    return DATA_TYPES[datatype]["track-type"];
  }
  return [];
};

const findTrackOrientation = (tracktype) => {
  if (tracktype in TRACK_ORIENTATION) {
    return TRACK_ORIENTATION[tracktype];
  }
  return null;
};

const TrackSelectComponent = ({ field, form, ...props }) => {
  const datasetChangeHandler = (dataset) => {
    for (const key in dataset) {
      form.setFieldValue(`${field.name}.${key}`, dataset[key]);
    }
  };

  return (
    <TrackSelector
      datatype={props.datatype}
      assembly={props.assemblyName}
      trackSourceServers={props.trackSourceServers}
      onDatasetChange={datasetChangeHandler}
    />
  );
};

const TracktypeSelectComponent = ({ field, form, ...props }) => {
  const { datatype } = props;
  const availTracktypes = findTracktypes(datatype);
  const firstAvailType = availTracktypes.length > 0 ? availTracktypes[0] : null;

  useEffect(() => {
    if (firstAvailType) {
      form.setFieldValue(field.name, firstAvailType);
    }
  }, [firstAvailType]);

  return (
    <>
      {firstAvailType && (
        <select {...field}>
          {availTracktypes.map((tracktype) => (
            <option value={tracktype} key={tracktype}>
              {tracktype}
            </option>
          ))}
        </select>
      )}
    </>
  );
};

const TrackPositionItem = (props) => {
  const { label, name } = props;
  return (
    <label>
      <Field type="checkbox" name={name} />
      {label}
    </label>
  );
};

const TrackPositionsComponent = (props) => {
  const { name, orientation } = props;
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    if (orientation === "1d") {
      setFieldValue(`${name}.center`, false);
    } else if (orientation === "2d") {
      for (const pos of ["top", "bottom", "left", "right"]) {
        setFieldValue(`${name}.${pos}`, false);
      }
    }
  }, [orientation, name, setFieldValue]);

  return (
    <div>
      {!orientation && <span></span>}
      {orientation === "1d" && (
        <>
          <TrackPositionItem label="top" name={`${name}.top`} />
          <TrackPositionItem label="bottom" name={`${name}.bottom`} />
          <TrackPositionItem label="left" name={`${name}.left`} />
          <TrackPositionItem label="right" name={`${name}.right`} />
        </>
      )}
      {orientation === "2d" && (
        <TrackPositionItem label="center" name={`${name}.center`} />
      )}
    </div>
  );
};

// Select track datatype
// track orientation: 1d, 2d
// track type
// track positions
// dependency:
// datatype -> dataset,
// datatype -> tracktype,
// tracktype -> positions
// TODO: maybe put datatype and orientation into form values?
// trackSelector gives server, tilesetUid and name
const AddTrack = (props) => {
  const datatypes = Object.keys(DATA_TYPES);
  console.log(props.track);

  return (
    <div>
      <div className="addtrack__datatype">
        <label>Data type:</label>
        <Field as="select" name={`${props.name}.datatype`}>
          <option value=""></option>
          {datatypes.map((datatype) => (
            <option key={datatype} value={datatype}>
              {datatype}
            </option>
          ))}
        </Field>
      </div>
      <div className="addtrack__selector">
        <label>Dataset:</label>
        <Field
          name={`${props.name}`}
          component={TrackSelectComponent}
          datatype={props.track.datatype}
          assemblyName={props.assembly.assemblyName}
          trackSourceServers={props.trackSourceServers}
        />
      </div>
      <div className="addtrack__tracktype">
        <label>Track type:</label>
        <Field
          name={`${props.name}.tracktype`}
          datatype={props.track.datatype}
          component={TracktypeSelectComponent}
        />
      </div>
      <div className="addtrack__positions">
        <label>Track positions:</label>
        <TrackPositionsComponent
          name={`${props.name}.positions`}
          orientation={findTrackOrientation(props.track.tracktype)}
        />
      </div>
    </div>
  );
};

export default AddTrack;
