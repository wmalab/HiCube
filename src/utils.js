// source: https://dev.to/roblevintennis/comment/1ol48
export const uid = () =>
  String(Date.now().toString(32) + Math.random().toString(16)).replace(
    /\./g,
    ""
  );
