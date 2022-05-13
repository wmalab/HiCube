import React, { Component, PureComponent } from "react";
import { HiGlassComponent } from "higlass";
import "higlass/dist/hglib.css";

// DONE check if setCenters key length equal to number of views
// DONE update current domain by props
// DONE switch to select mouseTool when click select
// DONE create new view when click zoom and switch back to move
// DONE update current domain of zoom view by props
// DONE only re-render on certain cases
// DONE re-click select clear selection and maintain current location
// TODO re-click select and zoom view still from last time selection
// TODO click zoom 1-D track still in select mode
// TODO create zoom use setState where render use props.viewConfig

const defaultOptions = { bounded: false, mouseTool: "move" };
const defaultView = {
  initialXDomain: [1, 3200000000],
  autocompleteSource: "/api/v1/suggest/?d=OHJakQICQD6gTD7skx4EWA&",
  chromInfoPath: "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
  tracks: {
    top: [
      {
        type: "horizontal-gene-annotations",
        height: 60,
        tilesetUid: "OHJakQICQD6gTD7skx4EWA",
        server: "https://higlass.io/api/v1",
        uid: "OHJakQICQD6gTD7skx4EWA",
        options: {
          name: "Gene Annotations (hg19)",
          fontSize: 10,
          labelColor: "black",
          labelBackgroundColor: "#ffffff",
          labelPosition: "hidden",
          labelLeftMargin: 0,
          labelRightMargin: 0,
          labelTopMargin: 0,
          labelBottomMargin: 0,
          minHeight: 24,
          plusStrandColor: "blue",
          minusStrandColor: "red",
          trackBorderWidth: 0,
          trackBorderColor: "black",
          showMousePosition: false,
          mousePositionColor: "#000000",
          geneAnnotationHeight: 16,
          geneLabelPosition: "outside",
          geneStrandSpacing: 4
        }
      },
      {
        chromInfoPath:
          "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
        type: "horizontal-chromosome-labels",
        height: 30,
        uid: "X4e_1DKiQHmyghDa6lLMVA",
        options: {
          color: "#808080",
          stroke: "#ffffff",
          fontSize: 12,
          fontIsLeftAligned: false,
          showMousePosition: false,
          mousePositionColor: "#000000",
          reverseOrientation: false
        }
      }
    ],
    left: [
      {
        type: "vertical-gene-annotations",
        width: 60,
        tilesetUid: "OHJakQICQD6gTD7skx4EWA",
        server: "https://higlass.io/api/v1",
        options: {
          labelPosition: "bottomRight",
          name: "Gene Annotations (hg19)",
          fontSize: 10,
          labelColor: "black",
          labelBackgroundColor: "#ffffff",
          labelLeftMargin: 0,
          labelRightMargin: 0,
          labelTopMargin: 0,
          labelBottomMargin: 0,
          minHeight: 24,
          plusStrandColor: "blue",
          minusStrandColor: "red",
          trackBorderWidth: 0,
          trackBorderColor: "black",
          showMousePosition: false,
          mousePositionColor: "#000000",
          geneAnnotationHeight: 16,
          geneLabelPosition: "outside",
          geneStrandSpacing: 4
        },
        uid: "dqBTMH78Rn6DeSyDBoAEXw"
      },
      {
        chromInfoPath:
          "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
        type: "vertical-chromosome-labels",
        width: 30,
        uid: "RHdQK4IRQ7yJeDmKWb7Pcg",
        options: {
          color: "#808080",
          stroke: "#ffffff",
          fontSize: 12,
          fontIsLeftAligned: false,
          showMousePosition: false,
          mousePositionColor: "#000000",
          reverseOrientation: false
        }
      }
    ],
    center: [
      {
        uid: "c1",
        type: "combined",
        // "height": 660,
        contents: [
          {
            server: "https://higlass.io/api/v1",
            tilesetUid: "CQMd6V_cRw6iCI_-Unl3PQ",
            type: "heatmap",
            options: {
              maxZoom: null,
              labelPosition: "bottomRight",
              name: "Rao et al. (2014) GM12878 MboI (allreps) 1kb",
              backgroundColor: "#eeeeee",
              labelLeftMargin: 0,
              labelRightMargin: 0,
              labelTopMargin: 0,
              labelBottomMargin: 0,
              labelShowResolution: true,
              labelShowAssembly: true,
              colorRange: [
                "white",
                "rgba(245,166,35,1.0)",
                "rgba(208,2,27,1.0)",
                "black"
              ],
              colorbarBackgroundColor: "#ffffff",
              minWidth: 100,
              minHeight: 100,
              colorbarPosition: "topRight",
              trackBorderWidth: 0,
              trackBorderColor: "black",
              heatmapValueScaling: "log",
              showMousePosition: false,
              mousePositionColor: "#000000",
              showTooltip: false,
              extent: "full",
              zeroValueColor: null,
              scaleStartPercent: "0.00000",
              scaleEndPercent: "1.00000"
            },
            uid: "GjuZed1ySGW1IzZZqFB9BA",
            transforms: [
              {
                name: "ICE",
                value: "weight"
              }
            ]
          }
        ],
        options: {}
      }
    ],
    right: [],
    bottom: [],
    whole: [],
    gallery: []
  }
};
const defaultViewConfig = {
  editable: false,
  zoomFixed: false,
  trackSourceServers: [
    "https://higlass.io/api/v1",
    "https://resgen.io/api/v1/gt/paper-data"
  ],
  exportViewUrl: "/api/v1/viewconfs",
  views: [
    {
      ...defaultView,
      uid: "aa",
      layout: {
        w: 6,
        h: 10,
        x: 0,
        y: 0,
        moved: false,
        static: false
      }
    }
  ],
  zoomLocks: {
    locksByViewUid: {},
    locksDict: {}
  },
  locationLocks: {
    locksByViewUid: {},
    locksDict: {}
  },
  valueScaleLocks: {
    locksByViewUid: {},
    locksDict: {}
  }
};

