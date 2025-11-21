export const MAXLAYERS = 6;
export const MAX_WIDTH = 25;
export const MAX_HEIGHT = 25;
export const MAX_DEPTH = 5;
export const MAX_FILTERS = MAX_DEPTH;
export const MAX_FILTER_SIZE = 11;
export const MAX_PADDING = 10;
export const MAX_STRIDE = 8;
export const MAX_SCALE_FACTOR = 25;
export const W = 1183;
export const H = 500;

export type validLayerTypes = {
  conv: boolean;
  activation: boolean;
  upsample: boolean;
  downsample: boolean;
  dense: boolean;
};

export type convLayerDims = {
  width: number;
  height: number;
  depth: number;
  type?: string;
};

export type denseLayerDims = {
  neurons: number;
};

export type LayerDims = convLayerDims ;

export interface LayerSelectionBtnProps {
  onClick: (e: React.MouseEvent) => void;
  x: number;
  y: number;
}

export interface ConvLayerSelectionBtnProps extends LayerSelectionBtnProps {
  showLabel: boolean;
}

export interface VisualiserMenuBtnProps {
  // start point
  x: number;
  y: number;
  // max width and height
  height: number;
  width: number;
  onAction: (action: LayerActionType) => void;
  showLabel: boolean;
  validLayerTypes: validLayerTypes;
}

export interface ConvParams {
  width: number;
  height: number;
  depth: number;
  stride?: number;
  numFilters?: number;
  padding?: number;
  filterSize?: number;
}

export type MidPoint = { x: number; y: number };

export type LayerConnections = [MidPoint[], MidPoint[]]; // [leftPoints, rightPoints]

export type ActivationType = "Tanh" | "Sigmoid" | "ReLU" | "Leaky ReLU";

export type LayerActionType =
  | "add-conv-layer"
  | "add-activation"
  | "add-upsampling"
  | "add-downsampling"
  | "add-dense-layer"
  | "";

export type UpsamplingType =
  | "Bed of Nails"
  | "Nearest Neighbor"
  | "Bilinear Interpolation";

export type UpsamplingParams = {
  method: UpsamplingType;
  scaleFactor: number;
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
