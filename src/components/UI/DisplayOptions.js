import React, { useContext } from "react";
import ConfigContext from "../../store/config-context";
import DisplayOptionForm from "./DisplayOptionForm";
import Collapsible from "./Collapsible";
import TRACKS_INFO_BY_TYPE from "../../configs/tracks-info-by-type";
import OPTIONS_INFO from "../../configs/options-info";
import { camelCaseToTitleCase } from "../../utils";

const DisplayOptions = (props) => {
  const { trackUid, trackName, caseUid } = props;
  const ctx = useContext(ConfigContext);
  const track = ctx.positionedTracks[trackUid];
  const optionItems = {};
  const options = [];

  for (const option of TRACKS_INFO_BY_TYPE[track.type].availableOptions) {
    let value = track.options[option];
    // set undefined (which is not set) and null (actual value)
    // to string, so they can be select normally
    // need to filter "undefined" and convert "null" to null
    // convert true and false to string
    // need to convert them back when submitting
    if (
      value === undefined ||
      value === null ||
      value === true ||
      value === false
    ) {
      value = String(value);
    }
    // convert colorRange to a string
    // also the available option value to a string
    // then split them back into an array when submit
    if (option === "colorRange") {
      value = value.join(":");
    }

    options.push({ name: option, value: value });

    // gather all available option values
    optionItems[option] = {};
    if (option in OPTIONS_INFO) {
      optionItems[option].label = OPTIONS_INFO[option].name;
      let availableValues = {};
      for (const key in OPTIONS_INFO[option].inlineOptions) {
        const inlineOption = OPTIONS_INFO[option].inlineOptions[key];
        let val = inlineOption.value;
        if (option === "colorRange") {
          val = val.join(":");
        }
        if (
          val === undefined ||
          val === null ||
          val === true ||
          val === false
        ) {
          val = String(val);
        }
        availableValues[key] = {
          name: inlineOption.name,
          value: val,
        };
      }
      // TODO: generate options if exists ------------------------
      if (OPTIONS_INFO[option].generateOptions) {
        const trackObj = ctx.hgcRefs.current[caseUid].api.getTrackObject(
          "aa",
          trackUid
        );
        const generatedOptions = OPTIONS_INFO[option].generateOptions(trackObj); // returned an array
        for (const generatedOption of generatedOptions) {
          availableValues[generatedOption.value] = {
            name: generatedOption.name,
            value: generatedOption.value,
          };
        }
        // maxZoom is ok but dataTransform throw error
        // availableValues['test'] = {name: 'test', value: "50000"};
      }
      // ---------------------------------------------------------

      optionItems[option].availableValues = availableValues;
    } else {
      optionItems[option].label = camelCaseToTitleCase(option);
    }
  }

  // what submited is an array of { name, value } options
  const submitHandler = (values) => {
    // filter "undefined" and convert "null" to null
    // and convert colorRange back to array
    // beawre: shallow copy of { name, value }
    const filteredOptions = [];
    for (const option of values.options) {
      if (option.value !== "undefined") {
        let newValue = option.value;
        if (option.value === "null") {
          newValue = null;
        }
        if (option.value === "true") {
          newValue = true;
        }
        if (option.value === "false") {
          newValue = false;
        }
        if (option.name === "colorRange") {
          newValue = option.value.split(":");
        }
        filteredOptions.push({ name: option.name, value: newValue });
      }
    }

    console.log(filteredOptions);
    console.log(props.mainLocation);
    console.log(props.zoomLocation);

    const updatedTracks = [{ uid: trackUid, options: filteredOptions }];
    // if a track has more than one position, need to update them all
    if (props.auxTrackUids && props.auxTrackUids.length > 0) {
      for (const auxUid of props.auxTrackUids) {
        updatedTracks.push({ uid: auxUid, options: filteredOptions });
      }
    }

    ctx.updateTrackOptions(updatedTracks, [
      props.mainLocation,
      props.zoomLocation,
    ]);
  };

  return (
    <Collapsible title={trackName} defaultCollapsed>
      <DisplayOptionForm
        options={options}
        optionItems={optionItems}
        onSubmit={submitHandler}
      />
    </Collapsible>
  );
};

export default DisplayOptions;
