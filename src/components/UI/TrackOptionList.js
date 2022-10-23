import React from "react";
import DisplayOptions from "./DisplayOptions";
import Collapsible from "./Collapsible";

const TrackOptionList = (props) => {
  // TODO: deal with positions show/hide

  const forms = [];

  for (const track of props.config) {
    // for each track, get trackUid and trackName
    // add all positions for a track
    const trackName = track.name;
    const trackUids = Object.values(track.positions);
    if (trackUids && trackUids.length > 0) {
      forms.push(
        <DisplayOptions
          key={trackUids[0]}
          trackUid={trackUids[0]}
          trackName={trackName}
          auxTrackUids={trackUids.slice(1)}
          mainLocation={props.mainLocation}
          zoomLocation={props.zoomLocation}
        />
      );
    }
  }

  return (
    <Collapsible title="Additional Tracks" defaultCollapsed>
      {forms}
    </Collapsible>
  );
};

export default TrackOptionList;
