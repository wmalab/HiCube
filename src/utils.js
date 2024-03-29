import colormap from "colormap";

// source: https://dev.to/roblevintennis/comment/1ol48
export const uid = () =>
  String(Date.now().toString(32) + Math.random().toString(16)).replace(
    /\./g,
    ""
  );

const RGB2Color = (r, g, b) => {
  return (
    "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")"
  );
};
/*
export const makeColorGradient = (
  len,
  frequency1 = 0.3,
  frequency2 = 0.3,
  frequency3 = 0.3,
  phase1 = 0,
  phase2 = 2,
  phase3 = 4,
  center = 128,
  width = 127
) => {
  const colors = [];

  for (let i = 0; i < len; i++) {
    const red = Math.sin(frequency1 * i + phase1) * width + center;
    const grn = Math.sin(frequency2 * i + phase2) * width + center;
    const blu = Math.sin(frequency3 * i + phase3) * width + center;
    colors.push(RGB2Color(red, grn, blu));
  }
  return colors;
};
*/

export const makeColorGradient = (len, map = "rainbow") => {
  return colormap({
    colormap: map,
    nshades: len,
    format: "hex",
    alpha: 1,
  });
};

export const numberWithCommas = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const strToInt = (str) => parseInt(str.replace(/,/g, ""));

export const camelCaseToTitleCase = (text) => {
  const result = text.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const basicType = (value) => {
  if (typeof value === "number") {
    return "number";
  }
  if (typeof value === "boolean") {
    return "boolean";
  }
  return "string";
};

export const truncateString = (str, num) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
};

export const lastElem = (arr) => {
  return arr[arr.length - 1];
};

// see https://dev.to/nombrekeff/download-file-from-blob-21ho
// and https://stackoverflow.com/questions/61203503/alternative-to-mssaveoropenblob-on-chrome
export const download = (blob, filename) => {
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    // for IE
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    // for non-IE
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("download", filename);
    link.setAttribute("href", blobUrl);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }
};

export const manualUpdateLocation = (
  loc,
  updateFn,
  validateFn,
  newChroms,
  kwargs
) => {
  const { isUpdate, xDomain, yDomain } = validateFn(
    loc,
    newChroms.x,
    newChroms.y
  );
  if (isUpdate) {
    updateFn({ xDomain, yDomain, ...kwargs });
  }
};
