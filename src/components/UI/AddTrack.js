import React, { useState, useEffect } from "react";
import { Field } from "formik";
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

const TrackSelectComponent = ({ field, form, ...props }) => {
  const datasetChangeHandler = (dataset) => {
    for (const key in dataset) {
      form.setFieldValue(`${field.name}.${key}`, dataset[key]);
    }
  };

  return (
    <div>
      <TrackSelector
        datatype={props.datatype}
        assembly={props.assemblyName}
        trackSourceServers={props.trackSourceServers}
        onDatasetChange={datasetChangeHandler}
      />
    </div>
  );
};

const findTracktypes = (datatype) => {
  return DATA_TYPES[datatype]["track-type"];
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
        <Field as="select" name={`${props.name}.tracktype`}>
          <option value=""></option>
          {props.track.datatype &&
            findTracktypes(props.track.datatype).map((tracktype) => (
              <option value={tracktype} key={tracktype}>
                {tracktype}
              </option>
            ))}
        </Field>
      </div>
      <div className="addtrack__positions">
        <label>Track positions:</label>
        <div role="group" aria-labelledby={`${props.name}.positions.group`}>
          <label>
            <Field
              type="checkbox"
              name={`${props.name}.positions`}
              value="top"
            />
            top
          </label>
          <label>
            <Field
              type="checkbox"
              name={`${props.name}.positions`}
              value="bottom"
            />
            bottom
          </label>
          <label>
            <Field
              type="checkbox"
              name={`${props.name}.positions`}
              value="left"
            />
            left
          </label>
          <label>
            <Field
              type="checkbox"
              name={`${props.name}.positions`}
              value="right"
            />
            right
          </label>
        </div>
      </div>
    </div>
  );
};

export default AddTrack;
