export interface Layer {
  type: LayerActionType;
  params?:
    | ConvParams
    | ActivationType
    | UpsamplingParams
    | DownsamplingParams
    | number
    | undefined;
}

export type validLayerTypes = {
  conv: boolean;
  activation: boolean;
  upsample: boolean;
  downsample: boolean;
  dense: boolean;
};

export type LayerDims = {
  width: number;
  height: number;
  depth: number;
};

export type convLayerDims = LayerDims & { type?: string };

export type denseLayerDims = {
  neurons: number;
};

export interface ConvParams {
  width: number;
  height: number;
  depth: number;
  stride: number;
  numFilters: number;
  padding: number;
  filterSize: number;
  inChannels: number;
}

export type MidPoint = { x: number; y: number };

/** Pair of midpoint arrays `[leftEdge[], rightEdge[]]` used to draw bezier connections between layers. */
export type LayerConnections = [MidPoint[], MidPoint[]];

export type ActivationType = "Tanh" | "Sigmoid" | "ReLU" | "Leaky ReLU";

export type LayerActionType =
  | "add-conv-layer"
  | "add-activation"
  | "add-upsampling"
  | "add-downsampling"
  | "add-dense-layer"
  | "";

export type UpsamplingType = "Nearest Neighbor" | "Bilinear Interpolation";

export type UpsamplingParams = {
  method: UpsamplingType;
  scaleFactor: number;
  outputDims: { width: number; height: number; depth: number };
};

export type DownsamplingType =
  | "Max Pooling"
  | "Average Pooling"
  | "Global Max Pooling"
  | "Global Average Pooling";

export interface DownsamplingParams {
  type: DownsamplingType;
  filterSize?: number;
  stride?: number;
  outputDims: { width: number; height: number; depth: number };
}

export type AnimationModalKey = "conv" | "downsample" | "dense";

export interface AnimationTrigger {
  layerNumber: number[];
  triggerArea: number[];
  animationType: AnimationModalKey;
}
