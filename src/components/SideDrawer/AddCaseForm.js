import React, { useRef, useEffect } from "react";
import { Formik, Field, FieldArray, Form } from "formik";
import AddTrack from "../UI/AddTrack";
import TrackSelector from "../UI/TrackSelector";
import FileUploader from "../UI/FileUploader";
import { strToInt } from "../../utils";
import { ChromosomeInfo } from "higlass";
import Collapsible from "../UI/Collapsible";
import classes from "./AddCaseForm.module.css";

const GenomePositionInput = () => {
  return (
    <Collapsible title="Genome Positions" className={classes.enterfield}>
      <div>
        <label>X axis:</label>
        <Field name="initialXDomain" placeholder="chr1:start-chr2:end" />
      </div>
      <div>
        <label>Y axis:</label>
        <Field name="initialYDomain" placeholder="chr1:start-chr2:end" />
      </div>
    </Collapsible>
  );
};

const MatrixSelectComponent = ({ field, form, ...props }) => {
  // for cooler filetype and matrix datatype only
  const datasetChangeHandler = (dataset) => {
    form.setFieldValue(field.name, {
      ...dataset,
      datatype: "matrix",
      tracktype: "heatmap",
      positions: {
        left: false,
        right: false,
        bottom: false,
        top: false,
        center: true,
      },
    });
  };

  return (
    <Collapsible title="Hi-C Dataset" className={classes.enterfield}>
      <label>Dataset:</label>
      <TrackSelector
        datatype="matrix"
        assembly={props.assemblyName}
        trackSourceServers={props.trackSourceServers}
        onDatasetChange={datasetChangeHandler}
      />
    </Collapsible>
  );
};

const AddCaseForm = (props) => {
  const { genomeAssembly } = props;
  const { assemblyName, chromInfoPath } = genomeAssembly;
  const chromInfo = useRef();

  useEffect(() => {
    ChromosomeInfo(chromInfoPath, (newChromInfo) => {
      chromInfo.current = newChromInfo;
    });
  }, [chromInfoPath]);

  // TODO: allow variant format: chr1, chr1-chr5, etc.
  // TODO: refactor with GenomePositionBar as custom hook?
  const positionTextToScale = (positionText) => {
    const [chromPos1, chromPos2] = positionText.split("-");
    const [chrom1, pos1] = chromPos1.split(":");
    const chromPos2splited = chromPos2.split(":");
    let chrom2 = chrom1;
    if (chromPos2splited.length > 1) {
      chrom2 = chromPos2splited.shift();
    }
    const pos2 = chromPos2splited[0];
    const scale1 = chromInfo.current.chrToAbs([chrom1, strToInt(pos1)]);
    const scale2 = chromInfo.current.chrToAbs([chrom2, strToInt(pos2)]);
    return [scale1, scale2];
  };

  return (
    <Formik
      initialValues={{
        initialXDomain: "",
        initialYDomain: "",
        // initialXDomainStart: 1,
        // initialXDomainEnd: 3200000000,
        chromInfoPath: chromInfoPath,
        centerHiC: {
          // server: props.trackSourceServers[0].url,
          // tilesetUid: "CQMd6V_cRw6iCI_-Unl3PQ",
        },
        threed: {
          fileObj: "",
          resolution: "",
          category: "",
        },
        tracks: [
          // {
          //   type: "gene-annotations",
          //   tilesetUid: "OHJakQICQD6gTD7skx4EWA",
          //   server: props.trackSourceServers[0].url,
          //   positions: ["top", "left"],
          // },
          // {
          //   type: "chromosome-labels",
          //   chromInfoPath: chromInfoPath,
          //   positions: ["top", "left"],
          // },
          // {
          //   datatype: "chromsizes",
          //   tracktype: "chromosome-labels",
          //   server: genomeAssembly.server,
          //   tilesetUid: genomeAssembly.tilesetUid,
          //   name: genomeAssembly.name,
          //   positions: ["top", "left"],
          // },
        ],
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          // props.onSubmit(values);
          const { initialXDomain, initialYDomain } = values;
          props.onSubmit({
            ...values,
            initialXDomain: positionTextToScale(initialXDomain),
            initialYDomain: positionTextToScale(
              initialYDomain.trim() || initialXDomain
            ),
            chroms: chromInfo.current.cumPositions.map((cumPos) => cumPos.chr),
          });
          setSubmitting(false);
          props.onClose();
        }, 400);
      }}
    >
      {({ values }) => (
        <Form>
          <GenomePositionInput />
          <Field
            name="centerHiC"
            component={MatrixSelectComponent}
            assemblyName={assemblyName}
            trackSourceServers={props.trackSourceServers}
          />
          <FileUploader name="threed" className={classes.enterfield} />
          <Collapsible title="Additional Datasets">
            <FieldArray name="tracks">
              {(arrayHelpers) => (
                <div>
                  {values.tracks &&
                    values.tracks.length > 0 &&
                    values.tracks.map((track, index) => (
                      <Collapsible
                        key={index}
                        title={`Track #${index + 1}`}
                        onDelete={() => arrayHelpers.remove(index)}
                      >
                        <AddTrack
                          name={`tracks[${index}]`}
                          track={track}
                          assembly={genomeAssembly}
                          trackSourceServers={props.trackSourceServers}
                        />
                      </Collapsible>
                    ))}
                  <div className={classes.action}>
                    <button
                      type="button"
                      onClick={() =>
                        arrayHelpers.push({
                          datatype: "",
                          tracktype: "",
                          server: "",
                          tilesetUid: "",
                          name: "",
                          positions: {
                            left: false,
                            right: false,
                            bottom: false,
                            top: false,
                            center: false,
                          },
                        })
                      }
                    >
                      Add A New Dataset
                    </button>
                  </div>
                </div>
              )}
            </FieldArray>
          </Collapsible>
          <div className={classes.footer}>
            <div>
              <button type="submit" className={classes.submit}>
                Add A New Case
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

export default AddCaseForm;
