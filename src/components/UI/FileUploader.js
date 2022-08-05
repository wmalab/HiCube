import React from "react";
import { useFormikContext } from "formik";

const FileUploader = (props) => {
  const { name } = props;
  const { setFieldValue } = useFormikContext();

  const fileUploadHandler = (event) => {
    setFieldValue(name, event.currentTarget.files[0]);
  };

  return <input name={name} type="file" onChange={fileUploadHandler} />;
};

export default FileUploader;
