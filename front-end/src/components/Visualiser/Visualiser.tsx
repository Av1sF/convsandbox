"use client";
import { useRef, useState } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import VisualiserMenuBtn from "./VisualiserMenuBtn";
import * as d3 from "d3";
import { drawConvLayer } from "@/utils/drawConvLayer";
import ConvLayerModal from "./Modals/ConvLayerModal";
import ActivationSelectModal from "./Modals/ActivationSelectModal";
import {
  ActivationType,
  convLayerDims,
  ConvParams,
  denseLayerDims,
  DownsamplingParams,
  DownsamplingType,
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
import UpsamplingSelectModal from "./Modals/UpsamplingSelectModal";
import drawLayerConnections from "@/utils/drawLayerConnection";
import DownsamplingSelectModal from "./Modals/DownsamplingSelectModal";
import DenseLayerModal from "./Modals/DenseLayerModal";
import { drawNeurons } from "@/utils/drawNeurons";
import { addLayerLabel } from "@/utils/addLayerLabel";
import { setConvLayer, setDownsamplingLayer, setInputLayer } from "@/utils/DummyModel";

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

  // Number of layers already created
  const [numLayers, setNumLayers] = useState<number>(0);

  // Store each created layer's type and dimensions
  const [layers, setLayers] = useState(initialLayers);

  // Dummy Model 
  const [tensorLayers, setTensorLayers] = useState<any[]>([]); 

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

  const [modals, setModals] = useState({
    conv: false,
    activation: false,
    upsample: false,
    downsample: false,
    dense: false,
  });

  const openModal = (key: keyof typeof modals) =>
    setModals((m) => ({ ...m, [key]: true }));

  const closeModal = (key: keyof typeof modals) =>
    setModals((m) => ({ ...m, [key]: false }));

  const allModalsClosed = Object.values(modals).every((m) => !m);

  const modalMap: Record<LayerActionType, keyof typeof modals> = {
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
    openModal(modalMap[type]);
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
    closeModal("conv");

    // Viz only officially starts iff first layer is created
    if (!started) {
      setStarted(true);
    }
  };

  // Activation Modal handler
  const handleActivationSelect = (activation: ActivationType) => {
    addLayer(activation, "add-activation");
    closeModal("activation");
    setActivationType(activation);
  };

  // Upsampling Modal handler
  const handleUpsamplingSelect = (params: UpsamplingParams) => {
    addLayer(params, "add-upsampling");
    closeModal("upsample");
    setUpsamplingType(params.method);
  };

  // Downsampling Modal handler
  const handleDownsamplingSelect = (params: DownsamplingParams) => {
    addLayer(params, "add-downsampling");
    closeModal("downsample");
    setDownsamplingType(params.type);
  };

  // Dense layer Modal handler
  const handleDenseNeuronSelect = (params: number) => {
    addLayer(params, "add-dense-layer");
    closeModal("dense");
  };
  const modalComponents = {
    conv: (
      <div key="conv">
        <ConvLayerModal
          prevDims={prevLayerDims as convLayerDims}
          onClose={() => closeModal("conv")}
          onConfirm={handleConvConfirm}
          hasStarted={started}
        />
      </div>
    ),
    activation: (
      <div key="activation">
        <ActivationSelectModal
          onClose={() => closeModal("activation")}
          onSelect={handleActivationSelect}
        />
      </div>
    ),
    upsample: (
      <div key="upsample">
        <UpsamplingSelectModal
          prevDims={prevLayerDims as convLayerDims}
          onClose={() => closeModal("upsample")}
          onConfirm={handleUpsamplingSelect}
        />
      </div>
    ),
    downsample: (
      <div key="downsample">
        <DownsamplingSelectModal
          prevDims={prevLayerDims as convLayerDims}
          onClose={() => closeModal("downsample")}
          onConfirm={handleDownsamplingSelect}
        />
      </div>
    ),
    dense: (
      <div key="dense">
        <DenseLayerModal
          onClose={() => closeModal("dense")}
          onConfirm={handleDenseNeuronSelect}
        />
      </div>
    ),
  };

  // -- Render Logic --
  if (action != initialAction && allModalsClosed && started) {
    if (layers.length === 0) return;

    const latestLayer = layers[layers.length - 1];
    const layerxOffset = (W / MAXLAYERS) * (numLayers - 1);
    const layerLabelx = W / (2 * MAXLAYERS);

    // Layer Group
    const existingGroup = root.select(`.layer-${numLayers - 1}`);
    let layerGroup;
    let layerConnections: LayerConnections | undefined = undefined;

    if (!existingGroup.empty()) {
      // Layer already exists no need to re-render
      layerGroup = existingGroup;

      if (
        latestLayer.type === "add-activation" &&
        isActivationType(latestLayer.params)
      ) {
        let yText =
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
            conv: false,
          });
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
        addLayerLabel(layerLabelx, H * 0.15, layerGroup, `Convolutional Layer`);

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
          
          tensorLayers.push(setInputLayer(latestLayer.params as convLayerDims));
          setTensorLayers([...tensorLayers]);
          console.log(tensorLayers)
          
        } else {
          setAllowedLayerTypes({
            ...allowedLayerTypes,
            conv: false,
            activation: true,
            upsample: false,
            downsample: false,
            dense: false,
          });

          console.log(tensorLayers)
          tensorLayers.push(setConvLayer(latestLayer.params as ConvParams, tensorLayers[tensorLayers.length-1]));
          setTensorLayers([...tensorLayers]);
          console.log(tensorLayers)
        }

        console.log (tensorLayers[tensorLayers.length-1].arraySync())
        console.log(tensorLayers[tensorLayers.length-1].shape)
        layerConnections = drawConvLayer(
          W,
          H,
          latestLayer.params.depth,
          latestLayer.params.width,
          latestLayer.params.height,
          MAXLAYERS,
          layerGroup,
          tensorLayers[tensorLayers.length-1].arraySync()
        );

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
          `${prevLayerDims.height * latestLayer.params.scaleFactor} x ${
            prevLayerDims.width * latestLayer.params.scaleFactor
          } x ${prevLayerDims.depth}`,
          14
        );

        setPrevLayerDims({
          width: prevLayerDims.width * latestLayer.params.scaleFactor,
          height: prevLayerDims.height * latestLayer.params.scaleFactor,
          depth: prevLayerDims.depth,
        });

        setAllowedLayerTypes({
          conv: true,
          activation: false,
          upsample: false,
          downsample: false,
          dense: true,
        });
      } else if (
        latestLayer.type === "add-downsampling" &&
        isDownsamplingParams(latestLayer.params) && // change param so it can draw
        prevLayerDims
      ) {

        console.log(tensorLayers[tensorLayers.length-1].arraySync())

        tensorLayers.push(setDownsamplingLayer(latestLayer.params as DownsamplingParams, tensorLayers[tensorLayers.length-1]));
        setTensorLayers([...tensorLayers]);
        
        console.log(tensorLayers[tensorLayers.length-1].arraySync())
        layerConnections = drawConvLayer(
          W,
          H,
          latestLayer.params.outputDims.depth,
          latestLayer.params.outputDims.width,
          latestLayer.params.outputDims.height,
          MAXLAYERS,
          layerGroup,
          // tensorLayers[tensorLayers.length-1].arraySync()
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
          conv: true,
          activation: false,
          upsample: false,
          downsample: false,
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

      {Object.entries(modals).map(([key, open]) =>
        open ? modalComponents[key as keyof typeof modals] : null
      )}
    </div>
  );
}
