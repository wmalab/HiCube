import React from "react";

// TODO: group by cases, then the main heatmap options
// then list of other tracks
// TODO: manager configs in context
// TODO: use index to manager configs and re-generate
// viewconfig once index changed

const TrackOptions = (props) => {
  return <div></div>;
};

const TrackList = (props) => {
  return (
    <div>
      <TrackOptions />
    </div>
  );
};

const HeatmapOptions = (props) => {
  return (<div>
    {JSON.stringify(props.config.hgcViewConfig.views[0].tracks.center[0].contents[0].uid)}
  </div>);
};

const CaseOptions = (props) => {
  return (
    <div>
      <HeatmapOptions config={props.config} />
      <TrackList config={props.config} />
    </div>
  );
};

const EditOptions = (props) => {
  return (
    <div>
      <div>Edit Options</div>
      {props.configs.map((config) => (
        <CaseOptions key={config.uuid} config={config} />
      ))}
    </div>
  );
};

export default EditOptions;
