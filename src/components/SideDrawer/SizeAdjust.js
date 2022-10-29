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
  return (
    <Collapsible title="Panel Size" defaultCollapsed>
      <Formik
        enableReinitialize
        initialValues={{
          width2d: props.panelSizes.width2d,
          width3d: props.panelSizes.width3d,
          height3d: props.panelSizes.height3d,
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
                <label>Width: </label>
                <Field name="width2d" type="number" validate={validate} />
                <span className={classes.unit}>px</span>
              </div>
              {errors.width2d && touched.width2d && (
                <p className={classes.error}>{errors.width2d}</p>
              )}
            </div>
            <div>
              <p className={classes.title}>3D Panel Size</p>
              <div className={classes.option}>
                <label>Width: </label>
                <Field name="width3d" type="number" validate={validate} />
                <span className={classes.unit}>px</span>
              </div>
              {errors.width3d && touched.width3d && (
                <p className={classes.error}>{errors.width3d}</p>
              )}
              <div className={classes.option}>
                <label>Height: </label>
                <Field name="height3d" type="number" validate={validate} />
                <span className={classes.unit}>px</span>
              </div>
              {errors.height3d && touched.height3d && (
                <p className={classes.error}>{errors.height3d}</p>
              )}
              <div className={classes.action}>
                <button type="submit">Update</button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Collapsible>
  );
};

export default SizeAdjust;
