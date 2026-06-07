import { RefObject } from "react";
import * as d3 from "d3";
import {
  ActivationType,
  ConvParams,
  DownsamplingParams,
  LayerActionType,
  UpsamplingParams,
} from "@/utils/types";
import binSearchInterval from "@/utils/binSearchInterval";
import { LayerStateReturn } from "./useLayerState";
import { ModalStateReturn } from "./useModalState";

/** Maps each menu action type to the modal variant it should open. */
const layerModalMap: Record<LayerActionType, "conv" | "activation" | "upsample" | "downsample" | "dense"> = {
  "": "conv",
  "add-conv-layer": "conv",
  "add-activation": "activation",
  "add-upsampling": "upsample",
  "add-downsampling": "downsample",
  "add-dense-layer": "dense",
};

/**
 * Wires together layer-state mutations and modal transitions in response to
 * user interactions on the visualiser canvas and the layers menu.
 *
 * @param layerState  - State and actions for the layer list.
 * @param modalState  - State and actions for opening/closing modals.
 * @param svgRef      - Ref to the main visualiser SVG element (used for hit-testing click coordinates).
 */
export function useLayerHandlers(
  layerState: LayerStateReturn,
  modalState: ModalStateReturn,
  svgRef: RefObject<SVGSVGElement>
) {
  const { addLayer, setAction, setActivationType, setUpsamplingType, setDownsamplingType, animationTriggers, started, numLayers } = layerState;
  const { openLayerModal, closeLayerModal, setCurrAnimationTrigger, openAnimationModal } = modalState;

  /** Opens the layer-configuration modal that corresponds to the chosen menu action. */
  function handleMenuAction(type: LayerActionType) {
    setAction(type);
    openLayerModal(layerModalMap[type]);
  }

  /**
   * Adds a convolutional layer and closes the config modal.
   * On the very first layer, injects a weight-value colour-scale legend into
   * the SVG so the user can read heat-map intensities on subsequent animations.
   */
  function handleConvConfirm(params: ConvParams) {
    if (numLayers === 0) {
      const svg = d3.select(svgRef.current);

      const gradient = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", "opacityGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      gradient.append("stop").attr("offset", "0%").attr("stop-color", "#5f6c7b").attr("stop-opacity", 1);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", "#5f6c7b").attr("stop-opacity", 0);

      svg.append("rect")
        .attr("x", 950).attr("y", 460).attr("width", 200).attr("height", 25)
        .attr("id", "Gradient").style("fill", "url(#opacityGradient)");

      svg.append("text").attr("x", 950).attr("y", 500).attr("text-anchor", "middle").text("2.00").attr("font-size", "12px").attr("fill", "#333");
      svg.append("text").attr("x", 1150).attr("y", 500).attr("text-anchor", "middle").text("-2.00").attr("font-size", "12px").attr("fill", "#333");
      svg.append("text").attr("x", 1050).attr("y", 500).attr("text-anchor", "middle").text("0").attr("font-size", "12px").attr("fill", "#333");
    }

    addLayer(params, "add-conv-layer");
    closeLayerModal("conv");
    setAction("add-conv-layer");
  }

  /** Adds an activation layer using the selected activation function. */
  function handleActivationSelect(activation: ActivationType) {
    setActivationType(activation);
    addLayer(activation, "add-activation");
    closeLayerModal("activation");
    setAction("add-activation");
  }

  /** Adds an upsampling layer with the chosen interpolation method. */
  function handleUpsamplingSelect(params: UpsamplingParams) {
    setUpsamplingType(params.method);
    addLayer(params, "add-upsampling");
    closeLayerModal("upsample");
    setAction("add-upsampling");
  }

  /** Adds a downsampling (pooling) layer with the chosen pooling type. */
  function handleDownsamplingSelect(params: DownsamplingParams) {
    setDownsamplingType(params.type);
    addLayer(params, "add-downsampling");
    closeLayerModal("downsample");
    setAction("add-downsampling");
  }

  /** Adds a fully-connected dense layer with the specified neuron count. */
  function handleDenseNeuronSelect(params: number) {
    addLayer(params, "add-dense-layer");
    closeLayerModal("dense");
    setAction("add-dense-layer");
  }

  /**
   * Hit-tests an SVG click against the registered animation trigger areas.
   * Uses a binary search over the sorted trigger intervals
   */
  function handleVisualiserClick(e: React.MouseEvent<SVGSVGElement>) {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const pt = svgEl.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgX = pt.matrixTransform(svgEl.getScreenCTM()!.inverse()).x;

    const intervals = animationTriggers.map((t) => t.triggerArea);
    const idx = binSearchInterval(svgX, intervals, intervals.length - 1, 0);
    if (idx !== undefined) {
      setCurrAnimationTrigger(animationTriggers[idx]);
      openAnimationModal(animationTriggers[idx].animationType);
    }
  }

  return {
    handleMenuAction,
    handleConvConfirm,
    handleActivationSelect,
    handleUpsamplingSelect,
    handleDownsamplingSelect,
    handleDenseNeuronSelect,
    handleVisualiserClick,
  };
}
