import React, { useContext } from "react";
import ConfigContext from "../../store/config-context";
import classes from "./SideDrawer.module.css";

const SideDrawer = (props) => {
  const ctx = useContext(ConfigContext);
  const noCase = ctx.cases.length === 0;

  return (
    <div className={classes.sidedrawer}>
      <div className={classes["sidedrawer-control-buttons"]}>
        <button onClick={props.onPanelChange.bind(null, "AddCase")}>
          <span>
            <ion-icon name="add-circle-outline"></ion-icon>
          </span>
        </button>
        <button
          onClick={props.onPanelChange.bind(null, "EditOptions")}
          disabled={noCase}
        >
          <span>
            <ion-icon name="options-outline"></ion-icon>
          </span>
        </button>
        <button
          onClick={props.onPanelChange.bind(null, "ToolBar")}
          disabled={noCase}
        >
          <span>
            <ion-icon name="navigate-circle-outline"></ion-icon>
          </span>
        </button>
        <button
          onClick={props.onPanelChange.bind(null, "Export")}
          disabled={noCase}
        >
          <span>
            <ion-icon name="cloud-download-outline"></ion-icon>
          </span>
        </button>
        <button
          onClick={() => {
            window.open("https://github.com/wmalab/HiCube");
          }}
        >
          <span>
            <ion-icon name="help-circle-outline"></ion-icon>
          </span>
        </button>
      </div>
      <div className={classes["sidedrawer-config-panel"]}>{props.children}</div>
    </div>
  );
};

export default SideDrawer;
