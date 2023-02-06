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
  function selectChangeHandler(event) {
    const newChrom = event.target.value;
    if (props.syncXY) {
      props.onUpdateChrom({ x: newChrom, y: newChrom });
    } else {
      props.onUpdateChrom({ [props.axis]: newChrom });
    }
  }
  return (
    <div className={classes.chrom}>
      <span>{`${props.axis.toUpperCase()} Limit = `}</span>
      <button
        disabled={shouldDisabled(-1)}
        onClick={() => clickHandler(-1)}
        className={classes.nav}
      >
        <PrevIcon />
      </button>
      <select value={props.chrom} onChange={selectChangeHandler}>
        {props.allChroms.map((chr) => (
          <option key={chr} value={chr}>
            {chr}
          </option>
        ))}
      </select>
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
      <button
        className={props.freeRoam ? classes.freeroamOn : classes.freeroamOff}
        onClick={props.onFreeRoamClick}
      >
        Free Roam: {props.freeRoam ? "ON" : "OFF"}
      </button>
      {!props.freeRoam && (
        <>
          <ChromNavigator
            chrom={props.currentChroms.x}
            allChroms={props.allChroms}
            onUpdateChrom={props.onUpdateCurrentChroms}
            axis="x"
            onNavChroms={props.onNavChroms}
            syncXY={syncXY}
          />
          <button
            onClick={syncXYClickHandler}
            className={syncXY ? classes.btnOn : classes.btnOff}
          >
            {syncXY ? (
              <ion-icon name="link-outline"></ion-icon>
            ) : (
              <ion-icon name="unlink-outline"></ion-icon>
            )}
          </button>
          <ChromNavigator
            chrom={props.currentChroms.y}
            allChroms={props.allChroms}
            onUpdateChrom={props.onUpdateCurrentChroms}
            axis="y"
            onNavChroms={props.onNavChroms}
            syncXY={syncXY}
          />
        </>
      )}
    </div>
  );
};

export default ChromBoundManager;
