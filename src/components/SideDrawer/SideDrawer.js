import React from "react";
import classes from "./SideDrawer.module.css";

const SideDrawer = (props) => {
  return (
    <div className={classes.sidedrawer}>
      <div className={classes["sidedrawer-control-buttons"]}>
        <button onClick={props.onPanelChange.bind(null, "AddCase")}>
          <span>
            <ion-icon name="add-circle-outline"></ion-icon>
          </span>
        </button>
        <button onClick={props.onPanelChange.bind(null, "EditOptions")}>
          <span>
            <ion-icon name="options-outline"></ion-icon>
          </span>
        </button>
        <button onClick={props.onPanelChange.bind(null, "ToolBar")}>
          <span>
            <ion-icon name="navigate-circle-outline"></ion-icon>
          </span>
        </button>
        <button>
          <span>
            <ion-icon name="cloud-download-outline"></ion-icon>
          </span>
        </button>
        <button>
          <span>
            <ion-icon name="help-circle-outline"></ion-icon>
          </span>
        </button>
      </div>
      <div className={classes["sidedrawer-config-panel"]}>
        {/* <button className={classes["back"]}>
          <span>
            <ion-icon name="chevron-back-outline"></ion-icon>
          </span>
        </button> */}
        {props.children}
      </div>
    </div>
  );
};

export default SideDrawer;
