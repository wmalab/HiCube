import React from "react";
import { Formik, Form } from "formik";
import PairedTrackSelector from "../UI/PairedTrackSelector";
import FileUploader from "../UI/FileUploader";
import useChromInfo from "../../hooks/use-chrominfo";
import classes from "./PairedCaseForm.module.css";

const validate = (values) => {
  const errors = {};
  if (!values.centerHiC.tilesetUid) {
    errors.centerHiC = "Must choose a Hi-C track";
  }
  // if (values.threed.fileObj === "") {
  //   errors.threed = "Must choose a .g3d file";
  // }
  errors.tracks = [];
  for (const track of values.tracks) {
    if (!track.tilesetUid) {
      errors.tracks.push("Must choose a paired track");
    } else {
      errors.tracks.push(undefined);
    }
  }
  if (
    errors.tracks.every((val) => val === undefined) &&
    errors.threed === undefined &&
    errors.centerHiC === undefined
  ) {
    return undefined;
  }
  return errors;
};

const PairedCaseForm = (props) => {
  const { trackSourceServers, centerHiC, tracks } = props;
  const { assemblyName, chromInfoPath } = props.genomeAssembly;

  const { chroms } = useChromInfo(chromInfoPath);

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      validate={validate}
      initialValues={{
        centerHiC: {
          // only one center hic dataset
          datatype: centerHiC.datatype,
          tracktype: centerHiC.type,
          server: "",
          tilesetUid: "",
          name: "",
        },
        threed: {
          // only one threed dataset
          fileObj: "",
          resolution: "",
          category: "",
        },
        tracks: tracks.map((track) => ({
          datatype: track.datatype,
          tracktype: track.type,
          server: "",
          tilesetUid: "",
          pairDataUid: track.dataUid, // dataUid for a dataset, trackUid for positioned track
          name: "",
          positions: {
            left: "left" in track.positions,
            right: "right" in track.positions,
            bottom: "bottom" in track.positions,
            top: "top" in track.positions,
            center: "center" in track.positions,
          },
        })),
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          props.onSubmit({
            ...values,
            initialXDomain: props.mainLocation.xDomain,
            initialYDomain: props.mainLocation.yDomain,
            zoomXDomain: props.zoomLocation.xDomain,
            zoomYDomain: props.zoomLocation.yDomain,
            chromInfoPath,
            chroms: chroms,
          });
          setSubmitting(false);
          props.onClose();
        }, 400);
      }}
    >
      {({ values, errors }) => (
        <Form>
          <PairedTrackSelector
            name="centerHiC"
            pairTrack={centerHiC}
            datatype={values.centerHiC.datatype}
            assemblyName={assemblyName}
            trackSourceServers={trackSourceServers}
            error={errors && errors.centerHiC}
          />
          <FileUploader
            name="threed"
            className={classes.enterfield}
            error={errors && errors.threed}
          />
          {values.tracks.map((track, index) => (
            <PairedTrackSelector
              key={index}
              name={`tracks[${index}]`}
              pairTrack={tracks[index]}
              datatype={track.datatype}
              assemblyName={assemblyName}
              trackSourceServers={trackSourceServers}
              error={errors && errors.tracks && errors.tracks[index]}
            />
          ))}
          <div className={classes.footer}>
            <div>
              <button type="submit" className={classes.submit}>
                Add A Paired Case
              </button>
            </div>
            <div>
              <button
                type="button"
                className={classes.cancel}
                onClick={props.onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PairedCaseForm;
