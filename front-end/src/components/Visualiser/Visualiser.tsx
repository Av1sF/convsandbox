"use client";
import { useRef, useState } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import VisualiserMenuBtn from "./VisualiserMenuBtn";
import * as d3 from "d3";
import { drawConvLayer } from "@/utils/drawConvLayer";
import ConvLayerModal from "./Layers/ConvLayerModal";
import ActivationSelectModal from "./Layers/ActivationSelectModal";
import {
  ActivationType,
  convLayerDims,
  ConvParams,
  denseLayerDims,
  DownsamplingParams,
  DownsamplingType,
  LayerActionType,
  LayerConnections,
  LayerDims,
  MAXLAYERS,
  UpsamplingParams,
  UpsamplingType,
  validLayerTypes,
} from "@/utils/types";
import {
  isActivationType,
  isConvLayerDims,
  isConvParams,
  isDenseLayerDims,
  isDownsamplingParams,
  isNumberParam,
  isUpsamplingParams,
} from "@/utils/typeGuards";
import UpsamplingSelectModal from "./Layers/UpsamplingSelectModal";
import drawLayerConnections from "@/utils/drawLayerConnection";
import DownsamplingSelectModal from "./Layers/DownsamplingSelectModal";
import DenseLayerModal from "./Layers/DenseLayerModal";
import { drawNeurons } from "@/utils/drawNeurons";

// Draw lines between layers
const W = 1183;
const H = 500;

interface Layer {
  type: LayerActionType;
  params?:
    | ConvParams
    | ActivationType
    | UpsamplingParams
    | DownsamplingParams
    | number
    | undefined;
}

