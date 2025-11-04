import React, { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { DownsamplingParams, DownsamplingType } from "@/utils/types";

interface DownsamplingSelectModalProps {
  onClose: () => void;
  onConfirm: (params: DownsamplingParams) => void;
  prevDims?: { width: number; height: number; depth: number };
}

const POOLING_OPTIONS: {
  type: DownsamplingType;
  description: string;
}[] = [
  {
    type: "Max Pooling",
    description:
      "Takes the maximum value within each filter window, preserving the most salient features.",
  },
  {
    type: "Average Pooling",
    description:
      "Computes the average value in each filter region, smoothing feature maps.",
  },
  {
    type: "Global Max Pooling",
    description:
      "Reduces each feature map to a single value (used before fully connected layers).",
  },
  {
    type: "Global Average Pooling",
    description:
      "Reduces each feature map to a single value (used before fully connected layers).",
  },
];

const DownsamplingSelectModal: React.FC<DownsamplingSelectModalProps> = ({
  onClose,
  onConfirm,
  prevDims = { width: 10, height: 10, depth: 3 },
}) => {
  const [selectedType, setSelectedType] = useState<DownsamplingType | null>(null);
  const [filterSize, setFilterSize] = useState<number>(2);
  const [stride, setStride] = useState<number>(1);

  // ✅ Correct formula including stride
  const computeOutputDims = () => {
    // if (!selectedType) return null;
    const { width, height, depth } = prevDims;

    if (
      selectedType === "Global Max Pooling" ||
      selectedType === "Global Average Pooling"
    ) {
      return { width: 1, height: 1, depth };
    }

    const outW = Math.floor((width - filterSize + 1) / stride);
    const outH = Math.floor((height - filterSize + 1) / stride);
    return {
      width: Math.max(1, outW),
      height: Math.max(1, outH),
      depth,
    };
  };

  const outputDims = computeOutputDims();

  const handleConfirm = () => {
    if (!selectedType) return;
    onConfirm({
      type: selectedType,
      filterSize,
      stride,
      outputDims: outputDims,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-5 animate-fadeIn relative overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Select Downsampling Method
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose the downsampling technique and adjust parameters. The output
          dimensions update dynamically.
        </p>

        {/* === Main layout === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* === LEFT SIDE: Formula + Inputs === */}
          <div className="flex flex-col space-y-6">
            {/* === Formula Section === */}
            <div className="rounded-xl px-4">
              {!selectedType && <h3>Select a pooling method!</h3>}

              {selectedType && outputDims && prevDims && (
                <>
                  <h3 className="text-text-muted font-semibold">
                    Previous Layer Dimensions
                  </h3>
                  <p className="text-xs text-gray-700">
                    <MathJax className="opacity-60">
                      {"\\(H_{in} \\times W_{in} \\times D_{in}\\)"}
                    </MathJax>
                  </p>
                  <p className="text-sm text-text-muted">
                    <MathJax>{` \\(${prevDims.height} \\times ${prevDims.width} \\times ${prevDims.depth}\\)`}</MathJax>
                  </p>

                  <h3 className="mt-2 text-text-muted font-semibold">
                    Output Dimensions
                  </h3>
                  <p className="text-sm text-gray-700">
                    <MathJax className="opacity-60">
                      {"\\(H_{out} \\times W_{out} \\times D_{out}\\)"}
                    </MathJax>
                    {selectedType.includes("Global") ? (
                      <>
                        <MathJax>{`\\(1 \\times 1 \\times ${outputDims?.depth}\\)`}</MathJax>
                      </>
                    ) : (
                      <>
                        <strong>
                          <MathJax>{`\\(${outputDims?.height} \\times ${outputDims?.width} \\times ${outputDims?.depth}\\)`}</MathJax>
                        </strong>
                      </>
                    )}
                  </p>

                  {!selectedType.includes("Global") && (<div className="mt-4">
                    <h3 className="text-text mb-1 font-semibold">
                      Computed With...
                    </h3>
                    <div className="text-text space-y-2">
                      <MathJax>
                        {`\\(H_{out} = \\frac{H_{in} - F + 1}{S} = 
                        \\frac{${prevDims.height} - ${filterSize} + 1}{${stride}}
                        = ${outputDims.height}\\)`}
                      </MathJax>
                      <MathJax>
                        {`\\(W_{out} = \\frac{W_{in} - F + 1}{S} = 
                        \\frac{${prevDims.width} - ${filterSize} + 1}{${stride}}
                        = ${outputDims.width}\\)`}
                      </MathJax>
                      <MathJax>
                        {`\\(D_{out} = D_{in} = ${outputDims.depth}\\)`}
                      </MathJax>
                    </div>
                  </div>)}
                </>
              )}
            </div>

            {/* === Inputs: Filter + Stride side-by-side BELOW the formula === */}
            {selectedType && !selectedType.includes("Global") && (
              <div className="flex flex-row space-x-6 px-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 font-medium mb-1">
                    Filter Size (f):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={Math.min(prevDims.width, prevDims.height)}
                    value={filterSize}
                    onChange={(e) => setFilterSize(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 w-28 bg-gray-50"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 font-medium mb-1">
                    Stride (s):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={Math.min(prevDims.width, prevDims.height)}
                    value={stride}
                    onChange={(e) => setStride(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 w-28 bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* === RIGHT SIDE: Pooling Type Buttons === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {POOLING_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelectedType(opt.type)}
                className={`flex flex-col border rounded-xl p-4 text-left transition ${
                  selectedType === opt.type
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <h3 className="text-l font-semibold text-gray-800 mb-1">
                  {opt.type}
                </h3>
                <p className="text-xs text-gray-600">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* === Action Buttons === */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedType}
            className={`px-4 py-2 rounded-lg text-white transition ${
              selectedType
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownsamplingSelectModal;
