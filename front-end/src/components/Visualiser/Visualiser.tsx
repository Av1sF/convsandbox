"use client";
import React, { useRef, useState } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import VisualiserMenuBtn from "./VisualiserMenuBtn";
import * as d3 from "d3";
import { drawConvLayer } from "@/utils/drawConvLayer";
import ConvLayerModal, { ConvParams } from "./Layers/ConvLayerModal";

// TODO --> Add equations -> Kernals formula
// Draw lines between layers

export default function Visualiser() {
  // -- Constants --
  const maxLayers = 5;
  const w = 1183;
  const h = 500;
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

    // Handle other actions...
  };

  // Convolutional Layer Modal handler
  const handleConvConfirm = (params: ConvParams) => {
    setShowConvModal(false);

    if (numLayers < maxLayers) {
      setNumLayers((prev) => prev + 1);
      setLayers((prev) => [...prev, { type: "add-conv-layer", params }]);
    }

    // Viz only officially starts iff first layer is created
    if (!started) setStarted(true);
  };

  // -- Render Logic --
  if (action != initialAction && showConvModal == false) {
    if (layers.length === 0) return;

    const latestLayerIndex = layers.length - 1;
    const latestLayer = layers[latestLayerIndex];
    const layerxOffset = (w / maxLayers) * latestLayerIndex;

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
          w,
          h,
          latestLayer.params.depth,
          latestLayer.params.width,
          latestLayer.params.height,
          maxLayers,
          layerGroup
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
          prevDims={prevLayerDims}
          onClose={() => setShowConvModal(false)}
          onConfirm={handleConvConfirm}
          hasStarted={started}
        />
      )}
    </div>
  );
}
