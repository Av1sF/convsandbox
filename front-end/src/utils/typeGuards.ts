import { ActivationType, ConvParams, UpsamplingParams, UpsamplingType } from "@/utils/types";

export function isConvParams(obj: any): obj is ConvParams {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.width === "number" &&
    typeof obj.height === "number" &&
    typeof obj.depth === "number" &&
    (obj.stride === undefined || typeof obj.stride === "number") &&
    (obj.numFilters === undefined || typeof obj.numFilters === "number") &&
    (obj.padding === undefined || typeof obj.padding === "number") &&
    (obj.filterSize === undefined || typeof obj.filterSize === "number")
  );
}

export function isActivationType(value: any): value is ActivationType {
  return (
    typeof value === "string" &&
    ["Tanh", "Sigmoid", "ReLU", "Leaky ReLU"].includes(value)
  );
}

export function isUpsamplingParams(value: any): value is UpsamplingParams {
  const validMethods: UpsamplingType[] = [
    "Bed of Nails",
    "Nearest Neighbor",
    "Bilinear Interpolation",
  ];

  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.scaleFactor === "number" &&
    validMethods.includes(value.method)
  );
}