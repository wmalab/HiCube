import React, { useMemo } from "react";
import { Formik, Form, useField } from "formik";
import Collapsible from "../UI/Collapsible";
import Option from "../UI/Option";
import ColorOption from "../UI/ColorOption";
import FontSizeOption from "../UI/FontSizeOption";
import FontWeightOption from "../UI/FontWeightOption";
// import GenomePositionInput from "../UI/GenomePositionInput";
import useChromInfo from "../../hooks/use-chrominfo";
import classes from "./OverlayListItem.module.css";

const GenomePositionInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <div>
      <div className={classes.position}>
        <label>{label}</label>
        <input {...field} {...props} />
      </div>
      {meta.touched && meta.error && (
        <p className={classes.error}>{meta.error}</p>
      )}
    </div>
  );
};

const OverlayListItem = (props) => {
  const { uid, extent, score, options, onSubmit } = props;
  // validate genome location
  // X axis or Y axis should only be on one chromosome
  // convert genome position string back to abs position when submit
  const {
    validateGenomePositionOnSameChrom,
    getGenomePosition,
    toGenomePositionString,
  } = useChromInfo(props.genomeAssembly.chromInfoPath);

  const initialXDomain = useMemo(() => {
    if (!extent || extent.length < 2) {
      return "";
    }
    return toGenomePositionString(extent.slice(0, 2));
  }, [extent, toGenomePositionString]);

  const initialYDomain = useMemo(() => {
    if (!extent || extent.length < 4) {
      return "";
    }
    return toGenomePositionString(extent.slice(2, 4));
  }, [extent, toGenomePositionString]);

  // BEWARE: toGenomePositionString depend on the chromInfo, use is async call
  // until the Promise is resolved, toGenomePositionString will return ""
  // we need enableReinitialize so once it loaded we reset the form

  return (
    <Formik
      enableReinitialize
      validateOnChange={false}
      initialValues={{
        initialXDomain: initialXDomain,
        initialYDomain: initialYDomain,
        score: score,
        options: options,
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          let newExtent = [];
          if (values.initialXDomain) {
            newExtent = getGenomePosition(values.initialXDomain);
          }
          if (values.initialYDomain) {
            newExtent = [
              ...newExtent,
              ...getGenomePosition(values.initialYDomain),
            ];
          }
          // if score is string convert to float or null
          let newScore = values.score;
          if (typeof newScore === "string") {
            newScore = parseFloat(newScore);
            if (Number.isNaN(newScore)) {
              newScore = null;
            }
          }
          onSubmit(uid, newExtent, newScore, values.options);
          setSubmitting(false);
        }, 400);
      }}
    >
      {({ values }) => (
        <Form>
          <Collapsible title="Genome Positions">
            <GenomePositionInput
              label="X Axis"
              name="initialXDomain"
              validate={validateGenomePositionOnSameChrom}
            />
            {extent && extent.length >= 4 && (
              <GenomePositionInput
                label="Y Axis"
                name="initialYDomain"
                validate={validateGenomePositionOnSameChrom}
              />
            )}
          </Collapsible>
          <Collapsible title="Additional Fields">
            <Option label="Score" name="score" />
          </Collapsible>
          <Collapsible title="2D Options">
            <ColorOption label="Fill Color" name="options.higlass.fill" />
            <Option
              label="Fill Opacity"
              name="options.higlass.fillOpacity"
              type="number"
              min="0"
              max="1"
              step="0.1"
            />
            <ColorOption label="Stroke Color" name="options.higlass.stroke" />
            <Option
              label="Stroke Opacity"
              name="options.higlass.strokeOpacity"
              type="number"
              min="0"
              max="1"
              step="0.1"
            />
            <Option
              label="Stroke Width"
              name="options.higlass.strokeWidth"
              type="number"
              min="0"
              max="10"
              step="1"
            />
          </Collapsible>
          <Collapsible title="3D Options">
            <Collapsible title="Line">
              <Option
                label="Draw Line"
                name="options.threed.drawLine"
                type="checkbox"
              />
              <ColorOption
                label="Color"
                name="options.threed.lineColor"
                asScore
              />
              <Option
                label="Width"
                name="options.threed.lineWidth"
                type="number"
                min="0"
                max="20"
                step="1"
              />
            </Collapsible>
            <Collapsible title="Anchor 1">
              <Option
                label="Draw Anchor 1"
                name="options.threed.drawAnchor1"
                type="checkbox"
              />
              <ColorOption
                label="Color"
                name="options.threed.anchor1Color"
                asScore
              />
              <Option
                label="Radius"
                name="options.threed.anchor1Radius"
                type="number"
                min="1"
                max="5"
                step="1"
              />
              <Option label="Label" name="options.threed.anchor1Label" />
              <FontSizeOption
                label="Label Font Size"
                name="options.threed.anchor1LabelSize"
              />
              <ColorOption
                label="Label Color"
                name="options.threed.anchor1LabelColor"
              />
              <FontWeightOption
                label="Label Font Weight"
                name="options.threed.anchor1LabelWeight"
              />
            </Collapsible>
            <Collapsible title="Anchor 2">
              <Option
                label="Draw Anchor 2"
                name="options.threed.drawAnchor2"
                type="checkbox"
              />
              <ColorOption
                label="Color"
                name="options.threed.anchor2Color"
                asScore
              />
              <Option
                label="Radius"
                name="options.threed.anchor2Radius"
                type="number"
                min="1"
                max="5"
                step="1"
              />
              <Option label="Label" name="options.threed.anchor2Label" />
              <FontSizeOption
                label="Label Font Size"
                name="options.threed.anchor2LabelSize"
              />
              <ColorOption
                label="Label Color"
                name="options.threed.anchor2LabelColor"
              />
              <FontWeightOption
                label="Label Font Weight"
                name="options.threed.anchor2LabelWeight"
              />
            </Collapsible>
          </Collapsible>
          <div className={classes.action}>
            <button type="submit">Update</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default OverlayListItem;
