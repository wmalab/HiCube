import React from "react";
import { Formik, Field, Form } from "formik";

const OverlayItem = (props) => {
  const { uid, extent, options, onSubmit } = props;

  return (
    <Formik
      initialValues={{
        options: options,
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          onSubmit(uid, values.options);
          setSubmitting(false);
        }, 400);
      }}
    >
      {({ values }) => (
        <Form>
          <div>
            <h4>Genomic locations:</h4>
            <ul>
              <li>{`${extent[0]}-${extent[1]}`}</li>
              {extent.length > 2 && <li>{`${extent[2]}-${extent[3]}`}</li>}
            </ul>
          </div>
          <div>
            <h4>1D/2D options:</h4>
            <div>
              <label>fill color:</label>
              <Field name="options.higlass.fill" />
            </div>
            <div>
              <label>fill opacity:</label>
              <Field name="options.higlass.fillOpacity" type="number" />
            </div>
            <div>
              <label>stroke color:</label>
              <Field name="options.higlass.stroke" />
            </div>
            <div>
              <label>stroke opacity:</label>
              <Field name="options.higlass.strokeOpacity" type="number" />
            </div>
            <div>
              <label>stroke width:</label>
              <Field name="options.higlass.strokeWidth" type="number" />
            </div>
          </div>
          <div>
            <h4>3D options:</h4>
            <div>
              <label>line color:</label>
              <Field name="options.threed.lineColor" />
            </div>
            <div>
              <label>line width:</label>
              <Field name="options.threed.lineWidth" type="number" />
            </div>
            <div>
              <label>draw line:</label>
              <Field name="options.threed.drawLine" type="checkbox" />
            </div>
            <div>
              <label>draw anchor 1:</label>
              <Field name="options.threed.drawAnchor1" type="checkbox" />
            </div>
            <div>
              <label>anchor 1 color:</label>
              <Field name="options.threed.anchor1Color" />
            </div>
            <div>
              <label>anchor 1 radius:</label>
              <Field name="options.threed.anchor1Radius" type="number" />
            </div>
            <div>
              <label>draw anchor 2:</label>
              <Field name="options.threed.drawAnchor2" type="checkbox" />
            </div>
            <div>
              <label>anchor 2 color:</label>
              <Field name="options.threed.anchor2Color" />
            </div>
            <div>
              <label>anchor 2 radius:</label>
              <Field name="options.threed.anchor2Radius" type="number" />
            </div>
          </div>
          <div>
            <button type="submit">Update</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

const OverlayList = (props) => {
  return (
    <ul>
      {props.overlays.map((overlay) => {
        return (
          <OverlayItem
            key={overlay.uid}
            uid={overlay.uid}
            extent={overlay.extent}
            options={overlay.options}
            onSubmit={props.onUpdateOverlay}
          />
          // <li key={overlay.uid}>
          //   <span>{`${overlay.extent[0]}-${overlay.extent[1]}`}</span>
          //   {overlay.extent.length > 2 && (
          //     <span>{`, ${overlay.extent[2]}-${overlay.extent[3]}`}</span>
          //   )}
          //   <button onClick={props.onRemoveOverlay.bind(null, overlay.uid)}>
          //     <ion-icon name="trash-outline"></ion-icon>
          //   </button>
          // </li>
        );
      })}
    </ul>
  );
};

export default OverlayList;
