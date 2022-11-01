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
            Export Configuration as JSON
          </button>
          <button onClick={props.onExportAnnotations}>
            Export Annotations
          </button>
        </div>
      </Collapsible>
      {configCtx.cases.map((userCase, index) => {
        const caseUid = userCase.uid;
        const exportViewsToSvg =
          configCtx.hgcRefs.current[caseUid] &&
          configCtx.hgcRefs.current[caseUid].exportViewsToSvg;
        const exportViewsToPng =
          configCtx.hgcRefs.current[caseUid] &&
          configCtx.hgcRefs.current[caseUid].exportViewsToPng;

        return (
          <Collapsible key={caseUid} title={`Case #${index + 1}`}>
            <div className={classes.action}>
              <button
                // onClick={props.onExportSvg.bind(null, caseUid, "higlass")}
                // disabled={props.exportSvg}
                onClick={exportViewsToPng}
              >
                Export 2D Views as PNG
              </button>
              <button onClick={exportViewsToSvg}>Export 2D Views as SVG</button>
              {caseUid in configCtx.threeCases && (
                <button
                  onClick={props.onExportSvg.bind(
                    null,
                    caseUid,
                    "threed",
                    false
                  )}
                  disabled={props.exportSvg}
                >
                  Export 3D Base View as PNG
                </button>
              )}
              {caseUid in configCtx.threeCases && configCtx.numViews > 1 && (
                <button
                  onClick={props.onExportSvg.bind(
                    null,
                    caseUid,
                    "threed",
                    true
                  )}
                  disabled={props.exportSvg}
                >
                  Export 3D Zoom View as PNG
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
