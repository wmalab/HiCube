import React from "react";
import { Formik, Field, Form } from "formik";
import OverlayListItem from "./OverlayListItem";
import Collapsible from "../UI/Collapsible";
import Option from "../UI/Option";
import GenomePositionInput from "../UI/GenomePositionInput";
import classes from "./OverlayList.module.css";

/*
const OverlayItem = (props) => {
  const { uid, extent, options, onSubmit } = props;

  return (
    <Formik
      initialValues={{
        extent: extent,
        options: options,
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          onSubmit(uid, values.extent, values.options);
          setSubmitting(false);
        }, 400);
      }}
    >
      {({ values }) => (
        <Form>
          <Collapsible title="Genomic Locations">
            <GenomePositionInput
              name="extent"
              extent={extent}
              genomeAssembly={props.genomeAssembly}
            />
          </Collapsible>
          <Collapsible title="1D/2D Options">
            <Option label="fill color" name="options.higlass.fill" />
            <Option
              label="fill opacity"
              name="options.higlass.fillOpacity"
              type="number"
              min="0"
              step="0.1"
            />
            <Option label="stroke color" name="options.higlass.stroke" />
            <Option
              label="stroke opacity"
              name="options.higlass.strokeOpacity"
              type="number"
              min="0"
              step="0.1"
            />
            <Option
              label="stroke width"
              name="options.higlass.strokeWidth"
              type="number"
              min="0"
              step="1"
            />
          </Collapsible>
          <Collapsible title="3D Options">
            <Option
              label="draw line"
              name="options.threed.drawLine"
              type="checkbox"
            />
            <Option label="line color" name="options.threed.lineColor" />
            <Option
              label="line width"
              name="options.threed.lineWidth"
              type="number"
              min="0"
              step="1"
            />
            <Option
              label="draw anchor 1"
              name="options.threed.drawAnchor1"
              type="checkbox"
            />
            <Option label="anchor 1 color" name="options.threed.anchor1Color" />
            <Option
              label="anchor 1 radius"
              name="options.threed.anchor1Radius"
              type="number"
            />
            <Option label="anchor 1 label" name="options.threed.anchor1Label" />
            <Option
              label="anchor 1 label font-size"
              name="options.threed.anchor1LabelSize"
            />
            <Option
              label="anchor 1 label color"
              name="options.threed.anchor1LabelColor"
            />
            <Option
              label="anchor 1 label font weight"
              name="options.threed.anchor1LabelWeight"
            />
            <Option
              label="draw anchor 2"
              name="options.threed.drawAnchor2"
              type="checkbox"
            />
            <Option label="anchor 2 color" name="options.threed.anchor2Color" />
            <Option
              label="anchor 2 radius"
              name="options.threed.anchor2Radius"
              type="number"
            />
            <Option label="anchor 2 label" name="options.threed.anchor2Label" />
            <Option
              label="anchor 2 label font-size"
              name="options.threed.anchor2LabelSize"
            />
            <Option
              label="anchor 2 label color"
              name="options.threed.anchor2LabelColor"
            />
            <Option
              label="anchor 2 label font weight"
              name="options.threed.anchor2LabelWeight"
            />
          </Collapsible>
          <div className={classes.action}>
            <button type="submit">Update</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
*/

const OverlayList = (props) => {
  return (
    <>
      {props.overlays.map((overlay, index) => {
        return (
          <Collapsible
            key={overlay.uid}
            title={`Annotation #${index + 1}`}
            onDelete={props.onRemoveOverlay.bind(null, overlay.uid)}
            defaultCollapsed
          >
            <OverlayListItem
              key={overlay.uid}
              uid={overlay.uid}
              extent={overlay.extent}
              options={overlay.options}
              onSubmit={props.onUpdateOverlay}
              genomeAssembly={props.genomeAssembly}
            />
          </Collapsible>
        );
      })}
    </>
  );
};

export default OverlayList;
