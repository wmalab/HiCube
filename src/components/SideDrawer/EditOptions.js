import React, { useContext } from "react";
import { Formik, Field, FieldArray, Form, useField } from "formik";
import ConfigContext from "../../store/config-context";
import TRACKS_INFO_BY_TYPE from "../../configs/tracks-info-by-type";
import FormItem from "../UI/FormItem";

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
            {values.options &&
              values.options.length > 0 &&
              values.options.map((option, index) => (
                <div key={index}>
                  <FormItem
                    type={typeof option.value}
                    label={option.name}
                    name={`options.${index}.value`}
                  />
                </div>
              ))}
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
  return (
    <>
      <h4>{props.uid}</h4>
      {props.options &&
        props.options.length > 0 &&
        props.options.map((option, index) => (
          <div key={index}>
            <FormItem
              type={typeof option.value}
              label={option.name}
              name={`tracks.${props.index}.options.${index}.value`}
            />
            {/* <label>{option.name}</label>
            <Field name={`tracks.${props.index}.options.${index}.value`} /> */}
          </div>
        ))}
    </>
  );
};

const TrackForm = (props) => {
  return (
    <Formik
      initialValues={{
        tracks: props.tracks,
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
          <FieldArray name="tracks">
            {(arrayHelpers) => (
              <div>
                {values.tracks &&
                  values.tracks.length > 0 &&
                  values.tracks.map((track, index) => (
                    <div key={index}>
                      <TrackOptions
                        uid={track.uid}
                        options={track.options}
                        index={index}
                      />
                    </div>
                  ))}
              </div>
            )}
          </FieldArray>
          <div>
            <button type="submit">Apply</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

const TrackList = (props) => {
  const configCtx = useContext(ConfigContext);
  // configCtx.positionedTracks[];
  // TODO: convert 1d tracks to form options
  // how to deal with positions show/hide

  const allOptions = props.config.map((track) => {
    const { dataUid, type, positions } = track;
    const pos = Object.keys(positions);
    const trackUid = positions[pos[0]];
    const { options } = configCtx.positionedTracks[trackUid];
    return {
      uid: dataUid,
      options: getAvailableOptions(type).map((optionName) => ({
        name: optionName,
        value: options[optionName],
      })),
    };
  });

  const submitHandler = (values) => {
    const updatedTracks = [];
    for (let i = 0; i < values.tracks.length; i++) {
      const { positions } = props.config[i];
      for (const pos in positions) {
        updatedTracks.push({
          uid: positions[pos],
          options: values.tracks[i].options,
        });
      }
    }

    configCtx.updateTrackOptions(updatedTracks, [props.mainLocation]);
  };

  return (
    <div>
      <h3>1D Tracks</h3>
      <TrackForm tracks={allOptions} onSubmit={submitHandler} />
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
