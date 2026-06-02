import { Tensor } from "@tensorflow/tfjs";
import { ActivationType, DownsamplingType, UpsamplingType } from "./layerTypes";

export type LayerKind =
  | "input"
  | "conv"
  | "dense"
  | "activation"
  | "upsample"
  | "downsample";

interface baseDummyModelParam {
  output: Tensor;
}

export interface dummyModelInput extends baseDummyModelParam {
  kind: "input";
  dims: { height: number; width: number; depth: number };
}

export interface dummyModelConv extends baseDummyModelParam {
  kind: "conv";
  padSize: number;
  stride: number;
  padded: Tensor;
  filterSize: number;
  kernel: Tensor;
  bias: Tensor;
  dims: { height: number; width: number; depth: number };
}

export interface dummyModelDense extends baseDummyModelParam {
  kind: "dense";
  weights: Tensor;
  bias: Tensor;
  flatten: Tensor;
  neurons: number;
}

export interface dummyModelActivation extends baseDummyModelParam {
  kind: "activation";
  type: ActivationType;
  dims?: { height: number; width: number; depth: number };
  neurons?: number;
}

export interface dummyModelUpsample extends baseDummyModelParam {
  kind: "upsample";
  type: UpsamplingType;
  scaleFactor: number;
  dims: { height: number; width: number; depth: number };
}

export interface dummyModelDownsample extends baseDummyModelParam {
  kind: "downsample";
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
