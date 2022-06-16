import TRACKS_INFO from "./tracks-info";

const TRACKS_INFO_BY_TYPE = TRACKS_INFO.reduce((prev, curr) => {
  prev[curr.type] = curr;
  return prev;
}, {});

export default TRACKS_INFO_BY_TYPE;
