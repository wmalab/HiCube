import React, { useState, useEffect, useRef } from "react";
import { ChromosomeInfo } from "higlass";
import { numberWithCommas, strToInt } from "../../utils";
import classes from "./GenomePositionBar.module.css";

// Get chr:start-end format from absolute positions
// use chromsomeInfoPath to convert
// enter new chr:start-end location to jump
const GenomePositionBar = (props) => {
  const { xDomain: xScale, yDomain: yScale } = props.positions;
  const [xPositionText, setXPositionText] = useState("");
  const [yPositionText, setYPositionText] = useState("");
  const chromInfo = useRef();

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
    console.log(chrom1, pos1, chrom2, pos2);
    return positionText;
  };

  const convertPositionTextToScale = (positionText) => {
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
    setYPositionText(convertScaleToPositionText(yScale));
  };

  const { genomeAssembly } = props;
  useEffect(() => {
    ChromosomeInfo(genomeAssembly.chromInfoPath, (newChromInfo) => {
      chromInfo.current = newChromInfo;
      // set chr position text
      setPositionText();
    });
  }, [genomeAssembly]);

  useEffect(() => {
    setPositionText();
  }, [xScale, yScale]);

  const xPositionTextChangeHandler = (event) => {
    setXPositionText(event.target.value);
  };

  const yPositionTextChangeHandler = (event) => {
    setYPositionText(event.target.value);
  };

  const positionSubmitHandler = (event) => {
    event.preventDefault();
    // TODO: validation on range
    const enteredXScale = convertPositionTextToScale(xPositionText);
    const enteredYScale = convertPositionTextToScale(yPositionText);
    const updatedLocation = {
      xDomain: enteredXScale,
      yDomain: enteredYScale,
    };
    props.onPositionChange(updatedLocation, "user_entered");
  };

  return (
    <div>
      <form onSubmit={positionSubmitHandler}>
        <span className={classes["title"]}>{props.name} :</span>
        <div className={classes["position"]}>
          <input
            value={xPositionText}
            onChange={xPositionTextChangeHandler}
            className={classes["position-bar"]}
          />
          <span className={classes["sep"]}>&</span>
          <input
            value={yPositionText}
            onChange={yPositionTextChangeHandler}
            className={classes["position-bar"]}
          />
          <button type="submit" className={classes["search"]}>
            Go
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenomePositionBar;
