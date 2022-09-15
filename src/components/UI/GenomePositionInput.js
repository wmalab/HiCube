import React, { useState, useEffect, useRef } from "react";
import { ChromosomeInfo } from "higlass";
import { useFormikContext } from "formik";
import { numberWithCommas, strToInt } from "../../utils";
import classes from "./GenomePositionInput.module.css";

// Get chr:start-end format from absolute positions
// use chromsomeInfoPath to convert
// enter new chr:start-end location to jump
const GenomePositionInput = (props) => {
  const xScale = props.extent.slice(0, 2);
  const yScale =
    props.extent.length >= 4 ? props.extent.slice(2, 4) : undefined;
  const [xPositionText, setXPositionText] = useState("");
  const [yPositionText, setYPositionText] = useState("");
  const chromInfo = useRef();

  const { setFieldValue } = useFormikContext();

  const convertScaleToPositionText = (scale) => {
    let positionText = "";
    // scale: 2 absolute positions
    if (!scale || !scale[0] || !scale[1]) {
      return positionText;
    }
    const [chrom1, pos1] = chromInfo.current.absToChr(scale[0]);
    const [chrom2, pos2] = chromInfo.current.absToChr(scale[1]);
    // if the range is within the same chromosome
    // use format `${chrom}:${start}-${end}`
    const pos1Str = numberWithCommas(pos1);
    const pos2Str = numberWithCommas(pos2);
    if (chrom1 === chrom2) {
      positionText = `${chrom1}:${pos1Str}-${pos2Str}`;
    } else {
      positionText = `${chrom1}:${pos1Str}-${chrom2}:${pos2Str}`;
    }
    return positionText;
  };

  const convertPositionTextToScale = (positionText) => {
    if (!positionText) {
      return [];
    }
    const [chromPos1, chromPos2] = positionText.split("-");
    const [chrom1, pos1] = chromPos1.split(":");
    const chromPos2splited = chromPos2.split(":");
    let chrom2 = chrom1;
    if (chromPos2splited.length > 1) {
      chrom2 = chromPos2splited.shift();
    }
    const pos2 = chromPos2splited[0];
    const scale1 = chromInfo.current.chrToAbs([chrom1, strToInt(pos1)]);
    const scale2 = chromInfo.current.chrToAbs([chrom2, strToInt(pos2)]);
    return [scale1, scale2];
  };

  const setPositionText = () => {
    if (!chromInfo.current) {
      return;
    }
    setXPositionText(convertScaleToPositionText(xScale));
    if (yScale) {
      setYPositionText(convertScaleToPositionText(yScale));
    }
  };

  useEffect(() => {
    ChromosomeInfo(props.genomeAssembly.chromInfoPath, (newChromInfo) => {
      chromInfo.current = newChromInfo;
      // set chr position text
      setPositionText();
    });
  }, [props.genomeAssembly]);

  const xPositionTextChangeHandler = (event) => {
    setXPositionText(event.target.value);
  };

  const yPositionTextChangeHandler = (event) => {
    setYPositionText(event.target.value);
  };

  // const positionSubmitHandler = (event) => {
  //   event.preventDefault();
  //   // TODO: validation on range
  //   const enteredXScale = convertPositionTextToScale(xPositionText);
  //   const enteredYScale = convertPositionTextToScale(yPositionText);
  //   const updatedLocation = {
  //     xDomain: enteredXScale,
  //     yDomain: enteredYScale,
  //   };
  //   props.onPositionChange(updatedLocation, "user_entered");
  // };

  useEffect(() => {
    try {
      const enteredXScale = convertPositionTextToScale(xPositionText);
      const enteredYScale = convertPositionTextToScale(yPositionText);
      setFieldValue(props.name, [...enteredXScale, ...enteredYScale]);
    } catch (error) {
      console.log(error);
    }
  }, [xPositionText, yPositionText]);

  return (
    <>
      <div className={classes.position}>
        <label>{yScale ? "x axis" : "x/y axis"}</label>
        <input value={xPositionText} onChange={xPositionTextChangeHandler} />
      </div>
      {yScale && (
        <div className={classes.position}>
          <label>y axis</label>
          <input value={yPositionText} onChange={yPositionTextChangeHandler} />
        </div>
      )}
    </>
  );
};

export default GenomePositionInput;
