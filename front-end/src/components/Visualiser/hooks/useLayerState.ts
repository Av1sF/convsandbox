import { useState } from "react";
import {
  ActivationType,
  AnimationTrigger,
  convLayerDims,
  denseLayerDims,
  DownsamplingType,
  dummyModelOutputs,
  Layer,
  LayerActionType,
  LayerConnections,
  UpsamplingType,
  validLayerTypes,
} from "@/utils/types";

/**
 * Only convolutional layers is available at the start - every other layer type is gated
 * behind `allowedLayerTypes` and unlocked by the canvas draw logic after
 * the preceding layer has been rendered.
 */
const initialAllowedLayerTypes: validLayerTypes = {
  conv: true,
  activation: false,
  upsample: false,
  downsample: false,
  dense: false,
};

/**
 * Manages the complete layer list and all derived state that the visualiser
 * canvas and menus need to function.
 *
 * - The ordered `layers` array and its matching `tensorLayers` (dummy-model outputs).
 * - `animationTriggers` — the clickable SVG regions that open animation modals.
 * - `allLayerConnections` — bezier-curve midpoints drawn between adjacent layers.
 * - Which layer types are currently addable (`allowedLayerTypes`).
 * - The last added layer's output dimensions (`prevLayerDims`), used to pre-fill
 *   the next layer's config modal with sensible defaults.
 */
export function useLayerState() {
  const [action, setAction] = useState<LayerActionType>("");

  /** Becomes `true` after the first layer is added; gates certain UI elements. */
  const [started, setStarted] = useState(false);

  /**
   * Count of structural layers (conv, dense, pooling, upsampling).
   * Activation layers are excluded because they don't produce a new canvas group.
   */
  const [numLayers, setNumLayers] = useState(0);

  /** Ordered list of every layer in the model, including activation layers. */
  const [layers, setLayers] = useState<Layer[]>([]);

  /** Parallel array to `layers` holding the dummy-model tensor output for each layer. */
  const [tensorLayers, setTensorLayers] = useState<dummyModelOutputs[]>([]);

  /** Bezier-curve connection descriptors drawn between adjacent layer groups on the canvas. */
  const [allLayerConnections, setAllLayerConnections] = useState<LayerConnections[]>([]);

  /** Clickable SVG x-intervals that map a canvas region to an animation modal type. */
  const [animationTriggers, setAnimationTriggers] = useState<AnimationTrigger[]>([]);

  /** Output dimensions of the most recently rendered layer; used to seed the next modal's defaults. */
  const [prevLayerDims, setPrevLayerDims] = useState<convLayerDims | denseLayerDims | undefined>(undefined);

  /** Controls which layer-type buttons are enabled in the layers menu. */
  const [allowedLayerTypes, setAllowedLayerTypes] = useState<validLayerTypes>(initialAllowedLayerTypes);

  /** Contextual hint shown below the layers menu explaining what to add next. */
  const [menuAnnotation, setMenuAnnotation] = useState(
    "Convolutional Neural Networks (CNNs) are mainly used to process image data. We will create a random input, so it will appear noisy rather than like a natural picture."
  );

  const [activationType, setActivationType] = useState<ActivationType>("ReLU");
  const [upsamplingType, setUpsamplingType] = useState<UpsamplingType | null>(null);
  const [downsamplingType, setDownsamplingType] = useState<DownsamplingType | null>(null);

  /**
   * Appends a layer to the model.
   * Activation layers don't increment `numLayers` because they share the
   * canvas group of the conv layer they follow.
   */
  function addLayer(params: Layer["params"], layerType: Layer["type"]) {
    setLayers((prev) => [...prev, { type: layerType, params }]);
    if (layerType !== "add-activation") {
      setNumLayers((prev) => prev + 1);
    }
    if (!started) setStarted(true);
  }

  return {
    action, setAction,
    started, setStarted,
    numLayers, setNumLayers,
    layers, setLayers,
    tensorLayers, setTensorLayers,
    allLayerConnections, setAllLayerConnections,
    animationTriggers, setAnimationTriggers,
    prevLayerDims, setPrevLayerDims,
    allowedLayerTypes, setAllowedLayerTypes,
    menuAnnotation, setMenuAnnotation,
    activationType, setActivationType,
    upsamplingType, setUpsamplingType,
    downsamplingType, setDownsamplingType,
    addLayer,
  };
}

export type LayerStateReturn = ReturnType<typeof useLayerState>;
