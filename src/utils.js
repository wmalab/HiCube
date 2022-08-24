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

export const numberWithCommas = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const strToInt = (str) => parseInt(str.replace(/,/g, ""));
