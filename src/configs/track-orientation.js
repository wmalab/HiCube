// for datatype `chromsizes` we don't need select dataset
const DATA_TYPES = {
  "gene-annotation": {
    "track-type": ["gene-annotations"],
  },
  matrix: {
    "track-type": ["linear-heatmap"],
  },
  "2d-rectangle-domains": {
    "track-type": ["2d-rectangle-domains", "linear-2d-rectangle-domains"],
  },
  vector: {
    "track-type": ["line", "bar", "point", "1d-heatmap"],
  },
  chromsizes: {
    "track-type": ["chromosome-labels", "2d-chromosome-grid"],
  },
};

const TRACK_ORIENTATION = {
  "gene-annotations": "1d",
  "linear-heatmap": "1d",
  "2d-rectangle-domains": "2d",
  "linear-2d-rectangle-domains": "1d",
  line: "1d",
  bar: "1d",
  point: "1d",
  "1d-heatmap": "1d",
  "chromosome-labels": "1d",
  "2d-chromosome-grid": "2d",
};

export const findTracktypes = (datatype) => {
  if (datatype in DATA_TYPES) {
    return DATA_TYPES[datatype]["track-type"];
  }
  return [];
};

export const findTrackOrientation = (tracktype) => {
  if (tracktype in TRACK_ORIENTATION) {
    return TRACK_ORIENTATION[tracktype];
  }
  return null;
};

export const availDatatypes = () => {
  return Object.keys(DATA_TYPES);
};
