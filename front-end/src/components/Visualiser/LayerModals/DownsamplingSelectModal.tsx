import React, { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { DownsamplingParams, DownsamplingType } from "@/utils/types";
import Modal from "@/components/Modal";

interface DownsamplingSelectModalProps {
  onClose: () => void;
  onConfirm: (params: DownsamplingParams) => void;
  prevDims?: { width: number; height: number; depth: number };
}

/** Static - defined outside the component so the array is never recreated on re-render. */
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
      "Reduces each channel to a single value (used before fully connected layers) by finding the max value in each channel.",
  },
  {
    type: "Global Average Pooling",
    description:
      "Reduces each feature map to a single value (used before fully connected layers) by averaging all values in each channel.",
  },
];

/**
 * Config modal for adding a pooling (downsampling) layer.
 * Formula panel and filter/stride inputs are hidden until a pooling type is
 * selected; global variants skip those inputs entirely since they reduce each
 * channel to a single 1×1 value regardless of filter size.
 */
const DownsamplingSelectModal: React.FC<DownsamplingSelectModalProps> = ({
  onClose,
  onConfirm,
  prevDims = { width: 10, height: 10, depth: 3 },
}) => {
  const [selectedType, setSelectedType] = useState<DownsamplingType | null>(
    null
  );
  const [filterSize, setFilterSize] = useState<number>(2);
  const [stride, setStride] = useState<number>(2);

  const maxSize = Math.max(prevDims.height, prevDims.width);

  const computeOutputDims = () => {
    const { width, height, depth } = prevDims;

    if (selectedType?.includes("Global")) {
      return { width: 1, height: 1, depth };
    }

    const outW = Math.floor((width - filterSize) / stride) + 1;
    const outH = Math.floor((height - filterSize) / stride) + 1;
    return {
      width: outW,
      height: outH,
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
    <Modal
      onClose={onClose}
      overlayClassName="bg-black/40 backdrop-blur-[1px]"
      className="shadow-xl w-full max-w-5xl p-5 animate-fadeIn max-h-[90vh] overflow-y-auto"
    >
        <h2 className="text-2xl font-semibold text-text mb-2">
          Select a Pooling Method
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Choose the Pooling (downsampling) technique and adjust parameters. The output
          dimensions update dynamically.
        </p>

        {/*  Main layout  */}
        <div className={`grid grid-cols-1 md:grid-cols-${selectedType? 2 :1} gap-8`}>
          {/*  LEFT SIDE: Formula + Inputs  */}
          <div className="flex flex-col space-y-6">
            {/*  Formula Section  */}

            {selectedType && (
              <div className="rounded-xl px-4">

                {outputDims && prevDims && (
                  <>
                    <h3 className="text-text-muted font-semibold">
                      Previous Layer Dimensions
                    </h3>
                    <p className="text-xs text-gray-700">
                      <MathJax dynamic className="opacity-60">
                        {"\\(H_{in} \\times W_{in} \\times D_{in}\\)"}
                      </MathJax>
                    </p>
                    <p className="text-sm text-text-muted">
                      <MathJax
                        dynamic
                      >{` \\(${prevDims.height} \\times ${prevDims.width} \\times ${prevDims.depth}\\)`}</MathJax>
                    </p>

                    <h3 className="mt-2 text-text-muted font-semibold">
                      Output Dimensions
                    </h3>
                    <p className="text-sm text-gray-700">
                      <MathJax dynamic className="opacity-60">
                        {"\\(H_{out} \\times W_{out} \\times D_{out}\\)"}
                      </MathJax>
                      {selectedType.includes("Global") ? (
                        <>
                          <MathJax
                            dynamic
                          >{`\\(1 \\times 1 \\times ${outputDims?.depth}\\)`}</MathJax>
                        </>
                      ) : (
                        <>
                          <strong>
                            <MathJax
                              dynamic
                            >{`\\(${outputDims?.height} \\times ${outputDims?.width} \\times ${outputDims?.depth}\\)`}</MathJax>
                          </strong>
                        </>
                      )}
                    </p>

                    {!selectedType.includes("Global") && (
                      <div className="mt-4">
                        <h3 className="text-text mb-1 font-semibold">
                          Computed With...
                        </h3>
                        <div className="text-text-muted space-y-2">
                          <MathJax dynamic>
                            {`\\(H_{out} = \\lfloor \\frac{H_{in} - \\color{#00BFA6}{F}}{\\color{#5073B3}{S}} \\rfloor + 1 = 
                        \\lfloor \\frac{${prevDims.height} - \\color{#00BFA6}{${filterSize}}}{\\color{#5073B3}{${stride}}} \\rfloor  + 1
                        = ${outputDims.height}\\)`}
                          </MathJax>
                          <MathJax dynamic>
                            {`\\(W_{out} = \\lfloor \\frac{W_{in} - \\color{#00BFA6}{F}}{\\color{#5073B3}{S}}  \\rfloor + 1 = 
                        \\lfloor \\frac{${prevDims.width} - \\color{#00BFA6}{${filterSize}}}{\\color{#5073B3}{${stride}}} \\rfloor + 1
                        = ${outputDims.width}\\)`}
                          </MathJax>
                          <MathJax dynamic>
                            {`\\(D_{out} = D_{in} = ${outputDims.depth}\\)`}
                          </MathJax>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {/*  Inputs: Filter + Stride side-by-side BELOW the formula  */}
            {selectedType && !selectedType.includes("Global") && (
              <div className="flex flex-row space-x-6 px-4">
                <div className="flex flex-col">
                  <label className="text-sm text-text-muted font-medium mb-1">
                    <MathJax dynamic>
                      {
                        " Filter Size (\\(\\color{#00BFA6}{F}\\)) & Stride (\\(\\color{#5073B3}{S}\\)): "
                      }
                    </MathJax>
                  </label>
                  <input
                    type="number"
                    value={filterSize}
                    onChange={(e) => {
                      let val = e.target.value;

                      // Remove everything except digits
                      val = val.replace(/\D/g, "");

                      // Convert to number (or 0 if empty)
                      let num = Number(val) || 0;

                      // Clamp to min/max
                      num = Math.max(2, Math.min(num, maxSize));

                      // Stride is always kept equal to filter size so the
                      // pooling windows never overlap.
                      setFilterSize(num);
                      setStride(num);
                    }}
                    min={2}
                    max={maxSize}
                    step={1} // Ensures arrow keys increment by 1
                    className="border border-gray-300 rounded-md px-3 py-2 w-28 bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/*  RIGHT SIDE: Pooling Type Buttons  */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {POOLING_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelectedType(opt.type)}
                className={`flex flex-col border rounded-xl p-4 text-left transition ${
                  selectedType === opt.type
                    ? "border-accent bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <h3 className="text-l font-semibold text-gray-800 mb-1">
                  {opt.type}
                </h3>
                <p className="text-xs text-text-muted">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/*  Action Buttons  */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 rounded-lg text-text-muted hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedType}
            className={`px-4 py-2 rounded-lg text-white transition ${
              selectedType
                ? "bg-accent hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Confirm
          </button>
        </div>
    </Modal>
  );
};

export default DownsamplingSelectModal;
