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

const initialAllowedLayerTypes: validLayerTypes = {
  conv: true,
  activation: false,
  upsample: false,
  downsample: false,
  dense: false,
};

export function useLayerState() {
  const [action, setAction] = useState<LayerActionType>("");
  const [started, setStarted] = useState(false);
  const [numLayers, setNumLayers] = useState(0);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [tensorLayers, setTensorLayers] = useState<dummyModelOutputs[]>([]);
  const [allLayerConnections, setAllLayerConnections] = useState<LayerConnections[]>([]);
  const [animationTriggers, setAnimationTriggers] = useState<AnimationTrigger[]>([]);
  const [prevLayerDims, setPrevLayerDims] = useState<convLayerDims | denseLayerDims | undefined>(undefined);
  const [allowedLayerTypes, setAllowedLayerTypes] = useState<validLayerTypes>(initialAllowedLayerTypes);
  const [menuAnnotation, setMenuAnnotation] = useState(
    "Convolutional Neural Networks (CNNs) are mainly used to process image data. We will create a random input, so it will appear noisy rather than like a natural picture."
  );
  const [activationType, setActivationType] = useState<ActivationType>("ReLU");
  const [upsamplingType, setUpsamplingType] = useState<UpsamplingType | null>(null);
  const [downsamplingType, setDownsamplingType] = useState<DownsamplingType | null>(null);

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
