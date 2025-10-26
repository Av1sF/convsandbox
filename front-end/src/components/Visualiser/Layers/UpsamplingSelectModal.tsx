import React, { useState, useEffect } from "react";
import {
  ConvParams,
  LayerDims,
  MAX_DEPTH,
  MAX_HEIGHT,
  MAX_WIDTH,
  UpsamplingType,
} from "@/utils/types";
import { UpsamplingParams } from "../../../utils/types";

export interface UpsamplingSelectModalProps {
  onClose: () => void;
  onConfirm: (params: UpsamplingParams) => void;
  prevDims: LayerDims; // previous layer dimensions
}

const UPSAMPLING_METHODS: {
  type: UpsamplingType;
  title: string;
  description: string;
  graph: React.ReactElement;
}[] = [
  {
    type: "Bed of Nails",
    title: "Bed of Nails",
    description:
      "Simplest upsampling: inserts zeros between input elements to increase spatial size.",
    graph: (
      <svg width="80" height="60" viewBox="0 0 100 60">
        <rect x="15" y="15" width="10" height="10" fill="#2563eb" />
        <rect x="45" y="15" width="10" height="10" fill="#2563eb" />
        <rect x="15" y="45" width="10" height="10" fill="#2563eb" />
        <rect x="45" y="45" width="10" height="10" fill="#2563eb" />
        <circle cx="30" cy="15" r="2" fill="#d1d5db" />
        <circle cx="30" cy="45" r="2" fill="#d1d5db" />
        <circle cx="15" cy="30" r="2" fill="#d1d5db" />
        <circle cx="45" cy="30" r="2" fill="#d1d5db" />
      </svg>
    ),
  },
  {
    type: "Nearest Neighbor",
    title: "Nearest Neighbor",
    description:
      "Copies the nearest pixel’s value to expand the image. Fast but can appear blocky.",
    graph: (
      <svg width="80" height="60" viewBox="0 0 100 60">
        <rect x="20" y="20" width="15" height="15" fill="#16a34a" />
        <rect x="35" y="20" width="15" height="15" fill="#16a34a" />
        <rect x="20" y="35" width="15" height="15" fill="#16a34a" />
        <rect x="35" y="35" width="15" height="15" fill="#16a34a" />
      </svg>
    ),
  },
  {
    type: "Bilinear Interpolation",
    title: "Bilinear Interpolation",
    description:
      "Smooths pixel values using weighted averages of nearby pixels. Produces softer transitions.",
    graph: (
      <svg width="80" height="60" viewBox="0 0 100 60">
        <defs>
          <linearGradient id="bilinearGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
        </defs>
        <rect
          x="20"
          y="20"
          width="40"
          height="20"
          fill="url(#bilinearGrad)"
          rx="4"
        />
      </svg>
    ),
  },
];

const UpsamplingSelectModal: React.FC<UpsamplingSelectModalProps> = ({
  onClose,
  onConfirm,
  prevDims,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<UpsamplingType | null>(
    null
  );
  const [scale, setScale] = useState<number>(2);

  const outputDims: ConvParams = {
    width: prevDims.width * scale,
    height: prevDims.height * scale,
    depth: prevDims.depth,
  };

  var isOutputValid =
    outputDims.width > 0 &&
    outputDims.height > 0 &&
    outputDims.depth > 0 &&
    outputDims.width <= MAX_WIDTH &&
    outputDims.height <= MAX_HEIGHT &&
    outputDims.depth <= MAX_DEPTH;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-8 animate-fadeIn relative overflow-hidden">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Select Upsampling Method
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose how this layer will increase spatial resolution.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {UPSAMPLING_METHODS.map((method) => (
            <button
              key={method.type}
              onClick={() => setSelectedMethod(method.type)}
              className={`flex flex-col items-center border rounded-2xl p-5 transition ${
                selectedMethod === method.type
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="mb-3">{method.graph}</div>
              <h3 className="font-semibold text-gray-800 text-center">
                {method.title}
              </h3>
              <p className="text-xs text-gray-600 text-center mt-1">
                {method.description}
              </p>
            </button>
          ))}
        </div>

        {/* Scale factor input */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-6">
          <label className="text-sm text-gray-700 font-medium">
            Scale Factor:
            <input
              type="number"
              value={scale}
              onChange={(e) => setScale(Math.max(1, Number(e.target.value)))}
              min={1}
              max={5}
              className="ml-2 border border-gray-300 rounded-md px-3 py-1 w-20 text-center"
            />
          </label>

          <div className="text-sm text-gray-600 mt-2 md:mt-0">
            Output:{" "}
            <strong>
              {outputDims.width}×{outputDims.height}×{outputDims.depth}
            </strong>
          </div>
        </div>

        {!isOutputValid && (
          <p className="text-red-600 text-sm mt-3 font-medium">
            Output dimensions
          </p>
        )}

        <div className="flex justify-end mt-8 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            disabled={!selectedMethod || !isOutputValid}
            onClick={() => {
              if (selectedMethod && isOutputValid)
                onConfirm({ method: selectedMethod, scaleFactor: scale });
            }}
            className={`px-4 py-2 rounded-lg transition text-white ${
              !selectedMethod || !isOutputValid
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpsamplingSelectModal;
