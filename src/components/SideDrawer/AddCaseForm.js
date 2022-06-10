import React from "react";
import { Formik, Field, FieldArray, Form } from "formik";

const AddCaseForm = (props) => {
  return (
    <Formik
      initialValues={{
        initialXDomainStart: 1,
        initialXDomainEnd: 3200000000,
        chromInfoPath:
          "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
        heatmap: {
          server: props.trackSourceServers[0].url,
          tilesetUid: "CQMd6V_cRw6iCI_-Unl3PQ",
        },
        tracks: [
          {
            type: "gene-annotations",
            tilesetUid: "OHJakQICQD6gTD7skx4EWA",
            server: props.trackSourceServers[0].url,
            positions: ["top", "left"],
          },
          {
            type: "chromosome-labels",
            chromInfoPath:
              "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
            positions: ["top", "left"],
          },
        ],
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          props.onSubmit(values);
          setSubmitting(false);
          props.onClose();
        }, 400);
      }}
    >
      {({ values }) => (
        <Form>
          <div>
            <label>Server:</label>
            <Field as="select" name="heatmap.server">
              {props.trackSourceServers.map((server) => (
                <option value={server.url} key={server.uuid}>
                  {server.url}
                </option>
              ))}
            </Field>
          </div>
          <div>
            <label>Chromosome sizes URL:</label>
            <Field type="text" name="chromInfoPath" />
          </div>
          <div>
            <label>Heatmap tileset UID:</label>
            <Field type="text" name="heatmap.tilesetUid" />
          </div>
          <div>
            <label>Initial X domain start:</label>
            <Field type="number" name="initialXDomainStart" />
            <label>end:</label>
            <Field type="number" name="initialXDomainEnd" />
          </div>
          <FieldArray name="tracks">
            {(arrayHelpers) => (
              <div>
                {values.tracks &&
                  values.tracks.length > 0 &&
                  values.tracks.map((track, index) => (
                    <div key={index}>
                      <div>
                        <label>Track type:</label>
                        <Field as="select" name={`tracks.${index}.type`}>
                          <option value="gene-annotations">
                            gene-annotations
                          </option>
                          <option value="chromosome-labels">
                            chromosome-labels
                          </option>
                        </Field>
                      </div>
                      {track.type !== "chromosome-labels" && (
                        <div>
                          <label>Server:</label>
                          <Field as="select" name={`tracks.${index}.server`}>
                            {props.trackSourceServers.map((server) => (
                              <option value={server.url} key={server.uuid}>
                                {server.url}
                              </option>
                            ))}
                          </Field>
                        </div>
                      )}
                      {track.type !== "chromosome-labels" && (
                        <div>
                          <label>Track tileset UID:</label>
                          <Field
                            type="text"
                            name={`tracks.${index}.tilesetUid`}
                          />
                        </div>
                      )}
                      <div>
                        <label>Track positions:</label>
                        <div
                          role="group"
                          aria-labelledby={`tracks.${index}.positions.group`}
                        >
                          {["top", "bottom", "left", "right"].map(
                            (position) => (
                              <label key={position}>
                                <Field
                                  type="checkbox"
                                  name={`tracks.${index}.positions`}
                                  value={position}
                                />
                                {position}
                              </label>
                            )
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        <ion-icon name="trash-outline"></ion-icon>
                      </button>
                    </div>
                  ))}
                <button type="button" onClick={() => arrayHelpers.push({})}>
                  <span>
                    <ion-icon name="add-circle-outline"></ion-icon>
                  </span>
                  <span>New Track</span>
                </button>
              </div>
            )}
          </FieldArray>
          <div>
            <button type="button" onClick={props.onClose}>Cancel</button>
            <button type="submit">
              <span>
                <ion-icon name="add-circle-outline"></ion-icon>
              </span>
              <span>Case</span>
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddCaseForm;
