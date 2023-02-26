import React, { useContext } from "react";
import ConfigContext from "../../store/config-context";
import { Formik, Form, Field } from "formik";
import Collapsible from "../UI/Collapsible";
import classes from "./SizeAdjust.module.css";

// adjust higlass width and 3d width and height

// const validate = (value) => {
//   let error;
//   if (!value) {
//     error = "Must not be empty";
//   } else if (value < 150) {
//     error = "Cannot be less than 150px";
//   } else if (value > 1000) {
//     error = "Cannot be larger than 1000px";
//   }
//   return error;
// };

const validate = (value, cumValue) => {
  if (!value) {
    return "value cannot be empty";
  }
  if (value - cumValue < 200) {
    return `value cannot be smaller than ${cumValue + 200}`;
  }
  if (value > 1000) {
    return "value cannot be larger than 1000";
  }
  return null;
};

const SizeAdjust = (props) => {
  const ctx = useContext(ConfigContext);

  const validateForm = (values) => {
    const error = {};
    const e = { higlass: {}, threed: {} };
    e.higlass.width = validate(values.higlass.width, ctx.getViewSize(0));
    e.higlass.height = [];
    e.higlass.height.push(
      validate(values.higlass.height[0], ctx.getViewSize(1, 0))
    );
    if (props.hasZoomView) {
      e.higlass.height.push(
        validate(values.higlass.height[1], ctx.getViewSize(1, 1))
      );
    }
    e.threed.width = validate(values.threed.width, 0);
    e.threed.height = [];
    e.threed.height.push(validate(values.threed.height[0], 0));
    if (props.hasZoomView) {
      e.threed.height.push(validate(values.threed.height[1], 0));
    }
    if (e.higlass.width) {
      error.higlass = {};
      error.higlass.width = e.higlass.width;
    }
    if (e.higlass.height && e.higlass.height.some((el) => el !== null)) {
      if (!error.higlass) {
        error.higlass = {};
      }
      error.higlass.height = e.higlass.height;
    }
    if (e.threed.width) {
      error.threed = {};
      error.threed.width = e.threed.width;
    }
    if (e.threed.height && e.threed.height.some((el) => el !== null)) {
      if (!error.threed) {
        error.threed = {};
      }
      error.threed.height = e.threed.height;
    }
    return error;
  };
  // console.log('size', props);
  return (
    <Collapsible title="Panel Size" defaultCollapsed>
      <Formik
        enableReinitialize
        validate={validateForm}
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
                <Field name="higlass.width" type="number" />
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
              {errors.higlass &&
                errors.higlass.height &&
                errors.higlass.height[0] && (
                  <p className={classes.error}>{errors.higlass.height[0]}</p>
                )}
              {props.hasZoomView && (
                <div className={classes.option}>
                  <label>Zoom Height</label>
                  <Field name="higlass.height[1]" type="number" />
                  <span className={classes.unit}>px</span>
                </div>
              )}
              {props.hasZoomView &&
                errors.higlass &&
                errors.higlass.height &&
                errors.higlass.height.length > 1 &&
                errors.higlass.height[1] && (
                  <p className={classes.error}>{errors.higlass.height[1]}</p>
                )}
            </div>
            {props.hasThreedView && (
              <div>
                <p className={classes.title}>3D Panel Size</p>
                <div className={classes.option}>
                  <label>Width</label>
                  <Field name="threed.width" type="number" />
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
                  <Field name="threed.height[0]" type="number" />
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
                {props.hasZoomView &&
                  errors.threed &&
                  errors.threed.height &&
                  errors.threed.height.length > 1 &&
                  errors.threed.height[1] && (
                    <p className={classes.error}>{errors.threed.height[1]}</p>
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
