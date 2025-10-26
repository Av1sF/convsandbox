"use client";
import { useRef, useState } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import VisualiserMenuBtn from "./VisualiserMenuBtn";
import * as d3 from "d3";
import { drawConvLayer } from "@/utils/drawConvLayer";
import ConvLayerModal from "./Layers/ConvLayerModal";
import ActivationSelectModal from "./Layers/ActivationSelectModal";
import { ActivationType, ConvParams, LayerActionType, LayerDims, MAXLAYERS, UpsamplingParams, UpsamplingType, validLayerTypes } from '@/utils/types';
import { isActivationType, isConvParams, isUpsamplingParams } from "@/utils/typeGuards";
import UpsamplingSelectModal from "./Layers/UpsamplingSelectModal";

// Draw lines between layers
const W = 1183;
const H = 500;

interface Layer {
  type: LayerActionType;
  params?: ConvParams | ActivationType | UpsamplingParams | undefined;
}

export default function Visualiser() {
  // -- Constants --
  const svgRef = useRef<SVGSVGElement>(null!);
  const svg = d3.select(svgRef.current);
  const root = svg.select(".d3-root");

  // -- State initialisation --
  const initialLayers:Layer[] = [];
  const initialAction = "";

  const [started, setStarted] = useState<boolean>(false);
  const [action, setAction] = useState<LayerActionType>(initialAction);

  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationType, setActivationType] = useState<ActivationType | null>(
    null
  );

  const [showConvModal, setShowConvModal] = useState<boolean>(false);

  const [showUpsamplingModal, setShowUpsamplingModal] = useState<boolean>(false);
  const [upsamplingType, setUpsamplingType] = useState<UpsamplingType | null>(
    null
  );

  // Number of layers already created
  const [numLayers, setNumLayers] = useState<number>(0);
  // Store each created layer's type and dimensions
  const [layers, setLayers] = useState(initialLayers);
  // Store dimensions of the last layer created
  const [prevLayerDims, setPrevLayerDims] = useState<LayerDims | undefined>(
    undefined
  );
  const [allowedLayerTypes, setAllowedLayerTypes] = useState<validLayerTypes>({
    conv: true,
    activation: false,
    upsample: false, 
  });

  // -- Event handlers --

  // Visualiser Menu handler
  const handleMenuAction = (actionType: LayerActionType) => {
    setAction(actionType);

    switch(actionType) {
      case "add-conv-layer":
        setShowConvModal(true);
        return;

      case "add-activation":
        setShowActivationModal(true);
        return;

      case "add-upsampling":
        setShowUpsamplingModal(true);
        return; 
    }
    // Handle other actions...
  };

  const addLayer = (
    params: ConvParams | ActivationType | UpsamplingParams,
    layerType: LayerActionType
  ) => {
    if (numLayers < MAXLAYERS) {
      setNumLayers((prev) => prev + 1);
      setLayers((prev) => [...prev, { type: layerType, params }]);
    }
  };

  // Convolutional Layer Modal handler
  const handleConvConfirm = (params: ConvParams) => {
    addLayer(params, "add-conv-layer")
    setShowConvModal(false);

    // Viz only officially starts iff first layer is created
    if (!started) {
      setStarted(true);
    }
  };

  const handleActivationSelect = (activation: ActivationType) => {
    addLayer(activation, "add-activation");
    setShowActivationModal(false);
    setActivationType(activation);
  };

  const handleUpsamplingSelect = (params: UpsamplingParams) => {
    addLayer(params, "add-upsampling");
    setShowUpsamplingModal(false);
    setUpsamplingType(params.method); 
  };

  // -- Render Logic --
  if (
    action != initialAction &&
    showConvModal == false &&
    showActivationModal == false &&
    showUpsamplingModal == false &&
    started
  ) {
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
        console.log(allowedLayerTypes)
      // Draw Convolutional Layer
      if (
        latestLayer.type === "add-conv-layer" &&
        isConvParams(latestLayer.params)
      ) {
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

        setAllowedLayerTypes({
          ...allowedLayerTypes,
          conv: true,
          activation: true,
          upsample: true, 
        });
      }
      
      else if (
        latestLayer.type === "add-activation" &&
        isActivationType(latestLayer.params) &&
        prevLayerDims
      ) {
        drawConvLayer(
          W,
          H,
          prevLayerDims.depth,
          prevLayerDims.width,
          prevLayerDims.height,
          MAXLAYERS,
          layerGroup
        );

        layerGroup
          .append("text")
          .attr("x", W / (2 * MAXLAYERS))
          .attr("y", H * 0.15)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#333")
          .text(`Activation Layer`);

        layerGroup
          .append("text")
          .attr("x", W / (2 * MAXLAYERS))
          .attr("y", H * 0.85)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#333")
          .text(`${activationType}`);

        setPrevLayerDims({
          width: prevLayerDims.width,
          height: prevLayerDims.height,
          depth: prevLayerDims.depth,
        });

        setAllowedLayerTypes({
          ...allowedLayerTypes,
          activation: false,
          upsample: true, 
        });
      }

      else if (
        latestLayer.type === "add-upsampling" && 
        isUpsamplingParams(latestLayer.params) && 
        prevLayerDims
      ) {

        drawConvLayer(
          W,
          H,
          prevLayerDims.depth,
          prevLayerDims.width*latestLayer.params.scaleFactor,
          prevLayerDims.height*latestLayer.params.scaleFactor,
          MAXLAYERS,
          layerGroup
        );

        layerGroup
          .append("text")
          .attr("x", W / (2 * MAXLAYERS))
          .attr("y", H * 0.15)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#333")
          .text(`Upsampling Layer`);

        layerGroup
          .append("text")
          .attr("x", W / (2 * MAXLAYERS))
          .attr("y", H * 0.85)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#333")
          .text(`${upsamplingType}`);

        setPrevLayerDims({
          width: prevLayerDims.width,
          height: prevLayerDims.height*latestLayer.params.scaleFactor,
          depth: prevLayerDims.depth*latestLayer.params.scaleFactor,
        });

        setAllowedLayerTypes({
          conv: true,
          activation: true,
          upsample: true, 
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
        className={`w-[1183px] h-[500px] d3-root`}
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
            validLayerTypes={allowedLayerTypes}
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

      {showActivationModal && prevLayerDims && (
        <ActivationSelectModal
          onClose={() => setShowActivationModal(false)}
          onSelect={handleActivationSelect}
        />
      )}

      {showUpsamplingModal && prevLayerDims && (
        <UpsamplingSelectModal
          onClose={() => setShowUpsamplingModal(false)}
          onConfirm={handleUpsamplingSelect}
          prevDims={prevLayerDims}
        />
      )}
    </div>
  );
}
