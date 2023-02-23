import React from "react";
import { Formik, Field, Form } from "formik";
import OverlayListItem from "./OverlayListItem";
import Collapsible from "../UI/Collapsible";
import Option from "../UI/Option";
import chroma from "chroma-js";
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

const Colorbar = (props) => {
  // the domain range should be determined by vmin/vmax and smin/smax
  const min = props.vmin === "" ? props.smin : props.vmin;
  const max = props.vmax === "" ? props.smax : props.vmax;
  const useDefault = min >= max;
  let dmin, dmax;
  if (useDefault) {
    dmin = 0;
    dmax = 1;
  } else {
    dmin = min;
    dmax = max;
  }
  // let dmin = 0;
  // let dmax = 1;
  const d = chroma.scale(props.name).domain([dmin, dmax]);

  const bar = [];

  for (let i = 0; i <= 100; i++) {
    bar.push(
      <span
        key={i}
        className={classes["grad-step"]}
        style={{ backgroundColor: d(dmin + (i / 100) * (dmax - dmin)) }}
      ></span>
    );
  }

  return (
    <div className={classes["gradient"]}>
      {bar}
      {!useDefault && (
        <>
          <span className={classes["domain-min"]}>{dmin}</span>
          <span className={classes["domain-med"]}>{(dmin + dmax) * 0.5}</span>
          <span className={classes["domain-max"]}>{dmax}</span>
        </>
      )}
    </div>
  );
};

const validateColormap = (values) => {
  const errors = {};
  const min = values.vmin === "" ? values.smin : values.vmin;
  const max = values.vmax === "" ? values.smax : values.vmax;
  if (values.vmin !== "" && values.vmin >= max) {
    errors.vmin = `vmin must be smaller than vmax or maximum score ${values.smax}`;
  }
  if (values.vmax !== "" && values.vmax <= min) {
    errors.vmax = `vmax must be larger than vmin or minimum score ${values.smin}`;
  }
  if (values.vmax === "" && values.vmin === "" && min >= max) {
    errors.vmax = `not valid range ${min}-${max}`;
  }
  return errors;
};

const ColormapForm = (props) => {
  const colormaps = [
    "OrRd",
    "BuGn",
    "BuPu",
    "GnBu",
    "PuBu",
    "PuBuGn",
    "Blues",
    "Greens",
    "Greys",
    "PuRd",
    "RdPu",
    "YlGn",
    "YlGnBu",
    "YlOrBr",
    "YlOrRd",
    "Oranges",
    "Purples",
    "Reds",
    "BrBG",
    "PiYG",
    "PRGn",
    "PuOr",
    "RdBu",
    "RdGy",
    "RdYlBu",
    "RdYlGn",
    "Spectral",
  ];

  return (
    <Formik
      enableReinitialize
      validateOnBlur
      initialValues={{
        name: props.name,
        vmin: props.vmin === null ? "" : props.vmin,
        vmax: props.vmax === null ? "" : props.vmax,
        smin: props.smin,
        smax: props.smax,
      }}
      validate={validateColormap}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          props.onSubmit(props.colormapKey, {
            name: values.name,
            vmin: values.vmin === "" ? null : values.vmin,
            vmax: values.vmax === "" ? null : values.vmax,
          });
          setSubmitting(false);
        }, 400);
      }}
    >
      {({ values, touched, errors }) => (
        <Form>
          <div className={classes.option}>
            <label>Colormap</label>
            <Field as="select" name="name">
              {colormaps.map((cmap) => (
                <option key={cmap} value={cmap}>
                  {cmap}
                </option>
              ))}
            </Field>
          </div>
          <Option label="vmin" name="vmin" type="number" />
          {touched.vmin && errors.vmin && (
            <p className={classes.error}>{errors.vmin}</p>
          )}
          <Option label="vmax" name="vmax" type="number" />
          {touched.vmax && errors.vmax && (
            <p className={classes.error}>{errors.vmax}</p>
          )}
          <Colorbar
            name={values.name}
            vmin={values.vmin}
            vmax={values.vmax}
            smin={props.smin}
            smax={props.smax}
          />
          <div className={classes.action}>
            <button type="submit">Update</button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

const OverlayList = (props) => {
  function createOverlayListItem(overlay, index) {
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
          score={overlay.score}
          options={overlay.options}
          onSubmit={props.onUpdateOverlay}
          genomeAssembly={props.genomeAssembly}
        />
      </Collapsible>
    );
  }

  const overlayList1d = props.overlays.data1d.map(createOverlayListItem);
  const overlayList2d = props.overlays.data2d.map(createOverlayListItem);

  return (
    <>
      <Collapsible title="Annotations Global Configuration">
        {overlayList1d.length > 0 && (
          <Collapsible title="1D Annotations Colors">
            <ColormapForm
              colormapKey="colormap1d"
              name={props.overlays.colormap1d.name}
              vmin={props.overlays.colormap1d.vmin}
              vmax={props.overlays.colormap1d.vmax}
              smin={props.overlays.min1d}
              smax={props.overlays.max1d}
              onSubmit={props.onUpdateOverlayCmap}
            />
          </Collapsible>
        )}
        {overlayList2d.length > 0 && (
          <Collapsible title="2D Annotations Colors">
            <ColormapForm
              colormapKey="colormap2d"
              name={props.overlays.colormap2d.name}
              vmin={props.overlays.colormap2d.vmin}
              vmax={props.overlays.colormap2d.vmax}
              smin={props.overlays.min2d}
              smax={props.overlays.max2d}
              onSubmit={props.onUpdateOverlayCmap}
            />
          </Collapsible>
        )}
      </Collapsible>
      {overlayList1d.length > 0 && (
        <Collapsible title="1D Annotations">{overlayList1d}</Collapsible>
      )}
      {overlayList2d.length > 0 && (
        <Collapsible title="2D Annotations">{overlayList2d}</Collapsible>
      )}
    </>
  );
  // return (
  //   <>
  //     {props.overlays.map((overlay, index) => {
  //       return (
  //         <Collapsible
  //           key={overlay.uid}
  //           title={`Annotation #${index + 1}`}
  //           onDelete={props.onRemoveOverlay.bind(null, overlay.uid)}
  //           defaultCollapsed
  //         >
  //           <OverlayListItem
  //             key={overlay.uid}
  //             uid={overlay.uid}
  //             extent={overlay.extent}
  //             options={overlay.options}
  //             onSubmit={props.onUpdateOverlay}
  //             genomeAssembly={props.genomeAssembly}
  //           />
  //         </Collapsible>
  //       );
  //     })}
  //   </>
  // );
};

export default OverlayList;
