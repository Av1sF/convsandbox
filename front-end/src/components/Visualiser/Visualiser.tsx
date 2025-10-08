"use client";
import React, { useEffect, useRef, useState } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import VisualiserMenuBtn from "./VisualiserMenuBtn";
import { useElementSize } from "@/hooks/useElementSize";
import * as d3 from "d3";

export default function Visualiser() {
  const maxLayers = 5;
  const svgRef = useRef<SVGSVGElement>(null!);
  const { width: w, height: h } = useElementSize(svgRef);

  // --- State ---
  const [numLayers, setNumLayers] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);
  const [action, setAction] = useState<string | null>(null);
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
  useEffect(() => {
    if (!action || layers.length === 0) return;

    const svg = d3.select(svgRef.current);
    const root = svg.select(".d3-root");

    const latestLayerIndex = layers.length - 1;
    const latestLayer = layers[latestLayerIndex];
    const xOffset = (w / maxLayers) * latestLayerIndex;

    // Create a new <g> for this layer (React already created <g> placeholders, but D3 can append into root)
    const layerGroup = root
      .append("g")
      .attr("class", `layer-${latestLayerIndex}`)
      .attr("transform", `translate(${xOffset}, 0)`);

    // Background
    layerGroup
      .append("rect")
      .attr("width", w / maxLayers)
      .attr("height", h)
      .attr("class", "fill-bg");

    // --- D3 animation for convolutional layer ---
    if (latestLayer.type === "add-conv-layer") {
      // How much each square shifts diagonally
      const totalSquares = 5;
      const xOffset = 20;
      const squareSize = w / maxLayers - (totalSquares*xOffset) - 15;
      const yOffset = squareSize*(0.7) ; 

      const startX = w / (2 * maxLayers) - squareSize / 2 - xOffset;
      const startY = h / 2 - squareSize;

      for (let j = 0; j < totalSquares; j++) {
        layerGroup
          .append("rect")
          .attr("x", startX + j * xOffset)
          .attr("y", startY + j * yOffset)
          .attr("width", squareSize)
          .attr("height", squareSize)
          .attr("rx", 1)
          .attr("class", "fill-bg stroke-stroke")
          .style("opacity", 0)
          .transition()
          .duration(400)
          .delay(j * 150)
          .style("opacity", 1);
      }
    }

    // reset action after handling
    setAction(null);
  }, [action, layers, w, h]);

  return (
    <div className="w-full h-[80vh] rounded-md border border-bg-alt overflow-auto md:overflow-visible">
      <VisualiserCanvas
        id="canvas"
        ref={svgRef}
        className="md:w-full md:h-full w-[1183px] h-[840px] d3-root"
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
}
