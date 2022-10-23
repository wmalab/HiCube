import React from "react";
import { Field } from "formik";
import classes from "./DisplayOption.module.css";

const DisplayOption = (props) => {
  let availValueKeys = [];
  if (props.values) {
    availValueKeys = Object.keys(props.values);
  }

  return (
    <div className={classes.option}>
      <label>{props.label}</label>
      <Field name={props.name} as="select">
        {props.value === "undefined" && (
          <option value={"undefined"} disabled>
            undefined
          </option>
        )}
        {availValueKeys.map((key) => (
          <option key={key} value={props.values[key].value}>
            {props.values[key].name}
          </option>
        ))}
      </Field>
    </div>
  );
};

export default DisplayOption;
