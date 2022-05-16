import React, { Component, PureComponent } from "react";
import { HiGlassComponent } from "higlass";
import "higlass/dist/hglib.css";

const ZOOMTO_CHECK_INTERVAL = 100;

class HiGlass extends PureComponent {
  constructor(props) {
    super(props);
    this.defaultOptions = { bounded: false };
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
              geneStrandSpacing: 4,
            },
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
              reverseOrientation: false,
            },
          },
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
              geneStrandSpacing: 4,
            },
            uid: "dqBTMH78Rn6DeSyDBoAEXw",
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
              reverseOrientation: false,
            },
          },
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
                    "black",
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
                  scaleEndPercent: "1.00000",
                },
                uid: "GjuZed1ySGW1IzZZqFB9BA",
                transforms: [
                  {
                    name: "ICE",
                    value: "weight",
                  },
                ],
              },
            ],
            options: {},
          },
        ],
        right: [],
        bottom: [],
        whole: [],
        gallery: [],
      },
    };
    this.defaultViewConfig = {
      editable: false,
      zoomFixed: false,
      trackSourceServers: [
        "https://higlass.io/api/v1",
        "https://resgen.io/api/v1/gt/paper-data",
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
            static: false,
          },
        },
      ],
      zoomLocks: {
        locksByViewUid: {},
        locksDict: {},
      },
      locationLocks: {
        locksByViewUid: {},
        locksDict: {},
      },
      valueScaleLocks: {
        locksByViewUid: {},
        locksDict: {},
      },
    };
  }

  componentDidMount() {
    if (this.hgc) {
      this.api = this.hgc.api;
      this.props.setApi(this.api, this.props.uid);
      this.api.on(
        "location",
        (location) => this.props.onLocationChange(location, this.props.uid),
        "aa",
        (listenerId) => (this.locationLisenerId = listenerId)
      );
      this.api.on("rangeSelection", (range) =>
        this.props.onSelect(range.dataRange, this.props.uid)
      );

      const waitForZoomTo = () => {
        if (this.hgc && this.hgc.setCenters && this.hgc.setCenters.aa) {
          this.props.setZoomToReady(this.props.uid);
        } else {
          setTimeout(() => waitForZoomTo(), ZOOMTO_CHECK_INTERVAL);
        }
      };
      waitForZoomTo();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.zoomView && this.props.zoomView) {
      const viewConfig = this.api.getViewConfig();
      const tempView = JSON.parse(JSON.stringify(viewConfig.views[0]));
      const newView = {
        ...tempView,
        uid: "bb",
        initialXDomain: this.props.zoomView.initialXDomain,
        initialYDomain: this.props.zoomView.initialYDomain,
        layout: {
          w: 6,
          h: 10,
          x: 6,
          y: 0,
          moved: false,
          static: false,
        },
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
          strokeWidth: 1,
        },
      });
      const p = this.api.setViewConfig(viewConfig);
      p.then(() => {
        this.api.on(
          "location",
          (location) =>
            this.props.onProjectionLocationChange(location, this.props.uid),
          "bb",
          (listenerId) => (this.projectionLocationLisenerId = listenerId)
        );
      });
    }
  }

  componentWillUnmount() {
    if (this.locationLisenerId) {
      this.api.off("location", this.locationLisenerId, "aa");
    }
    if (this.projectionLocationLisenerId) {
      this.api.off("location", this.projectionLocationLisenerId, "bb");
    }
  }

  render() {
    console.log("render");
    return (
      <HiGlassComponent
        ref={(c) => {
          this.hgc = c;
        }}
        options={this.defaultOptions}
        viewConfig={this.defaultViewConfig}
      />
    );
  }
}

export default HiGlass;
