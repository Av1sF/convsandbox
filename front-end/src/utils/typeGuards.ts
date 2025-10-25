import { ActivationType, ConvParams } from "@/app/types";

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