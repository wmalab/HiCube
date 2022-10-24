import React from "react";
import { Field } from "formik";
import classes from "./FontWeightOption.module.css";

const AVAILABLE_WEIGHTS = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

const FontWeightOption = (props) => {
  return (
    <div className={classes.option}>
      <label>{props.label}</label>
      <Field name={props.name} as="select">
        {AVAILABLE_WEIGHTS.map((weight) => (
          <option key={weight} value={weight}>
            {weight}
          </option>
        ))}
      </Field>
    </div>
  );
};

export default FontWeightOption;
