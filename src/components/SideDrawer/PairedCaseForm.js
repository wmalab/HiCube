import React from "react";
import { Formik, Form } from "formik";
import PairedTrackSelector from "../UI/PairedTrackSelector";
import FileUploader from "../UI/FileUploader";

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
          datatype: centerHiC.datatype,
          tracktype: centerHiC.type,
          server: "",
          tilesetUid: "",
          name: "",
        },
        threed: {
          fileObj: "",
          resolution: "",
          category: "",
        },
        tracks: tracks.map((track) => ({
          datatype: track.datatype,
          tracktype: track.type,
          server: "",
          tilesetUid: "",
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
            chromInfoPath,
          });
          setSubmitting(false);
          props.onClose();
        }, 400);
      }}
    >
      {({ values }) => (
        <Form>
          <div className="control-section">
            <PairedTrackSelector
              name="centerHiC"
              pairTrack={centerHiC}
              datatype={values.centerHiC.datatype}
              assemblyName={assemblyName}
              trackSourceServers={trackSourceServers}
            />
          </div>
          <FileUploader name="threed" />
          {values.tracks.map((track, index) => (
            <div className="control-section" key={index}>
              <PairedTrackSelector
                name={`tracks[${index}]`}
                pairTrack={tracks[index]}
                datatype={track.datatype}
                assemblyName={assemblyName}
                trackSourceServers={trackSourceServers}
              />
            </div>
          ))}
          <div>
            <button type="button" onClick={props.onClose}>
              Cancel
            </button>
            <button type="submit">
              <span>
                <ion-icon name="add-outline"></ion-icon>
              </span>
              <span>Paired Case</span>
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default PairedCaseForm;
