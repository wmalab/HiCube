import React from "react";
import { Formik, Form } from "formik";
import PairedTrackSelector from "../UI/PairedTrackSelector";
import FileUploader from "../UI/FileUploader";
import classes from "./PairedCaseForm.module.css";

const PairedCaseForm = (props) => {
  const {
    genomeAssembly: { assemblyName, chromInfoPath },
    mainLocation: { xDomain, yDomain },
    trackSourceServers,
    centerHiC,
    tracks,
  } = props;

  return (
    <Formik
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
            initialXDomain: xDomain,
            initialYDomain: yDomain,
            zoomXDomain: props.zoomLocation.xDomain,
            zoomYDomain: props.zoomLocation.yDomain,
            chromInfoPath,
          });
          setSubmitting(false);
          props.onClose();
        }, 400);
      }}
    >
      {({ values }) => (
        <Form>
          <PairedTrackSelector
            name="centerHiC"
            pairTrack={centerHiC}
            datatype={values.centerHiC.datatype}
            assemblyName={assemblyName}
            trackSourceServers={trackSourceServers}
          />
          <FileUploader name="threed" className={classes.enterfield} />
          {values.tracks.map((track, index) => (
            <PairedTrackSelector
              key={index}
              name={`tracks[${index}]`}
              pairTrack={tracks[index]}
              datatype={track.datatype}
              assemblyName={assemblyName}
              trackSourceServers={trackSourceServers}
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
