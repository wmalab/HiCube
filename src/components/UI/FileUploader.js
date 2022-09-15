import React, { useState } from "react";
import { useFormikContext, Field } from "formik";
import G3dFile from "../Three/g3djs/g3dFile";
import Collapsible from "./Collapsible";

// Upload g3d file and
// TODO: display meta information of resolutions and categories for selection
// TODO: set default resolution to be the maximum and default category to be the first one
const FileUploader = (props) => {
  const { name } = props;
  const { setFieldValue } = useFormikContext();
  const [resolutions, setResolutions] = useState([]);
  const [categories, setCategories] = useState([]);

  const fileUploadHandler = (event) => {
    const blob = event.currentTarget.files[0];
    const file = new G3dFile({ blob });
    file.readHeader().then(() => {
      setResolutions(file.meta.resolutions);
      setFieldValue(`${name}.resolution`, Math.max(...file.meta.resolutions));
      setCategories(file.meta.categories);
      setFieldValue(`${name}.category`, file.meta.categories[0]);
    });
    setFieldValue(`${name}.fileObj`, blob);
  };

  return (
    <Collapsible title="3D Genome Structure Model" className={props.className}>
      <input name={name} type="file" onChange={fileUploadHandler} />
      {resolutions.length > 0 && (
        <div>
          <label>Resolution:</label>
          <Field name={`${name}.resolution`} as="select">
            {resolutions.map((resolution) => (
              <option key={resolution} value={resolution}>
                {resolution}
              </option>
            ))}
          </Field>
        </div>
      )}
      {categories.length > 0 && (
        <div>
          <label>Category:</label>
          <Field name={`${name}.category`} as="select">
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Field>
        </div>
      )}
    </Collapsible>
  );
};

export default FileUploader;