export default function Visualiser() {
  // -- Constants --
  const svgRef = useRef<SVGSVGElement>(null!);
  const svg = d3.select(svgRef.current);
  const root = svg.select(".d3-root");

  // -- State initialisation --
  // An array to store all layers' midpoints
  const [allLayerConnections, setAllLayerConnections] = useState<
    LayerConnections[]
  >([]);
  const initialLayers: Layer[] = [];
  const initialAction = "";

  const [started, setStarted] = useState<boolean>(false);
  const [action, setAction] = useState<LayerActionType>(initialAction);

  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationType, setActivationType] = useState<ActivationType | null>(
    null
  );

  const [showConvModal, setShowConvModal] = useState<boolean>(false);

  const [showUpsamplingModal, setShowUpsamplingModal] =
    useState<boolean>(false);
  const [upsamplingType, setUpsamplingType] = useState<UpsamplingType | null>(
    null
  );

  const [showDownsamplingModal, setShowDownsamplingModal] =
    useState<boolean>(false);
  const [downsamplingType, setDownsamplingType] =
    useState<DownsamplingType | null>(null);

  const [showDenseModal, setshowDenseModal] = useState<boolean>(false);

  // Number of layers already created
  const [numLayers, setNumLayers] = useState<number>(0);
  // Store each created layer's type and dimensions
  const [layers, setLayers] = useState(initialLayers);
  // Store dimensions of the last layer created
  const [prevLayerDims, setPrevLayerDims] = useState<
    convLayerDims | denseLayerDims | undefined
  >(undefined);
  const [allowedLayerTypes, setAllowedLayerTypes] = useState<validLayerTypes>({
    conv: true,
    activation: false,
    upsample: false,
    downsample: false,
    dense: false,
  });

  // -- Event handlers --

  // Visualiser Menu handler
  const handleMenuAction = (actionType: LayerActionType) => {
    setAction(actionType);

    switch (actionType) {
      case "add-conv-layer":
        setShowConvModal(true);
        return;

      case "add-activation":
        setShowActivationModal(true);
        return;

      case "add-upsampling":
        setShowUpsamplingModal(true);
        return;

      case "add-downsampling":
        setShowDownsamplingModal(true);
        return;

      case "add-dense-layer":
        setshowDenseModal(true);
        return;
    }
    // Handle other actions...
  };

  const addLayer = (
    params:
      | ConvParams
      | ActivationType
      | UpsamplingParams
      | DownsamplingParams
      | number,
    layerType: LayerActionType
  ) => {
    if (numLayers < MAXLAYERS) {
      if (layerType != "add-activation") {
        setNumLayers((prev) => prev + 1);
      }
      setLayers((prev) => [...prev, { type: layerType, params }]);
    }
  };

  // Convolutional Layer Modal handler
  const handleConvConfirm = (params: ConvParams) => {
    addLayer(params, "add-conv-layer");
    setShowConvModal(false);

    // Viz only officially starts iff first layer is created
    if (!started) {
      setStarted(true);
    }
  };

  const handleActivationSelect = (activation: ActivationType) => {
    addLayer(activation, "add-activation");
    console.log('meh')
    setShowActivationModal(false);
    setActivationType(activation);
  };

  const handleUpsamplingSelect = (params: UpsamplingParams) => {
    addLayer(params, "add-upsampling");
    setShowUpsamplingModal(false);
    setUpsamplingType(params.method);
  };

  const handleDownsamplingSelect = (params: DownsamplingParams) => {
    addLayer(params, "add-downsampling");
    setShowDownsamplingModal(false);
    setDownsamplingType(params.type);
  };

  const handleDenseNeuronSelect = (params: number) => {
    console.log("ge");
    addLayer(params, "add-dense-layer");
    setshowDenseModal(false);
  };

  // -- Render Logic --
  if (
    action != initialAction &&
    showConvModal == false &&
    showActivationModal == false &&
    showUpsamplingModal == false &&
    showDownsamplingModal == false &&
    showDenseModal == false &&
    started
  ) {
    if (layers.length === 0) return;

    // const latestLayerIndex = layers.length - 1;
    const latestLayer = layers[layers.length - 1];
    const layerxOffset = (W / MAXLAYERS) * (numLayers - 1);

    // Layer Group
    const existingGroup = root.select(`.layer-${numLayers - 1}`);
    let layerGroup;
    let layerConnections: LayerConnections | undefined = undefined;

    if (!existingGroup.empty()) {
      // Layer already exists no need to re-render
      // Used in the case user cancels on layer creation
      layerGroup = existingGroup;

      if (
        latestLayer.type === "add-activation" &&
        isActivationType(latestLayer.params)
      ) {
        layerGroup
          .append("text")
          .attr("x", W / (2 * MAXLAYERS))
          .attr("y", H * 0.19)
          .attr("text-anchor", "middle")
          .classed("font-alt", true)
          .attr("font-size", 12)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text(`${activationType}`);

        if (isConvLayerDims(prevLayerDims)) {
          setAllowedLayerTypes({
            ...allowedLayerTypes,
            activation: false,
            upsample: true,
            downsample: true,
            dense: true,
          });
        } else if (isDenseLayerDims(prevLayerDims)) {
          setAllowedLayerTypes({
            ...allowedLayerTypes,
            activation: false,
            upsample: false,
            downsample: false,
            dense: true,
            conv: false
          });
        }
  
      }
    } else {
      // Create layer group
      layerGroup = root
        .append("g")
        // .attr("class", "layer")
        .attr("class", `layer-${numLayers-1}`)
        .attr("transform", `translate(${layerxOffset}, 0)`);

      // Draw Convolutional Layer
      if (
        latestLayer.type === "add-conv-layer" &&
        isConvParams(latestLayer.params)
      ) {
        layerConnections = drawConvLayer(
          W,
          H,
          latestLayer.params.depth,
          latestLayer.params.width,
          latestLayer.params.height,
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
          downsample: true,
          dense: true,
        });
      } else if (
        latestLayer.type === "add-upsampling" &&
        isUpsamplingParams(latestLayer.params) &&
        isConvLayerDims(prevLayerDims)
      ) {
        layerConnections = drawConvLayer(
          W,
          H,
          prevLayerDims.depth,
          prevLayerDims.width * latestLayer.params.scaleFactor,
          prevLayerDims.height * latestLayer.params.scaleFactor,
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
          .attr("y", H * 0.15 + 16)
          .attr("text-anchor", "middle")
          .attr("font-size", 10)
          .attr("fill", "#333")
          .attr("opacity", 0.8)
          .text(`${upsamplingType}`);

        layerGroup
          .append("text")
          .attr("x", W / (2 * MAXLAYERS))
          .attr("y", H * 0.85)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#333")
          .text(
            `${prevLayerDims.height * latestLayer.params.scaleFactor} x ${
              prevLayerDims.width * latestLayer.params.scaleFactor
            } x ${prevLayerDims.depth}`
          );

        setPrevLayerDims({
          width: prevLayerDims.width * latestLayer.params.scaleFactor,
          height: prevLayerDims.height * latestLayer.params.scaleFactor,
          depth: prevLayerDims.depth,
        });

        setAllowedLayerTypes({
          conv: true,
          activation: true,
          upsample: true,
          downsample: true,
          dense: true,
        });
      } else if (
        latestLayer.type === "add-downsampling" &&
        isDownsamplingParams(latestLayer.params) && // change param so it can draw
        prevLayerDims
      ) {
        layerConnections = drawConvLayer(
          W,
          H,
          latestLayer.params.outputDims.depth,
          latestLayer.params.outputDims.width,
          latestLayer.params.outputDims.height,
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
          .text(`Pooling Layer`);

        layerGroup
          .append("text")
          .attr("x", W / (2 * MAXLAYERS))
          .attr("y", H * 0.15 + 16)
          .attr("text-anchor", "middle")
          .attr("font-size", 10)
          .attr("fill", "#333")
          .attr("opacity", 0.8)
          .text(`${downsamplingType}`);

        layerGroup
          .append("text")
          .attr("x", W / (2 * MAXLAYERS))
          .attr("y", H * 0.85)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#333")
          .text(
            `${latestLayer.params.outputDims.height} x ${latestLayer.params.outputDims.width} x ${latestLayer.params.outputDims.depth}`
          );

        setPrevLayerDims({
          width: latestLayer.params.outputDims.width,
          height: latestLayer.params.outputDims.height,
          depth: latestLayer.params.outputDims.depth,
        });

        setAllowedLayerTypes({
          conv: true,
          activation: true,
          upsample: true,
          downsample: true,
          dense: true,
        });
      } else if (
        latestLayer.type === "add-dense-layer" &&
        isNumberParam(latestLayer.params) // change param so it can draw
      ) {
        var string = latestLayer.params == 1 ? "neuron" : "neurons";

        layerConnections = drawNeurons(
          W,
          H,
          latestLayer.params,
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
          .text(`Dense Layer`);

        layerGroup
          .append("text")
          .attr("x", W / (2 * MAXLAYERS))
          .attr("y", H * 0.85)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("fill", "#333")
          .text(`${latestLayer.params} ${string}`);

        setAllowedLayerTypes({
          conv: false,
          activation: true,
          upsample: false,
          downsample: false,
          dense: true,
        });

        setPrevLayerDims({
          neurons: latestLayer.params,
        });
      }

      if (layerConnections) {
        allLayerConnections.push(layerConnections);
        setAllLayerConnections([...allLayerConnections]);
        if (allLayerConnections.length > 1) {
          drawLayerConnections(
            root,
            allLayerConnections,
            layers[layers.length - 2].type,
            latestLayer.type
          );
        }
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
            y={-50} // was 0
            width={W / MAXLAYERS}
            height={H}
            onAction={handleMenuAction}
            showLabel={!started}
            validLayerTypes={allowedLayerTypes}
          />
        )}
      </VisualiserCanvas>

      {showConvModal &&
        (prevLayerDims === undefined || isConvLayerDims(prevLayerDims)) && (
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

      {showUpsamplingModal && isConvLayerDims(prevLayerDims) && (
        <UpsamplingSelectModal
          onClose={() => setShowUpsamplingModal(false)}
          onConfirm={handleUpsamplingSelect}
          prevDims={prevLayerDims}
        />
      )}

      {showDownsamplingModal && isConvLayerDims(prevLayerDims) && (
        <DownsamplingSelectModal
          onClose={() => setShowDownsamplingModal(false)}
          onConfirm={handleDownsamplingSelect}
          prevDims={prevLayerDims}
        />
      )}

      {showDenseModal && (
        <DenseLayerModal
          onClose={() => setShowDownsamplingModal(false)}
          onConfirm={handleDenseNeuronSelect}
        />
      )}
    </div>
  );
}
