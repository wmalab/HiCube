import React from "react";
import { Formik, Form, Field } from "formik";
import Collapsible from "./Collapsible";
import classes from "./ThreedOptionForm.module.css";

function validateOpacity(value) {
  let error;
  if (value < 0) {
    error = "Opacity cannot be smaller than 0";
  } else if (value > 1) {
    error = "Opacity cannot be larger than 1";
  }
  return error;
}

const ThreedOptionForm = (props) => {
  return (
    <Formik
      enableReinitialize
      initialValues={{
        opacity: props.opacity,
        colormap: props.colormap,
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          props.onSubmit(values);
          setSubmitting(false);
        }, 400);
      }}
    >
      {({ values, errors, touched }) => (
        <Form>
          <div className={classes.option}>
            <label>Unvisualized Opacity</label>
            <Field name="opacity" type="number" validate={validateOpacity} />
          </div>
          {touched.opacity && errors.opacity && (
            <p className={classes.error}>{errors.opacity}</p>
          )}
          <Collapsible title="Chromosome Colormap">
            {Object.keys(values.colormap).map((chrom) => (
              <div className={classes.option} key={chrom}>
                <label>{chrom}</label>
                <span style={{ borderLeftColor: values.colormap[chrom] }}>
                  {values.colormap[chrom]}
                </span>
                <Field name={`colormap.${chrom}`} type="color" />
              </div>
            ))}
          </Collapsible>
          <div className={classes.action}>
            <button type="submit">Update</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ThreedOptionForm;
