import React from "react";
import { Field } from "formik";

const FormItem = (props) => {
  const { type, label, name } = props;
  let field = <Field name={name} />;
  if (type === "number") {
    field = <Field name={name} type="number" />;
  } else if (type === "boolean") {
    field = <Field name={name} type="checkbox" />;
  }

  return (
    <>
      <label>{label}</label>
      {field}
    </>
  );
};

export default FormItem;
