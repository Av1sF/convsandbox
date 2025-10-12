"use client";
import React, { useRef, useState } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import VisualiserMenuBtn from "./VisualiserMenuBtn";
import { useElementSize } from "@/hooks/useElementSize";
import * as d3 from "d3";
import { drawConvLayer } from "@/utils/drawConvLayer";

export default function Visualiser() {
  const maxLayers = 5;
  const svgRef = useRef<SVGSVGElement>(null!);
  // let { width: w, height: h } = useElementSize(svgRef);
  const w = 1183;
  const h = 500; 

  // --- State ---
  const [numLayers, setNumLayers] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);
  const initialAction = ""; 
  const [action, setAction] = useState(initialAction);
  const [layers, setLayers] = useState<{ type: string }[]>([]);

  // --- Handle user clicking menu button ---
  const handleMenuAction = (actionType: string) => {
    setAction(actionType);
    if (!started) setStarted(true);

    if (numLayers < maxLayers) {
      setNumLayers((prev) => prev + 1);
      setLayers((prev) => [...prev, { type: actionType }]);
    }
  };

  // --- Use D3 to draw on layer creation ---
  if ((action != initialAction) ) {
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
    if (latestLayer.type === "add-conv-layer") {
      drawConvLayer(
        w, 
        h, 
        4, // Depth
        25, // Width
        25, // Height 
        maxLayers,
        layerGroup,
        layerxOffset
      )
    };


    // reset action after handling
    setAction("");
  };

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

    </div>
  );
};
