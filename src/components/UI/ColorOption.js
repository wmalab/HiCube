import React from "react";
import { Field } from "formik";
import { AVAILABLE_COLORS } from "../../configs/options-info";
import classes from "./ColorOption.module.css";

const ColorOption = (props) => {
  const colorKeys = Object.keys(AVAILABLE_COLORS);

  return (
    <div className={classes.option}>
      <label>{props.label}</label>
      <Field name={props.name} as="select">
        {props.asScore && <option value="score">* By Score *</option>}
        {colorKeys.map((key) => (
          <option key={key} value={AVAILABLE_COLORS[key].value}>
            {AVAILABLE_COLORS[key].name}
          </option>
        ))}
      </Field>
    </div>
  );
};

export default ColorOption;
