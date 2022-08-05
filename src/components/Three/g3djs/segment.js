class Segment {
  constructor(i = null, point = null) {
    this.start = i;
    this.end = i;
    this.points = [];
    if (point) {
      this.points.push(point);
    }
  }

  add(i, point) {
    if (!this.isNext(i)) {
      return false;
    }
    if (this.end === null) {
      this.start = i;
    }
    this.end = i;
    this.points.push(point);
    return true;
  }

  isEmpty() {
    return this.end === null;
  }

  isNext(i) {
    if (this.end === null) {
      // empty segment
      return true;
    }
    return i === this.end + 1;
  }
}

export default Segment;
