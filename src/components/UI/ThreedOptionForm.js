import React from "react";
import { Formik, Form, Field } from "formik";
import Collapsible from "./Collapsible";
import classes from "./ThreedOptionForm.module.css";

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
      {({ values }) => (
        <Form>
          <div className={classes.option}>
            <label>Unvisualized Opacity</label>
            <Field name="opacity" />
          </div>
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
