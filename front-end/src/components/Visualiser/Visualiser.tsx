"use client";
import { useRef, useState } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import VisualiserMenuBtn from "./VisualiserMenuBtn";
import * as d3 from "d3";
import { drawStackedConvLayer } from "@/utils/drawStackedConvLayer";
import ConvLayerModal from "./LayerModals/ConvLayerModal";
import ActivationSelectModal from "./LayerModals/ActivationSelectModal";
import {
  ActivationType,
  convLayerDims,
  ConvParams,
  denseLayerDims,
  DownsamplingParams,
  DownsamplingType,
  dummyModelOutputs,
  Layer,
  LayerActionType,
  LayerConnections,
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
import UpsamplingSelectModal from "./LayerModals/UpsamplingSelectModal";
import drawLayerConnections from "@/utils/drawLayerConnection";
import DownsamplingSelectModal from "./LayerModals/DownsamplingSelectModal";
import DenseLayerModal from "./LayerModals/DenseLayerModal";
import { drawNeurons } from "@/utils/drawNeurons";
import { addLayerLabel } from "@/utils/addLayerLabel";
import {
  setActivationLayer,
  setConvLayer,
  setDenseLayer,
  setDownsamplingLayer,
  setInputLayer,
  setUpsamplingLayer,
} from "@/utils/DummyModel";
import VisualiserSmallPlusBtn from "./VisualiserSmallPlusBtn";
import binSearchInterval from "@/utils/binSearchInterval";
import ConvAnimationModal from "./AnimationModals/ConvAnimationModal";
import DenseAnimationModal from "./AnimationModals/DenseAnimationModal";
import DownsampleAnimationModal from "./AnimationModals/DownsampleAnimationModal";
import { ParameterCount } from "./CalculationModals/ParameterCount";

const W = 1183;
const H = 500;

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

  const [menuAnnotation, setMenuAnnotation] = useState<string>("");

  const initialLayers: Layer[] = [];
  const initialAction = "";

  const [started, setStarted] = useState<boolean>(false);
  const [action, setAction] = useState<LayerActionType>(initialAction);

  // Number of layers already created
  const [numLayers, setNumLayers] = useState<number>(0);

  // Store each created layer's type and dimensions
  const [layers, setLayers] = useState(initialLayers);

  // Dummy Model
  const [tensorLayers, setTensorLayers] = useState<dummyModelOutputs[]>([]);

  // Initiate Animate Click areas
  interface animationTrigger {
    layerNumber: number[];
    triggerArea: number[];
    animationType: keyof typeof animationModals;
  }
  const [animationTriggers, setAnimationTriggers] = useState<
    animationTrigger[]
  >([]);

  const [currAnimationTrigger, setCurrAnimationTrigger] =
    useState<animationTrigger>();

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

  const [animationModals, setAnimationModals] = useState({
    conv: false,
    downsample: false,
    dense: false,
  });

  const openAnimationModal = (key: keyof typeof animationModals) => {
    setAnimationModals((m) => ({ ...m, [key]: true }));
  };
  const closeAnimationModal = (key: keyof typeof animationModals) =>
    setAnimationModals((m) => ({ ...m, [key]: false }));

  const [layerModals, setLayerModals] = useState({
    conv: false,
    activation: false,
    upsample: false,
    downsample: false,
    dense: false,
  });

  const openLayerModal = (key: keyof typeof layerModals) =>
    setLayerModals((m) => ({ ...m, [key]: true }));

  const closeLayerModal = (key: keyof typeof layerModals) =>
    setLayerModals((m) => ({ ...m, [key]: false }));

  const allLayerModalsClosed = Object.values(layerModals).every((m) => !m);

  const layerModalMap: Record<LayerActionType, keyof typeof layerModals> = {
    "": "conv",
    "add-conv-layer": "conv",
    "add-activation": "activation",
    "add-upsampling": "upsample",
    "add-downsampling": "downsample",
    "add-dense-layer": "dense",
  };

  // -- Modal State initialisation --
  const [activationType, setActivationType] = useState<ActivationType | null>(
    null
  );
  const [upsamplingType, setUpsamplingType] = useState<UpsamplingType | null>(
    null
  );
  const [downsamplingType, setDownsamplingType] =
    useState<DownsamplingType | null>(null);

  // -- Event handlers --

  // Visualiser Menu handler
  const handleMenuAction = (type: LayerActionType) => {
    setAction(type);
    openLayerModal(layerModalMap[type]);
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
    if (numLayers <= MAXLAYERS) {
      if (layerType != "add-activation" || numLayers === MAXLAYERS) {
        setNumLayers((prev) => prev + 1);
      }
      setLayers((prev) => [...prev, { type: layerType, params }]);
    }
  };

  const handleVisualiserClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const { x, y } = svgP;

    const triggerIndex = binSearchInterval(
      x,
      animationTriggers.map((a) => a.triggerArea),
      animationTriggers.length - 1,
      0
    );

    if (triggerIndex != undefined) {
      setCurrAnimationTrigger(animationTriggers[triggerIndex]);
      openAnimationModal(animationTriggers[triggerIndex].animationType);
    }
  };

  // Convolutional Layer Modal handler
  const handleConvConfirm = (params: ConvParams) => {
    addLayer(params, "add-conv-layer");
    closeLayerModal("conv");

    // Viz only officially starts iff first layer is created
    if (!started) {
      setStarted(true);

      const gradient = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", "opacityGradient")
        .attr("x1", "0%") // Start at the left edge
        .attr("y1", "0%")
        .attr("x2", "100%") // End at the right edge
        .attr("y2", "0%");

      // Two stops: full opacity at top, transparent at bottom
      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#5f6c7b")
        .attr("stop-opacity", 1);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#5f6c7b")
        .attr("stop-opacity", 0);

      // Draw the gradient bar (200px tall, centered vertically)
      svg
        .append("rect")
        .attr("x", 950)
        .attr("y", 460)
        .attr("width", 200)
        .attr("height", 25)
        .attr("id", "Gradient")
        .style("fill", "url(#opacityGradient)");

      // Add value labels
      svg
        .append("text")
        .attr("x", 950)
        .attr("y", 500)
        .attr("text-anchor", "middle")
        .text("2.00")
        .attr("font-size", "12px")
        .attr("fill", "#333");

      svg
        .append("text")
        .attr("x", 1150)
        .attr("y", 500)
        .attr("text-anchor", "middle")
        .text("-2.00")
        .attr("font-size", "12px")
        .attr("fill", "#333");

      svg
        .append("text")
        .attr("x", 1050)
        .attr("y", 500)
        .attr("text-anchor", "middle")
        .text("0")
        .attr("font-size", "12px")
        .attr("fill", "#333");
    }
  };

  // Activation Modal handler
  const handleActivationSelect = (activation: ActivationType) => {
    addLayer(activation, "add-activation");
    closeLayerModal("activation");
    setActivationType(activation);
  };

  // Upsampling Modal handler
  const handleUpsamplingSelect = (params: UpsamplingParams) => {
    addLayer(params, "add-upsampling");
    closeLayerModal("upsample");
    setUpsamplingType(params.method);
  };

  // Downsampling Modal handler
  const handleDownsamplingSelect = (params: DownsamplingParams) => {
    addLayer(params, "add-downsampling");
    closeLayerModal("downsample");
    setDownsamplingType(params.type);
  };

  // Dense layer Modal handler
  const handleDenseNeuronSelect = (params: number) => {
    addLayer(params, "add-dense-layer");
    closeLayerModal("dense");
  };

  const animationModalComponents = {
    conv: (
      <div key="conv-animation">
        <ConvAnimationModal
          onClose={() => closeAnimationModal("conv")}
          layerIndex={
            currAnimationTrigger ? currAnimationTrigger.layerNumber : []
          }
          tensorLayers={tensorLayers}
        />
      </div>
    ),
    downsample: (
      <div key="downsample-animation">
        <DownsampleAnimationModal
          onClose={() => closeAnimationModal("downsample")}
          layerIndex={
            currAnimationTrigger ? currAnimationTrigger.layerNumber : []
          }
          tensorLayers={tensorLayers}
        />
      </div>
    ),
    dense: (
      <div key="dense-animation">
        <DenseAnimationModal
          onClose={() => closeAnimationModal("dense")}
          layerIndex={
            currAnimationTrigger ? currAnimationTrigger.layerNumber : []
          }
          tensorLayers={tensorLayers}
        />
      </div>
    ),
  };

  const layerModalComponents = {
    conv: (
      <div key="conv">
        <ConvLayerModal
          prevDims={prevLayerDims as convLayerDims}
          onClose={() => closeLayerModal("conv")}
          onConfirm={handleConvConfirm}
          hasStarted={started}
        />
      </div>
    ),
    activation: (
      <div key="activation">
        <ActivationSelectModal
          onClose={() => closeLayerModal("activation")}
          onSelect={handleActivationSelect}
        />
      </div>
    ),
    upsample: (
      <div key="upsample">
        <UpsamplingSelectModal
          prevDims={prevLayerDims as convLayerDims}
          onClose={() => closeLayerModal("upsample")}
          onConfirm={handleUpsamplingSelect}
        />
      </div>
    ),
    downsample: (
      <div key="downsample">
        <DownsamplingSelectModal
          prevDims={prevLayerDims as convLayerDims}
          onClose={() => closeLayerModal("downsample")}
          onConfirm={handleDownsamplingSelect}
        />
      </div>
    ),
    dense: (
      <div key="dense">
        <DenseLayerModal
          onClose={() => closeLayerModal("dense")}
          onConfirm={handleDenseNeuronSelect}
        />
      </div>
    ),
  };

  // -- Render Logic --
  if (action != initialAction && allLayerModalsClosed && started) {
    if (layers.length === 0) return;

    const latestLayer = layers[layers.length - 1];
    const layerxOffset = (W / MAXLAYERS) * (numLayers - 1);
    const layerLabelx = W / (2 * MAXLAYERS);

    // Layer Group
    const existingGroup = root.select(
      `.layer-${Math.min(numLayers, MAXLAYERS) - 1}`
    );
    let layerGroup;
    let layerConnections: LayerConnections | undefined = undefined;

    if (!existingGroup.empty()) {
      // Layer already exists no need to re-render
      layerGroup = existingGroup;

      if (
        latestLayer.type === "add-activation" &&
        isActivationType(latestLayer.params) &&
        existingGroup
          .select(`#${(activationType as string).replaceAll(" ", "-")}`)
          .empty()
      ) {
        if (prevLayerDims && isConvLayerDims(prevLayerDims)) {
          tensorLayers.push(
            setActivationLayer(
              latestLayer.params as ActivationType,
              tensorLayers[tensorLayers.length - 1].output,
              undefined,
              {
                height: prevLayerDims.height,
                width: prevLayerDims.width,
                depth: prevLayerDims.depth,
              }
            )
          );

          drawStackedConvLayer(
            W,
            H,
            prevLayerDims.depth,
            prevLayerDims.width,
            prevLayerDims.height,
            MAXLAYERS,
            layerGroup,
            tensorLayers[tensorLayers.length - 1].output.arraySync()
          );

          if (layers[layers.length - 2].type == "add-conv-layer") {
            setAnimationTriggers((prev) => [
              ...prev,
              {
                // Activation    convolution     input layer
                layerNumber: [
                  layers.length - 1,
                  layers.length - 2,
                  layers.length - 3,
                ],
                triggerArea: [
                  allLayerConnections[allLayerConnections.length - 2][1][0].x,
                  allLayerConnections[allLayerConnections.length - 1][0][0].x,
                ],
                animationType: "conv",
              },
            ]);
          }
        } else if (prevLayerDims && isDenseLayerDims(prevLayerDims)) {
          tensorLayers.push(
            setActivationLayer(
              latestLayer.params as ActivationType,
              tensorLayers[tensorLayers.length - 1].output,
              prevLayerDims.neurons
            )
          );

          drawNeurons(
            W,
            H,
            prevLayerDims.neurons,
            MAXLAYERS,
            layerGroup,
            tensorLayers[tensorLayers.length - 1].output.arraySync()
          );
        }
        setTensorLayers([...tensorLayers]);

        const yText =
          layers[layers.length - 2].type == "add-downsampling" ||
          layers[layers.length - 2].type == "add-upsampling"
            ? 0.81
            : 0.19;

        addLayerLabel(
          layerLabelx,
          H * yText,
          layerGroup,
          `${activationType}`,
          12
        );

        // Determine next valid layer selections
        if (isConvLayerDims(prevLayerDims)) {
          setAllowedLayerTypes({
            ...allowedLayerTypes,
            conv: true,
            activation: false,
            upsample: true,
            downsample: true,
            dense: true,
          });

          setMenuAnnotation(
            "Upsampling restores resolution, pooling downsamples for features, dense layers classify/regress."
          );
        } else if (isDenseLayerDims(prevLayerDims)) {
          setAllowedLayerTypes({
            ...allowedLayerTypes,
            activation: false,
            upsample: false,
            downsample: false,
            dense: true,
            conv: false,
          });
          setMenuAnnotation("");
        }
      }
    } else {
      // Create layer group
      layerGroup = root
        .append("g")
        .attr("class", `layer-${numLayers - 1}`)
        .attr("transform", `translate(${layerxOffset}, 0)`);

      // Draw Convolutional Layer
      if (
        latestLayer.type === "add-conv-layer" &&
        isConvParams(latestLayer.params)
      ) {
        addLayerLabel(
          layerLabelx,
          H * 0.15,
          layerGroup,
          `${layers.length == 1 ? "Input" : "Convolutional Layer"}`
        );

        addLayerLabel(
          layerLabelx,
          H * 0.85,
          layerGroup,
          `${latestLayer.params.height} x ${latestLayer.params.width} x ${latestLayer.params.depth}`
        );

        setPrevLayerDims({
          width: latestLayer.params.width,
          height: latestLayer.params.height,
          depth: latestLayer.params.depth,
        });

        // Determine next valid layer selection
        if (numLayers == 1) {
          setAllowedLayerTypes({
            ...allowedLayerTypes,
            conv: true,
            activation: false,
            upsample: true,
            downsample: true,
            dense: false,
          });

          setMenuAnnotation(
            "After input, a convolution is normally applied to extract features from raw pixels. But feel free to experiment!"
          );

          tensorLayers.push(setInputLayer(latestLayer.params as convLayerDims));
          setTensorLayers([...tensorLayers]);
        } else {
          setAllowedLayerTypes({
            ...allowedLayerTypes,
            conv: false,
            activation: true,
            upsample: false,
            downsample: false,
            dense: false,
          });

          setMenuAnnotation(
            "Applying activations introduces non-linearity; otherwise, the CNN collapses to linear regression."
          );

          tensorLayers.push(
            setConvLayer(
              latestLayer.params as ConvParams,
              tensorLayers[tensorLayers.length - 1].output
            )
          );
          setTensorLayers([...tensorLayers]);
        }

        layerConnections = drawStackedConvLayer(
          W,
          H,
          latestLayer.params.depth,
          latestLayer.params.width,
          latestLayer.params.height,
          MAXLAYERS,
          layerGroup,
          tensorLayers[tensorLayers.length - 1].output.arraySync()
        );
      } else if (
        latestLayer.type === "add-upsampling" &&
        isUpsamplingParams(latestLayer.params) &&
        isConvLayerDims(prevLayerDims)
      ) {
        tensorLayers.push(
          setUpsamplingLayer(
            latestLayer.params as UpsamplingParams,
            tensorLayers[tensorLayers.length - 1].output
          )
        );
        setTensorLayers([...tensorLayers]);

        layerConnections = drawStackedConvLayer(
          W,
          H,
          latestLayer.params.outputDims.depth,
          latestLayer.params.outputDims.width,
          latestLayer.params.outputDims.height,
          MAXLAYERS,
          layerGroup,
          tensorLayers[tensorLayers.length - 1].output.arraySync()
        );

        addLayerLabel(layerLabelx, H * 0.15, layerGroup, `Upsampling Layer`);
        addLayerLabel(
          layerLabelx,
          H * 0.15 + 16,
          layerGroup,
          `${upsamplingType}`,
          10
        );
        addLayerLabel(
          layerLabelx,
          H * 0.85,
          layerGroup,
          `${latestLayer.params.outputDims.height} x ${latestLayer.params.outputDims.width} x ${latestLayer.params.outputDims.depth}`,
          14
        );

        setPrevLayerDims(latestLayer.params.outputDims);

        setAllowedLayerTypes({
          conv: true,
          activation: false,
          upsample: false,
          downsample: false,
          dense: true,
        });
        setMenuAnnotation(
          "Convolution immediately after upsampling fixes blurry or weird pixelated patterns, adjusts channel dimensions for the next layer, and refinement for better feature extraction."
        );
      } else if (
        latestLayer.type === "add-downsampling" &&
        isDownsamplingParams(latestLayer.params) && // change param so it can draw
        prevLayerDims
      ) {
        tensorLayers.push(
          setDownsamplingLayer(
            latestLayer.params as DownsamplingParams,
            tensorLayers[tensorLayers.length - 1].output
          )
        );
        setTensorLayers([...tensorLayers]);

        layerConnections = drawStackedConvLayer(
          W,
          H,
          latestLayer.params.outputDims.depth,
          latestLayer.params.outputDims.width,
          latestLayer.params.outputDims.height,
          MAXLAYERS,
          layerGroup,
          tensorLayers[tensorLayers.length - 1].output.arraySync()
        );

        addLayerLabel(layerLabelx, H * 0.15, layerGroup, `Pooling Layer`);
        addLayerLabel(
          layerLabelx,
          H * 0.15 + 16,
          layerGroup,
          `${downsamplingType}`,
          10
        );
        addLayerLabel(
          layerLabelx,
          H * 0.85,
          layerGroup,
          `${latestLayer.params.outputDims.height} x ${latestLayer.params.outputDims.width} x ${latestLayer.params.outputDims.depth}`
        );

        setPrevLayerDims({
          width: latestLayer.params.outputDims.width,
          height: latestLayer.params.outputDims.height,
          depth: latestLayer.params.outputDims.depth,
        });

        setAllowedLayerTypes({
          conv:
            latestLayer.params.outputDims.width == 1 &&
            latestLayer.params.outputDims.height == 1
              ? false
              : true,
          activation: false,
          upsample: false,
          downsample: false,
          dense: true,
        });

        if (
          latestLayer.params.outputDims.width == 1 &&
          latestLayer.params.outputDims.height == 1
        ) {
          setMenuAnnotation(
            "No further spatial features can be extracted via convolutions at 1×1×n, but a fully connected (dense) layer can still be applied. This is useful for classifcation and regression."
          );
        } else {
          setMenuAnnotation(
            "We can add more convolutions for further feature extraction, use dense layers for classification/regression, or output convolutions directly for segmentation, super-resolution, or style transfer."
          );
        }

        setAnimationTriggers((prev) => [
          ...prev,
          {
            // downsample  input layer
            layerNumber: [layers.length - 1, layers.length - 2],
            triggerArea: [
              allLayerConnections[allLayerConnections.length - 2][1][0].x,
              allLayerConnections[allLayerConnections.length - 1][0][0].x,
            ],
            animationType: "downsample",
          },
        ]);
      } else if (
        latestLayer.type === "add-dense-layer" &&
        isNumberParam(latestLayer.params) // change param so it can draw
      ) {
        const string = latestLayer.params == 1 ? "neuron" : "neurons";

        tensorLayers.push(
          setDenseLayer(
            latestLayer.params,
            tensorLayers[tensorLayers.length - 1].output
          )
        );
        setTensorLayers([...tensorLayers]);
        layerConnections = drawNeurons(
          W,
          H,
          latestLayer.params,
          MAXLAYERS,
          layerGroup,
          tensorLayers[tensorLayers.length - 1].output.arraySync()
        );

        addLayerLabel(layerLabelx, H * 0.15, layerGroup, `Dense Layer`);
        addLayerLabel(
          layerLabelx,
          H * 0.85,
          layerGroup,
          `${latestLayer.params} ${string}`
        );

        setAllowedLayerTypes({
          conv: false,
          activation: true,
          upsample: false,
          downsample: false,
          dense: false,
        });

        setMenuAnnotation(
          "Applying activations introduces non-linearity; otherwise, the CNN collapses to linear regression."
        );

        setPrevLayerDims({
          neurons: latestLayer.params,
        });

        if (
          layers[layers.length - 2].type == "add-downsampling" ||
          layers[layers.length - 3].type == "add-conv-layer"
        ) {
          setAnimationTriggers((prev) => [
            ...prev,
            {
              // dense  input layer
              layerNumber:
                layers[layers.length - 2].type == "add-downsampling"
                  ? [layers.length - 1, layers.length - 2]
                  : [layers.length - 1, layers.length - 3],
              triggerArea: [
                allLayerConnections[allLayerConnections.length - 2][1][0].x,
                allLayerConnections[allLayerConnections.length - 1][0][0].x,
              ],
              animationType: "dense",
            },
          ]);
          console.log("meow");
        }
      }

      if (layerConnections) {
        allLayerConnections.push(layerConnections);
        setAllLayerConnections([...allLayerConnections]);
        if (allLayerConnections.length > 1) {
          drawLayerConnections(root, allLayerConnections);
        }
      }
    }
    setAction("");
  }

  return (
    <div className="w-full caret-transparent md:w-[1183px] h-[550px] rounded-md border border-bg-alt overflow-auto md:overflow-hidden ">
      <VisualiserCanvas
        id="canvas"
        ref={svgRef}
        onClick={handleVisualiserClick}
        className={`w-[1183px] h-[500px] d3-root select-none`}
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
            annotation={menuAnnotation}
          />
        )}

        {numLayers == MAXLAYERS && (
          <VisualiserSmallPlusBtn
            x={
              layers[layers.length - 1].type != "add-activation"
                ? (W / MAXLAYERS) * (numLayers * 0.95) + 17
                : (W / MAXLAYERS) * (numLayers * 0.95)
            }
            y={H * 0.092}
            onClick={() => handleMenuAction("add-activation")}
          />
        )}
      </VisualiserCanvas>

      {numLayers > 0 && (
        <ParameterCount layers={layers} tensorLayers={tensorLayers} />
      )}

      {Object.entries(layerModals).map(([key, open]) =>
        open ? layerModalComponents[key as keyof typeof layerModals] : null
      )}

      {Object.entries(animationModals).map(([key, open]) =>
        open
          ? animationModalComponents[key as keyof typeof animationModals]
          : null
      )}
    </div>
  );
}
