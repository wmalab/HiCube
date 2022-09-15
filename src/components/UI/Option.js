import React from "react";
import { useField } from "formik";
import classes from "./Option.module.css";

const Option = ({label, ...props}) => {
  const [field, meta, helpers] = useField(props);

  return (
    <div className={classes.option}>
      <label>{label}</label>
      <input {...field} {...props} />
    </div>
  );
};

export default Option;