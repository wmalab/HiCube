import React, { useState } from "react";
import classes from "./ChromBoundManager.module.css";

const PrevIcon = (props) => <ion-icon name="chevron-back-outline"></ion-icon>;

const NextIcon = (props) => (
  <ion-icon name="chevron-forward-outline"></ion-icon>
);

const ChromNavigator = (props) => {
  function shouldDisabled(direction) {
    return props.onNavChroms(props.chrom, direction) === undefined;
  }
  function clickHandler(direction) {
    const newChrom = props.onNavChroms(props.chrom, direction);
    if (!newChrom) {
      return;
    }
    if (props.syncXY) {
      props.onUpdateChrom({ x: newChrom, y: newChrom });
    } else {
      props.onUpdateChrom({ [props.axis]: newChrom });
    }
  }
  return (
    <div className={classes.chrom}>
      <button
        disabled={shouldDisabled(-1)}
        onClick={() => clickHandler(-1)}
        className={classes.nav}
      >
        <PrevIcon />
      </button>
      <span>{`${props.axis.toUpperCase()} limit [ ${props.chrom} ]`}</span>
      <button
        disabled={shouldDisabled(1)}
        onClick={() => clickHandler(1)}
        className={classes.nav}
      >
        <NextIcon />
      </button>
    </div>
  );
};

const ChromBoundManager = (props) => {
  const [syncXY, setSyncXY] = useState(true);

  function syncXYClickHandler() {
    setSyncXY((prev) => !prev);
  }

  return (
    <div className={classes.whole}>
      <button className={classes.btnOff}>Free Roam: OFF</button>
      <ChromNavigator
        chrom={props.currentChroms.x}
        onUpdateChrom={props.onUpdateCurrentChroms}
        axis="x"
        onNavChroms={props.onNavChroms}
        syncXY={syncXY}
      />
      <ChromNavigator
        chrom={props.currentChroms.y}
        onUpdateChrom={props.onUpdateCurrentChroms}
        axis="y"
        onNavChroms={props.onNavChroms}
        syncXY={syncXY}
      />
      <button
        onClick={syncXYClickHandler}
        className={syncXY ? classes.btnOn : classes.btnOff}
      >
        Sync XY: {syncXY ? "ON" : "OFF"}
      </button>
    </div>
  );
};

export default ChromBoundManager;