class HiGlassWrapper extends PureComponent {
  constructor(props) {
    super(props);
  }

  // shouldComponentUpdate() {

  // }

  render() {
    console.log("render HiGlassWrapper");
    // console.log(this.props.viewConfig);
    return (
      <HiGlassComponent
        getApi={this.props.getApi}
        options={this.props.options}
        viewConfig={this.props.viewConfig}
      />
    );
  }
}

class HiGlassCase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: defaultOptions,
      viewConfig: this.props.viewConfig
    };
    this.notify = true;
    this.listeners = {
      location: {},
      rangeSelection: null
    };
    this.getApi = this.getApi.bind(this);
  }

  componentDidMount() {
    if (this.hgApi) {
      this.hgc = this.hgApi.getComponent();
      this.hgApi.on(
        "location",
        (location) => {
          if (this.notify) {
            console.log("location change", location);
            this.props.locationChange(location, this.props.id);
          }
        },
        "aa",
        (listener) => (this.listeners.location["aa"] = listener)
      );
      this.hgApi.on(
        "rangeSelection",
        (range) => {
          this.props.selectBoxChange(range.dataRange, this.props.id);
        },
        (listener) => (this.listeners.rangeSelection = listener)
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.enableSelect !== prevProps.enableSelect) {
      if (this.props.enableSelect) {
        this.hgApi.activateTool("select");
        this.setState({
          options: {
            ...this.state.options,
            mouseTool: "select"
          }
        });
      } else {
        this.hgApi.activateTool("move");
        this.setState({
          options: {
            ...this.state.options,
            mouseTool: "move"
          }
        });
      }
    }
    if (this.isDomainChange(this.props.location, prevProps.location)) {
      const viewUid = this.state.viewConfig.views[0].uid;
      const { xDomain, yDomain } = this.props.location;
      this.syncViewDomain(viewUid, xDomain, yDomain);
    }
    if (this.isCreateSelection(this.props.selection, prevProps.selection)) {
      this.createSelection();
    }
    if (
      this.state.viewConfig.views.length > 1 &&
      !this.listeners.location.hasOwnProperty("bb")
    ) {
      this.hgApi.on(
        "location",
        (location) => {
          if (this.notify) {
            console.log("selection change", location);
            this.props.selectionChange(location, this.props.id);
          }
        },
        "bb",
        (listener) => (this.listeners.location["bb"] = listener)
      );
    }
    if (this.isClearSelection(this.props.selection, prevProps.selection)) {
      this.clearSelection();
    } else if (
      this.state.viewConfig.views.length > 1 &&
      this.isDomainChange(this.props.selection, prevProps.selection)
    ) {
      const viewUid = this.state.viewConfig.views[1].uid;
      const { xDomain, yDomain } = this.props.selection;
      this.syncViewDomain(viewUid, xDomain, yDomain);
    }
  }

  componentWillUnmount() {
    if (this.listeners.location) {
      for (const viewUid in this.listeners.location) {
        this.hgApi.off("location", this.listeners.location[viewUid], viewUid);
      }
    }
    if (this.listeners.rangeSelection) {
      this.hgApi.off("rangeSelection", this.listeners.rangeSelection);
    }
  }

  /* custom methods */

  isDomainChange(domain, prev) {
    const { xDomain, yDomain, fromId } = domain;
    if (fromId === this.props.id) return false;
    if (prev.xDomain === xDomain && prev.yDomain === yDomain) return false;
    return true;
  }

  isCreateSelection(selection, prev) {
    const { fromId } = selection;
    if (!prev.fromId && fromId) return true;
    return false;
  }

  isClearSelection(selection, prev) {
    const { fromId } = selection;
    if (prev.fromId && !fromId) {
      return true;
    }
    return false;
  }

  isZoomViewCreated() {}

  syncViewDomain(viewUid, xDomain, yDomain) {
    if (
      this.hgc &&
      this.hgc.setCenters &&
      this.hgc.setCenters.hasOwnProperty(viewUid)
    ) {
      this.notify = false;
      this.hgApi.zoomTo(viewUid, ...xDomain, ...yDomain, 1);
      setTimeout(() => (this.notify = true), 100);
    }
  }

  createSelection() {
    const viewConfig = this.hgApi.getViewConfig();
    const tempView = JSON.parse(JSON.stringify(viewConfig.views[0]));
    const newView = {
      ...tempView,
      uid: "bb",
      initialXDomain: this.props.selection.xDomain,
      initialYDomain: this.props.selection.yDomain,
      layout: {
        w: 6,
        h: 10,
        x: 6,
        y: 0,
        moved: false,
        static: false
      }
    };
    viewConfig.views.push(newView);
    viewConfig.views[0].tracks.center[0].contents.push({
      type: "viewport-projection-center",
      uid: "my-track-id",
      fromViewUid: "bb",
      options: {
        projectionFillOpacity: 0.3,
        projectionStrokeColor: "black",
        projectionFillColor: "black",
        projectionStrokeOpacity: 0.3,
        strokeWidth: 1
      }
    });
    this.setState({
      viewConfig: viewConfig
    });
  }

  clearSelection() {
    const viewConfig = this.hgApi.getViewConfig();
    if (viewConfig.views.length == 1) {
      return;
    }
    viewConfig.views.pop();
    viewConfig.views[0].tracks.center[0].contents.pop();
    if (this.listeners.location.hasOwnProperty("bb")) {
      this.hgApi.off("location", this.listeners.location["bb"], "bb");
      delete this.listeners.location["bb"];
    }
    this.setState({
      viewConfig: viewConfig
    });
  }

  getApi(api) {
    this.hgApi = api;
  }

  render() {
    console.log("render HiGlassCase");
    return (
      <HiGlassWrapper
        getApi={this.getApi}
        options={this.state.options}
        viewConfig={defaultViewConfig}
        // viewConfig={this.props.viewConfig} // TODO need to use props.viewConfig and viewConfig should not update if only location changed
      />
    );
  }
}

export default HiGlassCase;
