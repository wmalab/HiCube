import React, { Component } from "react";
import HiGlassCase from "./HiGlassCase";
import CONFIG from "./Config";

class Viewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: CONFIG.location,
      initialLocation: CONFIG.location,
      selection: CONFIG.selection,
      enableSelect: false,
      trackConfigs: CONFIG.trackConfigs,
      cases: CONFIG.cases
    };
    this.selectBox = {
      xDomain: [null, null],
      yDomain: [null, null],
      fromId: null
    };
    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleSelectBoxChange = this.handleSelectBoxChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleZoom = this.handleZoom.bind(this);
    this.handleClear = this.handleClear.bind(this);
  }

  handleLocationChange(location, id) {
    const { xDomain, yDomain } = location;

    this.setState({
      location: {
        xDomain: xDomain,
        yDomain: yDomain,
        fromId: id
      }
    });
  }

  handleSelectionChange(location, id) {
    const { xDomain, yDomain } = location;
    this.setState({
      selection: {
        xDomain: xDomain,
        yDomain: yDomain,
        fromId: id
      }
    });
  }

  handleSelect() {
    this.setState({
      selection: {
        xDomain: [null, null],
        yDomain: [null, null],
        fromId: null
      },
      enableSelect: true
    });
  }

  handleZoom() {
    if (!this.state.enableSelect) {
      return;
    }
    this.setState({
      selection: {
        ...this.selectBox
      },
      enableSelect: false
    });
  }

  handleClear() {
    this.setState({
      selection: {
        xDomain: [null, null],
        yDomain: [null, null],
        fromId: null
      },
      enableSelect: false
    });
  }

  handleSelectBoxChange(selectRange, id) {
    this.selectBox.xDomain = selectRange[0];
    this.selectBox.yDomain = selectRange[1];
    this.selectBox.fromId = id;
  }

  convertToHiglassConfig(caseId) {
    let higlassConfig = {
      editable: false,
      zoomFixed: false,
      trackSourceServers: [
        "https://higlass.io/api/v1",
        "https://resgen.io/api/v1/gt/paper-data"
      ],
      exportViewUrl: "/api/v1/viewconfs",
      views: []
    };
    let view = {
      uid: "aa",
      autocompleteSource: "/api/v1/suggest/?d=OHJakQICQD6gTD7skx4EWA&",
      chromInfoPath: "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
      layout: { w: 6, h: 10, x: 0, y: 0, moved: false, static: false },
      tracks: {
        top: [],
        left: [],
        center: []
      }
    };
    view["initialXDomain"] = this.state.initialLocation.xDomain;
    view["initialYDomain"] = this.state.initialLocation.yDomain;
    for (let position of ["top", "left"]) {
      for (let trackId of this.state.cases[caseId][position]) {
        view.tracks[position].push(this.state.trackConfigs[trackId]);
      }
    }
    view.tracks.center.push({
      uid: "c1",
      type: "combined",
      contents: []
    });
    for (let trackId of this.state.cases[caseId].center) {
      view.tracks.center[0].contents.push(this.state.trackConfigs[trackId]);
    }
    higlassConfig.views.push(view);
    console.log(higlassConfig);
    return higlassConfig;
  }

  render() {
    const { xDomain, yDomain } = this.state.location;
    const { xDomain: selectX, yDomain: selectY } = this.state.selection;
    return (
      <div style={{ width: "800px", height: "800px" }}>
        <div>
          <p>location.xDomain: {xDomain && xDomain.join("--")} </p>
          <p>location.yDomain: {yDomain && yDomain.join("--")}</p>
          <p>selection.xDomain: {selectX && selectX.join("--")}</p>
          <p>selection.yDomain: {selectY && selectY.join("--")}</p>
          <button onClick={this.handleSelect}>Select</button>
          <button onClick={this.handleZoom}>Zoom</button>
          <button onClick={this.handleClear}>Clear</button>
        </div>
        <HiGlassCase
          id="hgc1"
          viewConfig={this.convertToHiglassConfig(0)}
          location={this.state.location}
          locationChange={this.handleLocationChange}
          selectionChange={this.handleSelectionChange}
          selectBoxChange={this.handleSelectBoxChange}
          selection={this.state.selection}
          enableSelect={this.state.enableSelect}
        />
        <HiGlassCase
          id="hgc2"
          viewConfig={this.convertToHiglassConfig(1)}
          location={this.state.location}
          locationChange={this.handleLocationChange}
          selectionChange={this.handleSelectionChange}
          selectBoxChange={this.handleSelectBoxChange}
          selection={this.state.selection}
          enableSelect={this.state.enableSelect}
        />
      </div>
    );
  }
}

export default Viewer;
