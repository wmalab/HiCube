import React, { useContext } from "react";
import { Formik, Field, FieldArray, Form, useField } from "formik";
import ConfigContext from "../../store/config-context";
import TRACKS_INFO_BY_TYPE from "../../configs/tracks-info-by-type";

// TODO: group by cases, then the main heatmap options
// then list of other tracks
// TODO: manager configs in context
// TODO: use index to manager configs and re-generate
// viewconfig once index changed

const getAvailableOptions = (trackType) =>
  TRACKS_INFO_BY_TYPE[trackType].availableOptions;

const OptionsForm = (props) => {
  return (
    <Formik
      initialValues={{
        options: props.options,
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          props.onSubmit(values);
          setSubmitting(false);
        }, 400);
      }}
    >
      {({ values }) => (
        <Form>
          <div>
            <FieldArray name="options">
              {(arrayHelpers) => (
                <div>
                  {values.options &&
                    values.options.length > 0 &&
                    values.options.map((option, index) => (
                      <div key={index}>
                        <label>{option.name}</label>
                        <Field name={`options.${index}.value`} />
                      </div>
                    ))}
                </div>
              )}
            </FieldArray>
          </div>
          <div>
            <button type="submit">Apply</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

const TrackOptions = (props) => {
  return <div></div>;
};

const TrackList = (props) => {
  return (
    <div>
      <h3>1D Tracks</h3>
      <TrackOptions />
    </div>
  );
};

const HicOptions = (props) => {
  const hicUid = props.config.contents[0].uid;
  const configCtx = useContext(ConfigContext);
  const { server, type, tilesetUid, options } =
    configCtx.positionedTracks[hicUid];

  const allOptions = getAvailableOptions(type).map((optionName) => ({
    name: optionName,
    value: options[optionName],
  }));

  const submitHandler = (values) => {
    configCtx.updateTrackOptions(
      [{ uid: hicUid, options: values.options }],
      [props.mainLocation]
    );
  };

  return (
    <div>
      <h3>Hi-C Track</h3>
      <OptionsForm options={allOptions} onSubmit={submitHandler} />
    </div>
  );
};

const CaseOptions = (props) => {
  return (
    <div>
      <HicOptions
        config={props.views[0]["2d"]}
        mainLocation={props.mainLocation}
      />
      <TrackList
        config={props.views[0]["1d"]}
        mainLocation={props.mainLocation}
      />
    </div>
  );
};

const EditOptions = (props) => {
  const configCtx = useContext(ConfigContext);

  return (
    <div>
      <div>Edit Options</div>
      {configCtx.cases.map((caseConfig, index) => (
        <>
          <h2>{`Case ${index + 1}`}</h2>
          <CaseOptions
            key={caseConfig.uid}
            views={caseConfig.views}
            mainLocation={props.mainLocation}
          />
        </>
      ))}
    </div>
  );
};

export default EditOptions;
