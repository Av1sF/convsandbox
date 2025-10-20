"use client";
import React, { useRef, useState } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import VisualiserMenuBtn from "./VisualiserMenuBtn";
import * as d3 from "d3";
import { drawConvLayer } from "@/utils/drawConvLayer";
import ConvLayerModal, { ConvParams } from "./Layers/ConvLayerModal";

// Draw lines between layers
const MAXLAYERS = 5;
const W = 1183;
const H = 500;

export default function Visualiser() {
  // -- Constants --
  const svgRef = useRef<SVGSVGElement>(null!);
  const svg = d3.select(svgRef.current);
  const root = svg.select(".d3-root");

  // -- State initialisation --
  const initialLayers: {
    type: string;
    params?: ConvParams | undefined;
  }[] = [];
  const initialAction = "";

  const [started, setStarted] = useState<boolean>(false);
  const [action, setAction] = useState(initialAction);
  const [showConvModal, setShowConvModal] = useState<boolean>(false);
  // Number of layers already created
  const [numLayers, setNumLayers] = useState<number>(0);
  // Store each created layer's type and dimensions
  const [layers, setLayers] = useState(initialLayers);
  // Store dimensions of the last layer created
  const [prevLayerDims, setPrevLayerDims] = useState<
    | {
        width: number;
        height: number;
        depth: number;
      }
    | undefined
  >(undefined);

  // -- Event handlers --

  // Visualiser Menu handler
  const handleMenuAction = (actionType: string) => {
    setAction(actionType);

    if (actionType === "add-conv-layer") {
      setShowConvModal(true);
      return;
    }

    if (actionType === "add-activation") {
      return; 
    }
    // Handle other actions...
  };

  // Convolutional Layer Modal handler
  const handleConvConfirm = (params: ConvParams) => {
    setShowConvModal(false);

    if (numLayers < MAXLAYERS) {
      setNumLayers((prev) => prev + 1);
      setLayers((prev) => [...prev, { type: "add-conv-layer", params }]);
    }

    // Viz only officially starts iff first layer is created
    if (!started) setStarted(true);
  };

  // -- Render Logic --
  if (action != initialAction && showConvModal == false && started) {
    if (layers.length === 0) return;

    const latestLayerIndex = layers.length - 1;
    const latestLayer = layers[latestLayerIndex];
    const layerxOffset = (W / MAXLAYERS) * latestLayerIndex;

    // Layer Group
    const existingGroup = root.select(`.layer-${latestLayerIndex}`);
    let layerGroup;

    if (!existingGroup.empty()) {
      // Layer already exists no need to re-render
      // Used in the case user cancels on layer creation
      layerGroup = existingGroup;
    } else {
      // Create layer group
      layerGroup = root
        .append("g")
        .attr("class", `layer-${latestLayerIndex}`)
        .attr("transform", `translate(${layerxOffset}, 0)`);

      // Draw Convolutional Layer
      if (latestLayer.type === "add-conv-layer" && latestLayer.params) {
        drawConvLayer(
          W,
          H,
          latestLayer.params.depth,
          latestLayer.params.width,
          latestLayer.params.height,
          MAXLAYERS,
          layerGroup
        );

        // Maybe move into drawConvLayer 
        // But maybe not incase I want to add INITIAL conv layer for eg. 
        layerGroup
          .append("text")
          .attr("x", W / (2 * MAXLAYERS))
          .attr("y", H * 0.15)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#333")
          .text(`Convolutional Layer`);

        layerGroup
          .append("text")
          .attr("x", W / (2 * MAXLAYERS))
          .attr("y", H * 0.85)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#333")
          .text(
            `${latestLayer.params.height} x ${latestLayer.params.width} x ${latestLayer.params.depth}`
          );

        setPrevLayerDims({
          width: latestLayer.params.width,
          height: latestLayer.params.height,
          depth: latestLayer.params.depth,
        });
      }
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
        {numLayers < MAXLAYERS && (
          <VisualiserMenuBtn
            x={(W / MAXLAYERS) * numLayers}
            y={0}
            width={W / MAXLAYERS}
            height={H}
            onAction={handleMenuAction}
            showLabel={!started}
          />
        )}
      </VisualiserCanvas>

      {showConvModal && (
        <ConvLayerModal
          prevDims={prevLayerDims}
          onClose={() => setShowConvModal(false)}
          onConfirm={handleConvConfirm}
          hasStarted={started}
        />
      )}
    </div>
  );
}
