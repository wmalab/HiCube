import React, { useState } from "react";
import TrackSelector from "./TrackSelector";

// Select track datatype
// track orientation: 1d, 2d, all
// track type
// track positions
const AddTrack = (props) => {
  return (
    <div className="addtrack">
      <div className="addtrack__datatype">
        <label>Data type:</label>
        <Field as="select" name={`tracks.${index}.type`}>
          <option value="gene-annotations">gene-annotations</option>
          <option value="chromosome-labels">chromosome-labels</option>
        </Field>
      </div>
      <div className="addtrack__tracktype">
        <label>Track type:</label>
        <Field as="select" name={`tracks.${index}.type`}>
          <option value="gene-annotations">gene-annotations</option>
          <option value="chromosome-labels">chromosome-labels</option>
        </Field>
      </div>
      {track.type !== "chromosome-labels" && (
        <div className="addtrack__selector">
          <label>Track tileset UID:</label>
          <Field type="text" name={`tracks.${index}.tilesetUid`} />
        </div>
      )}
      <div className="addtrack__positions">
        <label>Track positions:</label>
        <div role="group" aria-labelledby={`tracks.${index}.positions.group`}>
          {["top", "bottom", "left", "right"].map((position) => (
            <label key={position}>
              <Field
                type="checkbox"
                name={`tracks.${index}.positions`}
                value={position}
              />
              {position}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddTrack;
