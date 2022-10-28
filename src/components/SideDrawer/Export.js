import React, { useContext } from "react";
import Collapsible from "../UI/Collapsible";
import ConfigContext from "../../store/config-context";
import classes from "./Export.module.css";

const Export = (props) => {
  const configCtx = useContext(ConfigContext);

  // TODO: for each case and base and zoom (for 3d) generate a export img button

  return (
    <div>
      <Collapsible title="Export Files">
        <div className={classes.action}>
          <button onClick={props.onExportConfig}>
            Export configuration file (JSON)
          </button>
          <button onClick={props.onExportAnnotations}>
            Export annotations
          </button>
        </div>
      </Collapsible>
      {configCtx.cases.map((userCase, index) => {
        const caseUid = userCase.uid;

        return (
          <Collapsible key={caseUid} title={`Case #${index + 1}`}>
            <div className={classes.action}>
              <button
                onClick={props.onExportSvg.bind(null, caseUid, "higlass")}
                disabled={props.exportSvg}
              >
                Export 2D Hi-C image
              </button>
              <button
                onClick={props.onExportSvg.bind(null, caseUid, "threed", false)}
                disabled={props.exportSvg}
              >
                Export 3D structure image
              </button>
              {configCtx.numViews > 1 && (
                <button
                  onClick={props.onExportSvg.bind(
                    null,
                    caseUid,
                    "threed",
                    true
                  )}
                  disabled={props.exportSvg}
                >
                  Export 3D structure zoom image
                </button>
              )}
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default Export;
