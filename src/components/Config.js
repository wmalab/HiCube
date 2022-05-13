// TODO unique uid for each track per case and viewport-projection

const CONFIG = {
  trackConfigs: {
    OHJakQICQD6gTD7skx4EWA: {
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
    X4e_1DKiQHmyghDa6lLMVA: {
      type: "horizontal-chromosome-labels",
      height: 30,
      chromInfoPath: "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
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
    },
    dqBTMH78Rn6DeSyDBoAEXw: {
      type: "vertical-gene-annotations",
      width: 60,
      tilesetUid: "OHJakQICQD6gTD7skx4EWA",
      server: "https://higlass.io/api/v1",
      uid: "dqBTMH78Rn6DeSyDBoAEXw",
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
      }
    },
    RHdQK4IRQ7yJeDmKWb7Pcg: {
      type: "vertical-chromosome-labels",
      width: 30,
      chromInfoPath: "https://s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv",
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
    },
    GjuZed1ySGW1IzZZqFB9BA: {
      tilesetUid: "CQMd6V_cRw6iCI_-Unl3PQ",
      server: "https://higlass.io/api/v1",
      type: "heatmap",
      uid: "GjuZed1ySGW1IzZZqFB9BA",
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
      transforms: [
        {
          name: "ICE",
          value: "weight"
        }
      ]
    }
  },
  cases: [
    {
      left: ["dqBTMH78Rn6DeSyDBoAEXw", "RHdQK4IRQ7yJeDmKWb7Pcg"],
      right: [],
      top: ["OHJakQICQD6gTD7skx4EWA", "X4e_1DKiQHmyghDa6lLMVA"],
      bottom: [],
      center: ["GjuZed1ySGW1IzZZqFB9BA"]
    },
    {
      left: ["dqBTMH78Rn6DeSyDBoAEXw", "RHdQK4IRQ7yJeDmKWb7Pcg"],
      right: [],
      top: ["OHJakQICQD6gTD7skx4EWA", "X4e_1DKiQHmyghDa6lLMVA"],
      bottom: [],
      center: ["GjuZed1ySGW1IzZZqFB9BA"]
    }
  ],
  location: {
    xDomain: [1, 3200000000],
    yDomain: [1, 3200000000],
    fromId: null
  },
  selection: {
    xDomain: [null, null],
    yDomain: [null, null],
    fromId: null
  }
};

export default CONFIG;
