import React from "react";
import { Formik, Field, FieldArray, Form, useFormikContext } from "formik";
import AddTrack from "../UI/AddTrack";
import TrackSelector from "../UI/TrackSelector";
import FileUploader from "../UI/FileUploader";
import Collapsible from "../UI/Collapsible";
import useChromInfo from "../../hooks/use-chrominfo";
import classes from "./AddCaseForm.module.css";

const GenomePositionInput = (props) => {
  const { errors, touched } = useFormikContext();
  return (
    <Collapsible title="Genome Positions" className={classes.enterfield}>
      <div>
        <label>X axis:</label>
        <Field
          name="initialXDomain"
          placeholder="Enter position..."
          validate={props.validate.bind(null, true)}
        />
        {errors.initialXDomain && touched.initialXDomain && (
          <p className={classes.error}>{errors.initialXDomain}</p>
        )}
      </div>
      <div>
        <label>Y axis:</label>
        <Field
          name="initialYDomain"
          placeholder="Enter position..."
          validate={props.validate.bind(null, false)}
        />
        {errors.initialYDomain && touched.initialYDomain && (
          <p className={classes.error}>{errors.initialYDomain}</p>
        )}
      </div>
      <div className={classes.example}>
        <p>
          Example: chr11:1500000-chr11:2400000, chr11:1500000-2400000, chr1,
          chr1-chr22
        </p>
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
      <TrackSelector
        label="Dataset"
        datatype="matrix"
        assembly={props.assemblyName}
        trackSourceServers={props.trackSourceServers}
        onDatasetChange={datasetChangeHandler}
      />
      {props.error && <p className={classes.error}>{props.error}</p>}
    </Collapsible>
  );
};

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
    if (track.datatype === "") {
      errors.tracks.push("Must choose a data type");
    } else if (track.tracktype === "") {
      errors.tracks.push("Must choose a track type");
    } else if (track.server === "" || track.tilesetUid === "") {
      errors.tracks.push("Must choose a dataset");
    } else if (Object.values(track.positions).every((val) => val === false)) {
      errors.tracks.push("Must choose at least one position");
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

const AddCaseForm = (props) => {
  const { genomeAssembly } = props;
  const { assemblyName, chromInfoPath } = genomeAssembly;
  // const chromInfo = useRef();

  const { validateGenomePosition, getGenomePosition, chroms } =
    useChromInfo(chromInfoPath);

  // useEffect(() => {
  //   ChromosomeInfo(chromInfoPath, (newChromInfo) => {
  //     chromInfo.current = newChromInfo;
  //   });
  // }, [chromInfoPath]);

  // TODO: allow variant format: chr1, chr1-chr5, etc.
  // TODO: refactor with GenomePositionBar as custom hook?
  // const positionTextToScale = (positionText) => {
  //   const [chromPos1, chromPos2] = positionText.split("-");
  //   const [chrom1, pos1] = chromPos1.split(":");
  //   const chromPos2splited = chromPos2.split(":");
  //   let chrom2 = chrom1;
  //   if (chromPos2splited.length > 1) {
  //     chrom2 = chromPos2splited.shift();
  //   }
  //   const pos2 = chromPos2splited[0];
  //   const scale1 = chromInfo.current.chrToAbs([chrom1, strToInt(pos1)]);
  //   const scale2 = chromInfo.current.chrToAbs([chrom2, strToInt(pos2)]);
  //   return [scale1, scale2];
  // };

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      validate={validate}
      initialValues={{
        initialXDomain: "",
        initialYDomain: "",
        chromInfoPath: chromInfoPath,
        centerHiC: {},
        threed: {
          fileObj: "",
          resolution: "",
          category: "",
        },
        tracks: [],
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          const { initialXDomain, initialYDomain } = values;
          props.onSubmit({
            ...values,
            initialXDomain: getGenomePosition(initialXDomain),
            initialYDomain: getGenomePosition(
              initialYDomain.trim() || initialXDomain
            ),
            chroms: chroms,
          });
          setSubmitting(false);
          props.onClose();
        }, 400);
      }}
    >
      {({ values, errors }) => (
        <Form>
          <GenomePositionInput validate={validateGenomePosition} />
          <Field
            name="centerHiC"
            component={MatrixSelectComponent}
            assemblyName={assemblyName}
            trackSourceServers={props.trackSourceServers}
            error={errors && errors.centerHiC}
          />
          <FileUploader
            name="threed"
            className={classes.enterfield}
            error={errors && errors.threed}
          />
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
                        {errors && errors.tracks && errors.tracks[index] && (
                          <p className={classes.error}>
                            {errors.tracks[index]}
                          </p>
                        )}
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
