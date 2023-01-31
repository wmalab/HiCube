import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import Backbone from "./Backbone";
import OverlaysTrack from "./OverlaysTrack";
import * as THREE from "three";

// props: exportSvg, onFinishExportSvg,
const Scene = (props) => {
  // TODO: export to svg format for downloading ------------------
  // const gl = useThree((state) => state.gl);
  const get = useThree((state) => state.get);
  const {
    groupPosition,
    chroms, // all chromosomes
    segmentData, // index by chrom
    chromColors,
    opacity,
    viewingBinRanges,
    viewingChroms,
    showViewRangeOnly,
    overlays,
    chromInfo,
    resolution,
    exportSvg,
    onFinishExportSvg,
    svgName,
  } = props;

  useEffect(() => {
    if (exportSvg) {
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(
        window.devicePixelRatio ? window.devicePixelRatio : 1
      );
      const { size, scene, camera } = get();
      const scale = 300 / 96;
      renderer.setSize(size.width * scale, size.height * scale);
      renderer.render(scene, camera);

      const link = document.createElement("a");
      link.setAttribute("download", `${svgName}.png`);
      link.setAttribute(
        "href",
        renderer.domElement
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream")
      );
      link.click();
      onFinishExportSvg();
    }
  }, [exportSvg]);
  // ------------------------------------------------------
  // TODO: make sure each dict has the key
  const backbones = [];
  for (const chrom of chroms) {
    if (!segmentData || !viewingBinRanges) {
      continue;
    }
    // check if this chrom is currently viewing
    const isViewing = viewingChroms && viewingChroms.includes(chrom);
    if (showViewRangeOnly && !isViewing) {
      continue;
    }
    // render not viewing chrom transparent
    if (segmentData[chrom]) {
      const color = (chromColors && chromColors[chrom]) || "gray";
      backbones.push(
        <Backbone
          key={chrom}
          segmentData={segmentData[chrom]}
          color={color}
          visible={isViewing}
          opacity={opacity}
          showViewRangeOnly={showViewRangeOnly}
          binRanges={viewingBinRanges[chrom]} // this can be undefined for not viewing chroms
        />
      );
    }
  }
  // ------------------------------------------------------

  // TODO: 2 parts of data to render: the backbone structure
  // and the overlays
  return (
    <group position={groupPosition}>
      <group>{backbones}</group>
      {segmentData && resolution && chromInfo && overlays && (
        <group>
          <OverlaysTrack
            overlays={overlays}
            chromInfo={chromInfo}
            resolution={resolution}
            segmentData={segmentData}
          />
        </group>
      )}
    </group>
  );
};

export default Scene;
