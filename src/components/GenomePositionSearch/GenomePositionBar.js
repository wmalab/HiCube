import React, { useState, useEffect, useRef } from "react";
import { ChromosomeInfo } from "higlass";
import { numberWithCommas } from "../../utils";
import classes from "./GenomePositionBar.module.css";

// Get chr:start-end format from absolute positions
// use chromsomeInfoPath to convert
// enter new chr:start-end location to jump
const GenomePositionBar = (props) => {
  const { xDomain: xScale, yDomain: yScale } = props.positions;
  const [xPositionText, setXPositionText] = useState();
  const [yPositionText, setYPositionText] = useState();
  const chromInfo = useRef();

  const convertPositionText = (scale) => {
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

  const setPositionText = () => {
    if (!chromInfo.current) {
      return;
    }
    setXPositionText(convertPositionText(xScale));
    setYPositionText(convertPositionText(yScale));
  };

  const { chromInfoPath } = props;
  useEffect(() => {
    ChromosomeInfo(chromInfoPath, (newChromInfo) => {
      chromInfo.current = newChromInfo;
      // set chr position text
      setPositionText();
    });
  }, [chromInfoPath]);

  useEffect(() => {
    setPositionText();
  }, [xScale, yScale]);

  return (
    <div>
      <strong>{props.name}</strong>
      <form>
        <div className={classes["position"]}>
          <input value={xPositionText} className={classes["position-bar"]} />
          <span className={classes["sep"]}>&</span>
          <input value={yPositionText} className={classes["position-bar"]} />
          <button className={classes["search"]}>Go</button>
        </div>
      </form>
    </div>
  );
};

export default GenomePositionBar;
