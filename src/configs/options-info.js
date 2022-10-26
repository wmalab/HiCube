const sizesInPx = (sizes, unit = "", multiplier = 1) =>
  sizes.reduce((sizeOption, size) => {
    sizeOption[size] = { name: `${size * multiplier}${unit}`, value: size };
    return sizeOption;
  }, {});

const YES_NO = {
  yes: { name: "Yes", value: true },
  no: { name: "No", value: false },
};

export const AVAILABLE_COLORS = {
  black: { name: "Black", value: "black" },
  blue: { name: "Blue", value: "blue" },
  brown: { name: "Brown", value: "brown" },
  cyan: { name: "Cyan", value: "cyan" },
  green: { name: "Green", value: "green" },
  grey: { name: "Grey", value: "grey" },
  orange: { name: "Orange", value: "orange" },
  purple: { name: "Purple", value: "purple" },
  turquoise: { name: "Turquoise", value: "turquoise" },
  red: { name: "Red", value: "red" },
  white: { name: "White", value: "white" },
};

const SPECIAL_COLORS = {
  use_stroke: { name: "Glyph color", value: "[glyph-color]" },
};

const AVAILABLE_WIDTHS = sizesInPx([1, 2, 3, 5, 8, 13, 21]);
const AVAILABLE_WIDTHS_AND_NONE = Object.assign(AVAILABLE_WIDTHS, {
  none: { name: "none", value: "none" },
});
const AVAILABLE_MARGIN = sizesInPx([0, 2, 4, 8, 16, 32, 64, 128, 256]);
const OPACITY_OPTIONS = sizesInPx([0.0, 0.2, 0.4, 0.6, 0.8, 1.0], "%", 100);
const OPACITY_OPTIONS_NO_ZERO = sizesInPx([0.2, 0.4, 0.6, 0.8, 1.0], "%", 100);

