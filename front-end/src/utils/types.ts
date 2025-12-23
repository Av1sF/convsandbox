import { Tensor } from "@tensorflow/tfjs";

export const MAXLAYERS = 6;
export const MAX_WIDTH = 15;
export const MAX_HEIGHT = 15;
export const MAX_DEPTH = 3;
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

export type LayerDims = {
  width: number;
  height: number;
  depth: number;
};

export type convLayerDims = LayerDims & { type?: string };

export type denseLayerDims = {
  neurons: number;
};

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
  stride: number;
  numFilters: number;
  padding: number;
  filterSize: number;
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

// dummy model
interface baseDummyModelParam {
  output: Tensor; 
}

export interface dummyModelInput extends baseDummyModelParam {
  dims: { height: number; width: number; depth: number };
}

export interface dummyModelConv extends baseDummyModelParam {
  padSize: number; 
  stride: number; 
  padded: Tensor;
  filterSize: number; 
  kernel: Tensor;
  bias: Tensor;
  dims: { height: number; width: number; depth: number };
}

export interface dummyModelDense extends baseDummyModelParam {
  weights: Tensor;
  bias: Tensor;
  flatten: Tensor;
  neurons: number;
}

export interface dummyModelActivation extends baseDummyModelParam{
  type: ActivationType;
  dims?: { height: number; width: number; depth: number };
  neurons?: number;
}

export interface dummyModelUpsample extends baseDummyModelParam{
  type: UpsamplingType;
  scaleFactor: number;
  dims: { height: number; width: number; depth: number };
}

export interface dummyModelDownsample extends baseDummyModelParam{
  type: DownsamplingType;
  stride?: number;
  filterSize?: number;
  dims: { height: number; width: number; depth: number };
}

export type dummyModelOutputs =
  | dummyModelActivation
  | dummyModelConv
  | dummyModelDense
  | dummyModelDownsample
  | dummyModelInput
  | dummyModelUpsample;
