import React, { useState } from "react";
import SideDrawer from "./SideDrawer";
import AddCase from "./AddCase";
import EditOptions from "./EditOptions";
import ToolBar from "./ToolBar";
import Export from "./Export";

const ControlPanel = (props) => {
  const [panel, setPanel] = useState("AddCase");

  const panelChangeHandler = (chosenPanel) => {
    setPanel(chosenPanel);
  };

  return (
    <SideDrawer onPanelChange={panelChangeHandler}>
      {panel === "AddCase" && (
        <AddCase
          trackSourceServers={props.trackSourceServers}
          onAddServer={props.onAddServer}
          onRemoveServer={props.onRemoveServer}
          genomeAssembly={props.genomeAssembly}
          onGenomeAssemblyChange={props.onGenomeAssemblyChange}
          mainLocation={props.mainLocation}
          onSubmitConfig={props.onSubmitConfig}
          // onAddCase={props.onAddCase}
        />
      )}
      {panel === "EditOptions" && (
        <EditOptions mainLocation={props.mainLocation} />
      )}
      {panel === "ToolBar" && (
        <ToolBar
          onSelect={props.onSelect}
          onCancel={props.onCancelSelect}
          onAddZoomIn={props.onAddZoomIn}
          onRemoveZoomIn={props.onRemoveZoomIn}
          overlays={props.overlays}
          onAddOverlay={props.onAddOverlay}
          onUpdateOverlay={props.onUpdateOverlay}
          onRemoveOverlays={props.onRemoveOverlays}
          onRemoveOverlay={props.onRemoveOverlay}
          genomeAssembly={props.genomeAssembly}
        />
      )}
      {panel === "Export" && (
        <Export
          onExportSvg={props.onExportSvg}
          exportSvg={props.exportSvg}
          onExportConfig={props.onExportConfig}
          onExportAnnotations={props.onExportAnnotations}
        />
      )}
    </SideDrawer>
  );
};

export default ControlPanel;
