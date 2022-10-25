import React from "react";
import { Formik, Form } from "formik";
import DisplayOption from "./DisplayOption";
import classes from "./DisplayOptionForm.module.css";

const DisplayOptionForm = (props) => {
  const { options, optionItems, onSubmit } = props;

  return (
    <Formik
      enableReinitialize
      initialValues={{
        options: options,
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          onSubmit(values);
          setSubmitting(false);
        }, 400);
      }}
    >
      {({ values }) => (
        <Form>
          <div>
            {values.options &&
              values.options.length > 0 &&
              values.options.map((option, index) => (
                <DisplayOption
                  key={option.name}
                  label={optionItems[option.name].label}
                  value={option.value}
                  name={`options.${index}.value`}
                  values={optionItems[option.name].availableValues}
                />
              ))}
          </div>
          <div className={classes.action}>
            <button type="submit">Update</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default DisplayOptionForm;
