import React, { useContext } from "react";
import ConfigContext from "../../store/config-context";
import Collapsible from "../UI/Collapsible";
import DisplayOptions from "../UI/DisplayOptions";
import TrackOptionList from "../UI/TrackOptionList";

// TODO: group by cases, then the main heatmap options
// then list of other tracks
// TODO: manager configs in context
// TODO: use index to manager configs and re-generate
// viewconfig once index changed

/*
const camelcase2label = (str) => {
  return str.replace(/([A-Z])/g, " $1").toLowerCase();
};
*/

/*
const getAvailableOptions = (trackType) =>
  TRACKS_INFO_BY_TYPE[trackType].availableOptions;
*/

/*  
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
              values.options.map((option, index) => {
                let type = "text";
                if (typeof option.value === "number") {
                  type = "number";
                } else if (typeof option.value === "boolean") {
                  type = "checkbox";
                }
                return (
                  <Option
                    key={index}
                    label={camelcase2label(option.name)}
                    name={`options.${index}.value`}
                    type={type}
                  />
                );
              })}
          </div>
          <div>
            <button type="submit">Apply</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
*/

/*
const TrackOptions = (props) => {
  return (
    <>
      {props.options &&
        props.options.length > 0 &&
        props.options.map((option, index) => {
          let type = "text";
          if (typeof option.value === "number") {
            type = "number";
          } else if (typeof option.value === "boolean") {
            type = "checkbox";
          }
          return (
            <Option
              key={index}
              label={camelcase2label(option.name)}
              name={`tracks.${props.index}.options.${index}.value`}
              type={type}
            />
          );
        })}
    </>
  );
};
*/

/*
const TrackForm = (props) => {
  console.log(props.tracks);

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
                    <Collapsible
                      key={index}
                      title={track.name}
                      defaultCollapsed={true}
                    >
                      <TrackOptions
                        uid={track.uid}
                        options={track.options}
                        index={index}
                      />
                    </Collapsible>
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
*/

/*
const TrackList = (props) => {
  const configCtx = useContext(ConfigContext);
  // configCtx.positionedTracks[];
  // TODO: convert 1d tracks to form options
  // how to deal with positions show/hide

  console.log(props.config);

  const allOptions = props.config.map((track) => {
    const { dataUid, type, positions } = track;
    const pos = Object.keys(positions);
    const trackUid = positions[pos[0]];
    const { options } = configCtx.positionedTracks[trackUid];
    return {
      uid: dataUid,
      name: track.name,
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
    <Collapsible title="Additional Tracks" defaultCollapsed={true}>
      <TrackForm tracks={allOptions} onSubmit={submitHandler} />
    </Collapsible>
  );
};
*/

/*
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
    <Collapsible title="Hi-C Track" defaultCollapsed>
      <OptionsForm options={allOptions} onSubmit={submitHandler} />
    </Collapsible>
  );
};
*/

const CaseOptions = (props) => {
  // TODO: add 3D options
  return (
    <div>
      {/* <HicOptions
        config={props.views[0]["2d"]}
        mainLocation={props.mainLocation}
        zoomLocation={props.zoomLocation}
      /> */}
      <DisplayOptions
        trackUid={props.views[0]["2d"].contents[0].uid}
        trackName={props.views[0]["2d"].contents[0].name}
        mainLocation={props.mainLocation}
        zoomLocation={props.zoomLocation}
      />
      <TrackOptionList 
        config={props.views[0]["1d"]}
        mainLocation={props.mainLocation}
        zoomLocation={props.zoomLocation}
      />
      {/* <TrackList
        config={props.views[0]["1d"]}
        mainLocation={props.mainLocation}
        zoomLocation={props.zoomLocation}
      /> */}
    </div>
  );
};

const EditOptions = (props) => {
  const configCtx = useContext(ConfigContext);

  return (
    <div>
      {configCtx.cases.map((caseConfig, index) => (
        <Collapsible key={`Case #${index + 1}`} title={`Case #${index + 1}`}>
          <CaseOptions
            key={caseConfig.uid}
            views={caseConfig.views}
            mainLocation={props.mainLocation}
            zoomLocation={props.zoomLocation}
          />
        </Collapsible>
      ))}
    </div>
  );
};

export default EditOptions;
