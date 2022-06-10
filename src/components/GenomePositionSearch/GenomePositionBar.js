import React from "react";

const GenomePositionBar = (props) => {
  const { xDomain, yDomain } = props.absPositions;
  return (
    <div>
      <strong>{props.name}</strong>
      <p>{xDomain && `X range: ${xDomain[0]}-${xDomain[1]}`}</p>
      <p>{yDomain && `Y range: ${yDomain[0]}-${yDomain[1]}`}</p>
    </div>
  );
};

export default GenomePositionBar;
