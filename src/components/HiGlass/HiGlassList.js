import React, { Component } from "react";
import HiGlass from "./HiGlass";

class HiGlassList extends Component {
  constructor(props) {
    super(props);
    this.notifyLocationChange = {
      hgc1: true,
      hgc2: true,
    };
    this.notifyProjectionLocationChange = {
      hgc1: true,
      hgc2: true,
    };
    this.state = {
      isZoomToReady: {
        hgc1: false,
        hgc2: false,
      },
      xDomain: null,
      yDomain: null,
      projectionXDomain: null,
      projectionYDomain: null,
      changeProjectionUid: null,
      changeUid: null,
      selectRange: null,
      mouseTool: "move",
      zoomView: null,
    };
    this.hgcApis = {};
    this.getApi = this.getApi.bind(this);
    this.getZoomToReady = this.getZoomToReady.bind(this);
    this.getLocationChange = this.getLocationChange.bind(this);
    this.getProjectionLocationChange =
      this.getProjectionLocationChange.bind(this);
    this.getSelectRegion = this.getSelectRegion.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleZoom = this.handleZoom.bind(this);
  }

  getApi(api, uid) {
    this.hgcApis[uid] = api;
  }

  getZoomToReady(uid) {
    this.setState({
      isZoomToReady: {
        ...this.state.isZoomToReady,
        [uid]: true,
      },
    });
  }

  getLocationChange(location, uid) {
    if (!this.notifyLocationChange[uid]) {
      return;
    }
    const { xDomain, yDomain } = location;
    this.setState({
      xDomain: xDomain,
      yDomain: yDomain,
      changeUid: uid, // 'hgc1', 'hgc2', '3D',
    });
  }

  getProjectionLocationChange(location, uid) {
    if (!this.notifyProjectionLocationChange[uid]) {
      return;
    }
    const { xDomain, yDomain } = location;
    this.setState({
      projectionXDomain: xDomain,
      projectionYDomain: yDomain,
      changeProjectionUid: uid,
    });
  }

  getSelectRegion(range, uid) {
    this.setState({
      selectRange: range,
    });
  }

  handleSelect() {
    // set mouseTool need re-render HiGlass component
    // TODO why re-click select will remove zoom view
    // so HGC re-rendered with default viewConfig
    this.setState({
      mouseTool: "select",
      zoomView: null,
    });
    this.hgcApis.hgc1.activateTool("select");
    this.hgcApis.hgc2.activateTool("select");
  }

  handleZoom() {
    if (this.state.mouseTool === "move" || !this.state.selectRange) {
      return;
    }
    const [xRange, yRange] = this.state.selectRange;
    if (!xRange || !yRange) {
      return;
    }
    this.setState({
      mouseTool: "move",
      zoomView: {
        initialXDomain: xRange,
        initialYDomain: yRange,
      },
    });
    this.hgcApis.hgc1.activateTool("move");
    this.hgcApis.hgc2.activateTool("move");
  }

  componentDidUpdate(prevProps, prevState) {
    const isZoomToReady =
      this.state.isZoomToReady.hgc1 && this.state.isZoomToReady.hgc2;
    if (!isZoomToReady) {
      return;
    }
    // if (prevState.xDomain === this.state.xDomain &&
    //   prevState.yDomain === this.state.yDomain) {
    //   return;
    // }
    const { xDomain, yDomain, projectionXDomain, projectionYDomain } =
      this.state;
    if (xDomain !== prevState.xDomain || yDomain !== prevState.yDomain) {
      if (this.state.changeUid === "hgc1") {
        this.notifyLocationChange.hgc2 = false;
        this.hgcApis.hgc2.zoomTo(
          "aa",
          xDomain[0],
          xDomain[1],
          yDomain[0],
          yDomain[1],
          1
        );
        setTimeout(() => (this.notifyLocationChange.hgc2 = true), 100);
      } else if (this.state.changeUid === "hgc2") {
        this.notifyLocationChange.hgc1 = false;
        this.hgcApis.hgc1.zoomTo(
          "aa",
          xDomain[0],
          xDomain[1],
          yDomain[0],
          yDomain[1],
          1
        );
        setTimeout(() => (this.notifyLocationChange.hgc1 = true), 100);
      }
      // this.child.select();
    }
    if (
      projectionXDomain !== prevState.projectionXDomain ||
      projectionYDomain !== prevState.projectionYDomain
    ) {
      if (this.state.changeProjectionUid === "hgc1") {
        this.notifyProjectionLocationChange.hgc2 = false;
        this.hgcApis.hgc2.zoomTo(
          "bb",
          projectionXDomain[0],
          projectionXDomain[1],
          projectionYDomain[0],
          projectionYDomain[1],
          1
        );
        setTimeout(
          () => (this.notifyProjectionLocationChange.hgc2 = true),
          100
        );
      } else if (this.state.changeProjectionUid === "hgc2") {
        this.notifyProjectionLocationChange.hgc1 = false;
        this.hgcApis.hgc1.zoomTo(
          "bb",
          projectionXDomain[0],
          projectionXDomain[1],
          projectionYDomain[0],
          projectionYDomain[1],
          1
        );
        setTimeout(
          () => (this.notifyProjectionLocationChange.hgc1 = true),
          100
        );
      }
    }
  }

  render() {
    const {
      xDomain,
      yDomain,
      selectRange,
      projectionXDomain,
      projectionYDomain,
    } = this.state;
    return (
      <div style={{ width: "800px", height: "800px" }}>
        <div>
          <p>xDomain: {xDomain && xDomain.join("--")}</p>
          <p>yDomain: {yDomain && yDomain.join("--")}</p>
          <p>
            select xRange: {selectRange && (selectRange[0] || []).join("--")}
          </p>
          <p>
            select yRange: {selectRange && (selectRange[1] || []).join("--")}
          </p>
          <p>
            projection xRange:{" "}
            {projectionXDomain && projectionXDomain.join("--")}
          </p>
          <p>
            projection yRange:{" "}
            {projectionYDomain && projectionYDomain.join("--")}
          </p>
          <button onClick={this.handleSelect}>select</button>
          <button onClick={this.handleZoom}>zoom</button>
        </div>
        {/* <h1>demo plot</h1> */}
        {/* <div>
          <Structure3D
            onRef={(ref) => (this.child = ref)}
            Domain={this.state}
          />
        </div> */}
        <div>
          <HiGlass
            uid="hgc1"
            setApi={this.getApi}
            onLocationChange={this.getLocationChange}
            onProjectionLocationChange={this.getProjectionLocationChange}
            onSelect={this.getSelectRegion}
            setZoomToReady={this.getZoomToReady}
            mouseTool={this.state.mouseTool}
            zoomView={this.state.zoomView}
          />
        </div>
        <div>
          <HiGlass
            uid="hgc2"
            setApi={this.getApi}
            onLocationChange={this.getLocationChange}
            onProjectionLocationChange={this.getProjectionLocationChange}
            onSelect={this.getSelectRegion}
            setZoomToReady={this.getZoomToReady}
            mouseTool={this.state.mouseTool}
            zoomView={this.state.zoomView}
          />
        </div>
      </div>
    );
  }
}

export default HiGlassList;