const OPTIONS_INFO = {
  axisLabelFormatting: {
    name: "Axis Label Formatting",
    inlineOptions: {
      normal: {
        name: "normal",
        value: "normal",
      },
      scientific: {
        name: "scientific",
        value: "scientific",
      },
    },
  },
  flipDiagonal: {
    name: "Flip Across Diagonal",
    inlineOptions: {
      none: { name: "No", value: "none" },
      yes: { name: "Yes", value: "yes" },
      copy: { name: "Copy", value: "copy" },
    },
  },
  heatmapValueScaling: {
    name: "Value Scaling",
    inlineOptions: {
      linear: { name: "Linear", value: "linear" },
      log: { name: "Log", value: "log" },
    },
  },
  valueScaling: {
    name: "Value Scaling",
    inlineOptions: {
      linear: { name: "Linear", value: "linear" },
      log: { name: "Log", value: "log" },
    },
  },
  extent: {
    name: "Extent",
    inlineOptions: {
      full: { name: "Full", value: "full" },
      upperRight: { name: "Upper Right", value: "upper-right" },
      lowerLeft: { name: "Lower Left", value: "lower-left" },
    },
  },
  labelLeftMargin: {
    name: "Label Left Margin",
    inlineOptions: AVAILABLE_MARGIN,
  },
  labelRightMargin: {
    name: "Label Right Margin",
    inlineOptions: AVAILABLE_MARGIN,
  },
  labelTopMargin: {
    name: "Label Top Margin",
    inlineOptions: AVAILABLE_MARGIN,
  },
  labelBottomMargin: {
    name: "Label Bottom Margin",
    inlineOptions: AVAILABLE_MARGIN,
  },
  labelShowResolution: {
    name: "Label Show Resolution",
    inlineOptions: YES_NO,
  },
  labelShowAssembly: {
    name: "Label Show Assembly",
    inlineOptions: YES_NO,
  },
  lineStrokeWidth: {
    name: "Stroke Width",
    inlineOptions: AVAILABLE_WIDTHS,
  },
  strokeWidth: {
    name: "Stroke Width",
    inlineOptions: AVAILABLE_WIDTHS,
  },
  trackBorderWidth: {
    name: "Track Border Width",
    inlineOptions: AVAILABLE_WIDTHS,
  },
  separatePlusMinusStrands: {
    name: "Separate +/- strands",
    inlineOptions: YES_NO,
  },
  sortLargestOnTop: {
    name: "Sort Largest On Top",
    inlineOptions: YES_NO,
  },
  showTexts: {
    name: "Show texts",
    inlineOptions: YES_NO,
  },
  staggered: {
    name: "Staggered",
    inlineOptions: YES_NO,
  },
  minSquareSize: {
    name: "Minimum size",
    inlineOptions: AVAILABLE_WIDTHS_AND_NONE,
  },
  pointSize: {
    name: "Point Size",
    inlineOptions: AVAILABLE_WIDTHS,
  },
  pointColor: {
    name: "Point Color",
    inlineOptions: AVAILABLE_COLORS,
  },
  trackBorderColor: {
    name: "Track Border Color",
    inlineOptions: AVAILABLE_COLORS,
  },
  backgroundColor: {
    name: "Background Color",
    inlineOptions: {
      white: { name: "White", value: "white" },
      lightGrey: { name: "Light Grey", value: "#eeeeee" },
      grey: { name: "Grey", value: "#cccccc" },
      black: { name: "Black", value: "black" },
      transparent: { name: "Transparent", value: "transparent" },
    },
  },
  minusStrandColor: {
    name: "- Strand Color",
    inlineOptions: AVAILABLE_COLORS,
  },
  plusStrandColor: {
    name: "+ Strand Color",
    inlineOptions: AVAILABLE_COLORS,
  },
  lineStrokeColor: {
    name: "Stroke color",
    inlineOptions: AVAILABLE_COLORS,
  },
  projectionStrokeColor: {
    name: "Stroke color",
    inlineOptions: AVAILABLE_COLORS,
  },
  projectionFillColor: {
    name: "Fill color",
    inlineOptions: AVAILABLE_COLORS,
  },
  stroke: {
    name: "Stroke Color",
    inlineOptions: AVAILABLE_COLORS,
  },
  strokeColor: {
    name: "Stroke color",
    inlineOptions: AVAILABLE_COLORS,
  },
  fill: {
    name: "Fill Color",
    inlineOptions: AVAILABLE_COLORS,
  },
  color: {
    name: "Color",
    inlineOptions: AVAILABLE_COLORS,
  },
  fontColor: {
    name: "Font color",
    inlineOptions: AVAILABLE_COLORS,
  },
  fillColor: {
    name: "Fill color",
    inlineOptions: AVAILABLE_COLORS,
  },
  barFillColor: {
    name: "Fill color",
    inlineOptions: {
      ...AVAILABLE_COLORS,
      darkgreen: { name: "Dark green", value: "darkgreen" },
    },
  },
  barFillColorTop: {
    name: "Top Fill color",
    inlineOptions: AVAILABLE_COLORS,
  },
  barFillColorBottom: {
    name: "Bottom Fill color",
    inlineOptions: AVAILABLE_COLORS,
  },
  barOpacity: {
    name: "Bar opacity",
    inlineOptions: OPACITY_OPTIONS,
  },
  zeroLineVisible: {
    name: "Zero line visible",
    inlineOptions: YES_NO,
  },
  zeroLineColor: {
    name: "Zero line color",
    inlineOptions: AVAILABLE_COLORS,
  },
  zeroLineOpacity: {
    name: "Zero line opacity",
    inlineOptions: OPACITY_OPTIONS_NO_ZERO,
  },
  fillOpacity: {
    name: "Fill Opacity",
    inlineOptions: OPACITY_OPTIONS,
  },
  strokeOpacity: {
    name: "Stroke Opacity",
    inlineOptions: OPACITY_OPTIONS,
  },
  strokePos: {
    name: "Stroke Position",
    inlineOptions: {
      aroundInner: { name: "Around Inner", value: "around" },
      aroundCenter: { name: "Around Center", value: null },
      hidden: { name: "Hidden", value: "hidden" },
      top: { name: "Top", value: "top" },
      right: { name: "Right", value: "right" },
      bottom: { name: "Bottom", value: "bottom" },
      left: { name: "Left", value: "left" },
    },
  },
  barBorder: {
    name: "Bar border",
    inlineOptions: YES_NO,
  },
  scaledHeight: {
    name: "Scaled height",
    inlineOptions: YES_NO,
  },
  rectangleDomainStrokeColor: {
    name: "Stroke color",
    inlineOptions: AVAILABLE_COLORS,
  },
  rectangleDomainFillColor: {
    name: "Fill color",
    inlineOptions: AVAILABLE_COLORS,
  },
  rectangleDomainFillOpacity: {
    name: "Fill opacity",
    inlineOptions: OPACITY_OPTIONS,
  },
  rectangleDomainOpacity: {
    name: "Opacity",
    inlineOptions: OPACITY_OPTIONS,
  },
  oneDHeatmapFlipped: {
    name: "Flip Heatmap",
    inlineOptions: {
      yes: { name: "Yes", value: "yes" },
      no: { name: "No", value: null },
    },
  },
  showMousePosition: {
    name: "Show Mouse Position",
    inlineOptions: YES_NO,
  },
  showTooltip: {
    name: "Show Tooltip",
    inlineOptions: YES_NO,
  },
  fontSize: {
    name: "Font Size",
    inlineOptions: sizesInPx([8, 9, 10, 11, 12, 14, 16, 18, 24], "px"),
  },
  tickPositions: {
    name: "Tick Positions",
    inlineOptions: {
      even: {
        name: "Even",
        value: "even",
      },
      ends: {
        name: "Ends",
        value: "ends",
      },
    },
  },
  tickFormat: {
    name: "Tick Format",
    inlineOptions: {
      plain: {
        name: "Plain",
        value: "plain",
      },
      si: {
        name: "SI",
        value: "si",
      },
    },
  },
  fontIsAligned: {
    name: "Left-Align Font",
    inlineOptions: YES_NO,
  },
  axisPositionHorizontal: {
    name: "Axis Position",
    inlineOptions: {
      left: { name: "Left", value: "left" },
      outsideLeft: { name: "Outside left", value: "outsideLeft" },
      right: { name: "Right", value: "right" },
      outsideRight: { name: "Outside right", value: "outsideRight" },
      hidden: { name: "Hidden", value: null },
    },
  },
  axisPositionVertical: {
    name: "Axis Position",
    inlineOptions: {
      top: { name: "Top", value: "top" },
      outsideTop: { name: "Outside top", value: "outsideTop" },
      bottom: { name: "Bottom", value: "bottom" },
      outsideBottom: { name: "Outside bottom", value: "outsideBottom" },
      hidden: { name: "Hidden", value: null },
    },
  },
  axisMargin: {
    name: "Axis Margin",
    inlineOptions: sizesInPx([0, 10, 20, 30, 40, 50, 100, 200, 400], "px"),
  },
  colorbarPosition: {
    name: "Colorbar Position",
    inlineOptions: {
      topLeft: { name: "Top Left", value: "topLeft" },
      topRight: { name: "Top Right", value: "topRight" },
      bottomLeft: { name: "Bottom Left", value: "bottomLeft" },
      bottomRight: { name: "Bottom Right", value: "bottomRight" },
      hidden: { name: "Hidden", value: null },
    },
  },
  colorbarBackgroundColor: {
    name: "Colorbar Background Color",
    inlineOptions: AVAILABLE_COLORS,
  },
  colorbarBackgroundOpacity: {
    name: "Colorbar Background Opacity",
    inlineOptions: OPACITY_OPTIONS,
  },
  colorbarLabelsPosition: {
    name: "Colorbar Labels Position",
    inlineOptions: {
      inside: { name: "Inside", value: "inside" },
      outside: { name: "Outside", value: "outside" },
    },
  },
  labelColor: {
    name: "Label Color",
    inlineOptions: { ...AVAILABLE_COLORS, ...SPECIAL_COLORS },
  },
  labelPosition: {
    name: "Label Position",
    inlineOptions: {
      ol: { name: "Outer left", value: "outerLeft" },
      or: { name: "Outer right", value: "outerRight" },
      ot: { name: "Outer top", value: "outerTop" },
      ob: { name: "Outer bottom", value: "outerBottom" },
      tl: { name: "Top left", value: "topLeft" },
      tr: { name: "Top right", value: "topRight" },
      bl: { name: "Bottom left", value: "bottomLeft" },
      br: { name: "Bottom right", value: "bottomRight" },
      hidden: { name: "Hidden", value: "hidden" },
    },
  },
  labelTextOpacity: {
    name: "Label Text Opacity",
    inlineOptions: OPACITY_OPTIONS,
  },
  geneAnnotationHeight: {
    name: "Gene Annotation Height",
    inlineOptions: {
      8: { name: "8px", value: 8 },
      10: { name: "10px", value: 10 },
      12: { name: "12px", value: 12 },
      16: { name: "16px", value: 16 },
    },
  },
  annotationHeight: {
    name: "Annotation Height",
    inlineOptions: {
      5: { name: "5px", value: 5 },
      8: { name: "8px", value: 8 },
      10: { name: "10px", value: 10 },
      12: { name: "12px", value: 12 },
      16: { name: "16px", value: 16 },
      20: { name: "20px", value: 20 },
      scaled: { name: "scaled", value: "scaled" },
    },
  },
  maxAnnotationHeight: {
    name: "Max Annotation Height",
    inlineOptions: {
      5: { name: "5px", value: 5 },
      8: { name: "8px", value: 8 },
      10: { name: "10px", value: 10 },
      12: { name: "12px", value: 12 },
      16: { name: "16px", value: 16 },
      20: { name: "20px", value: 20 },
      none: { name: "none", value: null },
    },
  },
  annotationStyle: {
    name: "Annotation Style",
    inlineOptions: {
      box: { name: "Box", value: "box" },
      segment: { name: "Segment", value: "segment" },
    },
  },
  geneLabelPosition: {
    name: "Gene Label Position",
    inlineOptions: {
      inside: { name: "Inside", value: "inside" },
      outside: { name: "Outside", value: "outside" },
    },
  },
  geneStrandSpacing: {
    name: "Gene Strand Spacing",
    inlineOptions: {
      2: { name: "2px", value: 2 },
      4: { name: "4px", value: 4 },
      8: { name: "8px", value: 8 },
    },
  },
  labelBackgroundColor: {
    name: "Label Background Color",
    inlineOptions: AVAILABLE_COLORS,
  },
  labelBackgroundOpacity: {
    name: "Label Background Opacity",
    inlineOptions: OPACITY_OPTIONS,
  },
  viewResolution: {
    name: "View Resolution",
    inlineOptions: {
      high: { name: "High", value: 384 },
      medium: { name: "Medium", value: 1024 },
      low: { name: "Low", value: 2048 },
    },
  },
  align: {
    name: "Align",
    inlineOptions: {
      white: { name: "Top", value: "top" },
      lightGrey: { name: "Bottom", value: "bottom" },
    },
  },
  colorRangeGradient: {
    name: "Color Gradient",
    inlineOptions: YES_NO,
  },
  // add null because default value is null
  zeroValueColor: {
    name: "Zero Value Color",
    inlineOptions: { ...AVAILABLE_COLORS, none: { name: "none", value: null } },
  },
  // add fontIsLeftAligned
  fontIsLeftAligned: {
    name: "Left-Align Font",
    inlineOptions: YES_NO,
  },
  // add reverseOrientation
  reverseOrientation: {
    name: "Reverse Orientation",
    inlineOptions: YES_NO,
  },
  colorRange: {
    name: "Color map",
    inlineOptions: {
      afmhot: {
        name: "afmhot",
        value: [
          "rgba(0,0,0,1.0)",
          "rgba(128,0,0,1.0)",
          "rgba(256,129,1,1.0)",
          "rgba(256,256,129,1.0)",
          "rgba(256,256,256,1.0)",
        ],
      },
      fall: {
        name: "fall",
        value: ["white", "rgba(245,166,35,1.0)", "rgba(208,2,27,1.0)", "black"],
      },
      hot: {
        name: "hot",
        value: [
          "rgba(10,0,0,1.0)",
          "rgba(179,0,0,1.0)",
          "rgba(256,91,0,1.0)",
          "rgba(256,256,6,1.0)",
          "rgba(256,256,256,1.0)",
        ],
      },
      jet: {
        name: "jet",
        value: [
          "rgba(0,0,128,1.0)",
          "rgba(0,129,256,1.0)",
          "rgba(125,256,122,1.0)",
          "rgba(256,148,0,1.0)",
          "rgba(128,0,0,1.0)",
        ],
      },

      bwr: {
        name: "bwr",
        value: [
          "rgba(0,0,256,1.0)",
          "rgba(128,128,256,1.0)",
          "rgba(256,254,254,1.0)",
          "rgba(256,126,126,1.0)",
          "rgba(256,0,0,1.0)",
        ],
      },
      cubehelix: {
        name: "cubehelix",
        value: [
          "rgba(0,0,0,1.0)",
          "rgba(21,83,76,1.0)",
          "rgba(162,121,74,1.0)",
          "rgba(199,180,238,1.0)",
          "rgba(256,256,256,1.0)",
        ],
      },
      rainbow: {
        name: "rainbow",
        value: [
          "rgba(128,0,256,1.0)",
          "rgba(0,181,236,1.0)",
          "rgba(129,255,180,1.0)",
          "rgba(256,179,96,1.0)",
          "rgba(256,0,0,1.0)",
        ],
      },

      gray: {
        name: "greys",
        value: ["rgba(255,255,255,1)", "rgba(0,0,0,1)"],
      },
      red: {
        name: "White to red",
        value: ["rgba(255,255,255,1)", "rgba(255,0,0,1)"],
      },
      green: {
        name: "White to green",
        value: ["rgba(255,255,255,1)", "rgba(0,255,0,1)"],
      },
      blue: {
        name: "White to blue",
        value: ["rgba(255,255,255,1)", "rgba(0,0,255,1)"],
      },
      custard: {
        name: "custard",
        value: ["#FFFFFF", "#F8E71C", "rgba(245,166,35,1)", "rgba(0,0,0,1)"],
      },
    },
  },
  dataTransform: {
    name: "Transforms",
    inlineOptions: {
      default: { name: "Default", value: "default" },
      None: { name: "None", value: "None" },
    },
    generateOptions: (track) => {
      if (!track) {
        return [];
      }
      const inlineOptions = [];
      const { tilesetInfo } = track;
      if (tilesetInfo && tilesetInfo.transforms) {
        for (const transform of tilesetInfo.transforms) {
          inlineOptions.push({
            name: transform.name,
            value: transform.value,
          });
        }
      }
      return inlineOptions;
    },
  },
  maxZoom: {
    name: "Zoom limit",
    inlineOptions: {
      none: { name: "None", value: null },
    },
    generateOptions: (track) => {
      if (!track || !track.tilesetInfo) {
        return [];
      }
      const { tilesetInfo } = track;
      let maxZoom;
      if (tilesetInfo.resolutions) {
        maxZoom = tilesetInfo.resolutions.length - 1;
      } else {
        maxZoom = tilesetInfo["max_zoom"];
      }
      if (maxZoom) {
        const inlineOptions = [];

        for (let i = 0; i <= maxZoom; i++) {
          const maxWidth = tilesetInfo["max_width"];
          const binsPerDimension = tilesetInfo["bins_per_dimension"];

          let maxResolutionSize = 1;
          let resolution = 1;

          if (tilesetInfo.resolutions) {
            const sortedResolutions = tilesetInfo.resolutions
              .map((x) => +x)
              .sort((a, b) => b - a);
            [maxResolutionSize] = sortedResolutions;
            resolution = sortedResolutions[i];
          } else {
            resolution = maxWidth / (2 ** i * binsPerDimension);
            maxResolutionSize = maxWidth / (2 ** maxZoom * binsPerDimension);
          }

          // const pp = precisionPrefix(maxResolutionSize, resolution);
          // const f = formatPrefix(`.${pp}`, resolution);
          // const formattedResolution = f(resolution);

          inlineOptions.push({
            name: String(resolution),
            value: i.toString(),
          });
        }
        return inlineOptions;
      }
      return [];
    },
  },
};

export default OPTIONS_INFO;
