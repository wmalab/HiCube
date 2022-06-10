import React, { useState } from "react";
import SideDrawer from "./SideDrawer";
import AddCase from "./AddCase";
import EditOptions from "./EditOptions";
import ToolBar from "./ToolBar";

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
          onAddCase={props.onAddCase}
        />
      )}
      {panel === "EditOptions" && <EditOptions />}
      {panel === "ToolBar" && (
        <ToolBar
          onSelect={props.onSelect}
          onCancel={props.onCancelSelect}
          onAddZoomIn={props.onAddZoomIn}
          onRemoveZoomIn={props.onRemoveZoomIn}
          overlays={props.overlays}
          onAddOverlay={props.onAddOverlay}
          onRemoveOverlays={props.onRemoveOverlays}
          onRemoveOverlay={props.onRemoveOverlay}
        />
      )}
    </SideDrawer>
  );
};

export default ControlPanel;
