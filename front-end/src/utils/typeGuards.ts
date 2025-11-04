import { ActivationType, ConvParams, UpsamplingParams, UpsamplingType, DownsamplingType, DownsamplingParams} from "@/utils/types";

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


export function isDownsamplingParams(obj: any): obj is DownsamplingParams {
  if (typeof obj !== "object" || obj === null) return false;

  const hasValidType =
    typeof obj.type === "string" &&
    ["Max Pooling", "Average Pooling", "Global Max Pooling", "Global Average Pooling"].includes(obj.type as DownsamplingType);

  const hasValidFilterSize =
    obj.filterSize === undefined || (typeof obj.filterSize === "number" && obj.filterSize > 0);

  const hasValidStride =
    obj.stride === undefined || (typeof obj.stride === "number" && obj.stride > 0);

  const hasValidOutputDims =
    obj.outputDims === undefined ||
    (typeof obj.outputDims === "object" &&
      obj.outputDims !== null &&
      typeof obj.outputDims.width === "number" &&
      typeof obj.outputDims.height === "number" &&
      typeof obj.outputDims.depth === "number");

  return hasValidType && hasValidFilterSize && hasValidStride && hasValidOutputDims;
}