import React, { useState, useEffect } from "react";
import useChromInfo from "../../hooks/use-chrominfo";
import classes from "./GenomePositionBar.module.css";

// Get chr:start-end format from absolute positions
// use chromsomeInfoPath to convert
// enter new chr:start-end location to jump
const GenomePositionBar = (props) => {
  const { xDomain: xScale, yDomain: yScale } = props.positions;
  const [xPositionText, setXPositionText] = useState("");
  const [xError, setXError] = useState("");
  const [yPositionText, setYPositionText] = useState("");
  const [yError, setYError] = useState("");
  const { validateGenomePosition, getGenomePosition, toGenomePositionString } =
    useChromInfo(props.genomeAssembly.chromInfoPath);

  useEffect(() => {
    setXPositionText(toGenomePositionString(xScale));
    setYPositionText(toGenomePositionString(yScale));
  }, [xScale, yScale, toGenomePositionString]);

  const xPositionTextChangeHandler = (event) => {
    setXPositionText(event.target.value);
  };

  const yPositionTextChangeHandler = (event) => {
    setYPositionText(event.target.value);
  };

  const xPositionTextBlurHandler = (event) => {
    // validate
    const error = validateGenomePosition(true, xPositionText);
    setXError(error);
  };

  const yPositionTextBlurHandler = (event) => {
    // validate
    const error = validateGenomePosition(false, yPositionText);
    setYError(error);
  };

  const xPositionTextFocusHandler = (event) => {
    setXError("");
  };

  const yPositionTextFocusHandler = (event) => {
    setYError("");
  };

  const positionSubmitHandler = (event) => {
    event.preventDefault();
    const xErrMsg = validateGenomePosition(true, xPositionText);
    const yErrMsg = validateGenomePosition(false, yPositionText);
    if (xErrMsg || yErrMsg) {
      setXError(xErrMsg);
      setYError(yErrMsg);
      return;
    }
    const enteredXScale = getGenomePosition(xPositionText);
    const enteredYScale = getGenomePosition(yPositionText);
    // enteredYScale can be empty => then set same as xScale
    const updatedLocation = {
      xDomain: enteredXScale,
      yDomain: enteredYScale || [...enteredXScale],
    };
    props.onPositionChange(updatedLocation, "user_entered");
  };

  return (
    <div>
      <form onSubmit={positionSubmitHandler}>
        <span className={classes["title"]}>{props.name}</span>
        <div className={classes["position"]}>
          <span className={classes["sep"]}>X =</span>
          <input
            value={xPositionText}
            onChange={xPositionTextChangeHandler}
            onBlur={xPositionTextBlurHandler}
            onFocus={xPositionTextFocusHandler}
            className={classes["position-bar"]}
          />
          <span className={classes["sep"]}>Y =</span>
          <input
            value={yPositionText}
            onChange={yPositionTextChangeHandler}
            onBlur={yPositionTextBlurHandler}
            onFocus={yPositionTextFocusHandler}
            className={classes["position-bar"]}
          />
        </div>
        <button type="submit" className={classes["search"]}>
          Go
        </button>
      </form>
      <div>
        {xError && <p className={classes.error}>{`X: ${xError}`}</p>}
        {yError && <p className={classes.error}>{`Y: ${yError}`}</p>}
      </div>
    </div>
  );
};

export default GenomePositionBar;
