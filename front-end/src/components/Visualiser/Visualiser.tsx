"use client";
import React, { useRef, useState } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import VisualiserMenuBtn from "./VisualiserMenuBtn";
import { useElementSize } from "@/hooks/useElementSize";
import * as d3 from "d3";
import { drawConvLayer } from "@/utils/drawConvLayer";
import ConvLayerModal, { ConvParams } from "./Layers/ConvLayerModal";

export default function Visualiser() {
  const maxLayers = 5;
  const svgRef = useRef<SVGSVGElement>(null!);

  const w = 1183;
  const h = 500;

  // --- State ---
  const [numLayers, setNumLayers] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);
  const initialAction = "";
  const [action, setAction] = useState(initialAction);
  const initialLayers: {
    type: string;
    params?: ConvParams | undefined;
  }[] = [];
  const [layers, setLayers] = useState(initialLayers);
  const [showConvModal, setShowConvModal] = useState<boolean>(false);

  // --- Handle user clicking menu button ---
  const handleMenuAction = (actionType: string) => {
    setAction(actionType);
    if (!started) setStarted(true);

    if (actionType === "add-conv-layer") {
      setShowConvModal(true);
      setAction(actionType);
      return;
    }

    // Handle other actions...
    setAction(actionType);
  };

  // --- Handle confirmation of modal ---
  const handleConvConfirm = (params: ConvParams) => {
    setShowConvModal(false);
    setAction("add-conv-layer");

    if (numLayers < maxLayers) {
      setNumLayers((prev) => prev + 1);
      setLayers((prev) => [...prev, { type: "add-conv-layer", params }]);
    }
  };

  // --- Use D3 to draw on layer creation ---
  if (action != initialAction && showConvModal == false) {
    if (!action || layers.length === 0) return;

    const svg = d3.select(svgRef.current);
    const root = svg.select(".d3-root");

    const latestLayerIndex = layers.length - 1;
    const latestLayer = layers[latestLayerIndex];
    const layerxOffset = (w / maxLayers) * latestLayerIndex;

    // Create a new <g> for this layer (React already created <g> placeholders, but D3 can append into root)
    const layerGroup = root
      .append("g")
      .attr("class", `layer-${latestLayerIndex}`)
      .attr("transform", `translate(${layerxOffset}, 0)`);

    // Background
    layerGroup
      .append("rect")
      .attr("width", w / maxLayers)
      .attr("height", h)
      .attr("class", "fill-bg");

    // --- D3 animation for convolutional layer ---
    if (latestLayer.type === "add-conv-layer" && latestLayer.params) {
      drawConvLayer(
        w,
        h,
        latestLayer.params.depth,
        latestLayer.params.width,
        latestLayer.params.height,
        maxLayers,
        layerGroup
      );
    }

    // reset action after handling
    setAction("");
  }

  return (
    <div className="w-full md:w-[1183px] md:h-[90vh] h-[500px] rounded-md border border-bg-alt overflow-auto md:overflow-hidden">
      <VisualiserCanvas
        id="canvas"
        ref={svgRef}
        className={"w-[1183px] h-[500px] d3-root"}
      >
        {/* Only render the button if fewer than max layers exist */}
        {numLayers < maxLayers && (
          <VisualiserMenuBtn
            x={(w / maxLayers) * numLayers}
            y={0}
            width={w / maxLayers}
            height={h}
            onAction={handleMenuAction}
            showLabel={!started}
          />
        )}
      </VisualiserCanvas>

      {showConvModal && (
        <ConvLayerModal
          onClose={() => setShowConvModal(false)}
          onConfirm={handleConvConfirm}
        />
      )}
    </div>
  );
}
