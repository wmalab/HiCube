import React from "react";
import { Field } from "formik";
import classes from "./FontSizeOption.module.css";

const AVAILABLE_FONT_SIZES = [
  "10px",
  "11px",
  "12px",
  "13px",
  "14px",
  "15px",
  "16px",
  "17px",
  "18px",
  "19px",
  "20px",
];

const FontSizeOption = (props) => {
  return (
    <div className={classes.option}>
      <label>{props.label}</label>
      <Field name={props.name} as="select">
        {AVAILABLE_FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </Field>
    </div>
  );
};

export default FontSizeOption;
