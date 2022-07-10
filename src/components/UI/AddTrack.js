import React, { useState, useEffect } from "react";
import { Field, useField, useFormikContext } from "formik";
import TrackSelector from "./TrackSelector";
import {
  findTracktypes,
  findTrackOrientation,
  availDatatypes,
} from "../../configs/track-orientation";

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
  const datatypes = availDatatypes();
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
