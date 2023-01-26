import React from "react";
import { Formik, Form, Field } from "formik";
import Collapsible from "../UI/Collapsible";
import classes from "./SizeAdjust.module.css";

// adjust higlass width and 3d width and height

const validate = (value) => {
  let error;
  if (!value) {
    error = "Must not be empty";
  } else if (value < 150) {
    error = "Cannot be less than 150px";
  } else if (value > 1000) {
    error = "Cannot be larger than 1000px";
  }
  return error;
};

const SizeAdjust = (props) => {
  console.log(props);
  return (
    <Collapsible title="Panel Size" defaultCollapsed>
      <Formik
        enableReinitialize
        initialValues={{
          higlass: {
            width: props.panelSizes.higlass.width,
            height: props.panelSizes.higlass.height,
          },
          threed: {
            width: props.panelSizes.threed.width,
            height: props.panelSizes.threed.height,
          },
          // width2d: props.panelSizes.width2d,
          // width3d: props.panelSizes.width3d,
          // height3d: props.panelSizes.height3d,
        }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            props.onSizeChange(values);
            setSubmitting(false);
          }, 400);
        }}
      >
        {({ values, errors, touched }) => (
          <Form>
            <div>
              <p className={classes.title}>2D Panel Size</p>
              <div className={classes.option}>
                <label>Width</label>
                <Field name="higlass.width" type="number" validate={validate} />
                <span className={classes.unit}>px</span>
              </div>
              {errors.higlass &&
                errors.higlass.width &&
                touched.higlass &&
                touched.higlass.width && (
                  <p className={classes.error}>{errors.higlass.width}</p>
                )}
              <div className={classes.option}>
                <label>Base Height</label>
                <Field name="higlass.height[0]" type="number" />
                <span className={classes.unit}>px</span>
              </div>
              {props.hasZoomView && (
                <div className={classes.option}>
                  <label>Zoom Height</label>
                  <Field name="higlass.height[1]" type="number" />
                  <span className={classes.unit}>px</span>
                </div>
              )}
            </div>
            {props.hasThreedView && (
              <div>
                <p className={classes.title}>3D Panel Size</p>
                <div className={classes.option}>
                  <label>Width</label>
                  <Field
                    name="threed.width"
                    type="number"
                    validate={validate}
                  />
                  <span className={classes.unit}>px</span>
                </div>
                {errors.threed &&
                  errors.threed.width &&
                  touched.threed &&
                  touched.threed.width && (
                    <p className={classes.error}>{errors.threed.width}</p>
                  )}
                <div className={classes.option}>
                  <label>Base Height</label>
                  <Field
                    name="threed.height[0]"
                    type="number"
                    validate={validate}
                  />
                  <span className={classes.unit}>px</span>
                </div>
                {errors.threed &&
                  errors.threed.height &&
                  errors.threed.height[0] &&
                  touched.threed &&
                  touched.threed.height &&
                  touched.threed.height[0] && (
                    <p className={classes.error}>{errors.threed.height[0]}</p>
                  )}
                {props.hasZoomView && (
                  <div className={classes.option}>
                    <label>Zoom Height</label>
                    <Field name="threed.height[1]" type="number" />
                    <span className={classes.unit}>px</span>
                  </div>
                )}
              </div>
            )}
            <div className={classes.action}>
              <button type="submit">Update</button>
            </div>
          </Form>
        )}
      </Formik>
    </Collapsible>
  );
};

export default SizeAdjust;
