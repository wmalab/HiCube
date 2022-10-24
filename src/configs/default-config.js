export const defaultOptions = { bounded: false, mouseTool: "move", globalMousePosition: true };
export const defaultView = {
  initialXDomain: [1, 3200000000],
  autocompleteSource: "/api/v1/suggest/?d=OHJakQICQD6gTD7skx4EWA&",
  chromInfoPath: "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
  tracks: {
    top: [
      {
        type: "horizontal-gene-annotations",
        height: 60,
        tilesetUid: "OHJakQICQD6gTD7skx4EWA",
        server: "http://higlass.io/api/v1",
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
        server: "http://higlass.io/api/v1",
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
            server: "http://higlass.io/api/v1",
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
export const defaultViewConfig = {
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
        w: 12,
        h: 12,
        x: 0,
        y: 0,
        // moved: false,
        static: true
      },
      // overlays: [
      //   {
      //     "uid": "overlay",
      //     "includes": ["c1"],
      //     "options": {
      //       "extent": [
      //         [1000000000, 1100000000],
      //         [1400000000, 1500000000, 1600000000, 1700000000],
      //       ],
      //     }
      //   }
      // ]
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

const overlayTracks = {
  "editable": false,
  "zoomFixed": false,
  "views": [
    {
      "uid": "aa",
      "initialXDomain": [-128227010, 3227095876],
      "tracks": {
        "top": [
          {
            "server": "http://higlass.io/api/v1",
            "tilesetUid": "OHJakQICQD6gTD7skx4EWA",
            "uid": "genes-top",
            "type": "horizontal-gene-annotations"
          },
          {
            "chromInfoPath": "//s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
            "type": "horizontal-chromosome-labels",
            "uid": "chroms-top"
          }
        ],
        "left": [
          {
            "server": "http://higlass.io/api/v1",
            "tilesetUid": "OHJakQICQD6gTD7skx4EWA",
            "uid": "genes-left",
            "type": "vertical-gene-annotations"
          },
          {
            "chromInfoPath": "//s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
            "type": "vertical-chromosome-labels",
            "uid": "chroms-left"
          }
        ],
        "center": [],
        "right": [],
        "bottom": []
      },
      "layout": {
        "w": 12,
        "h": 12,
        "x": 0,
        "y": 0
      },
      "overlays": [
        {
          "uid": "overlay",
          "type": "",
          "includes": ["chroms-top", "chroms-left", "genes-top", "genes-left"],
          "options": {
            "extent": [
              [1000000000, 1100000000],
              [1400000000, 1500000000, 1600000000, 1700000000]
            ]
          }
        }
      ]
    }
  ]
};