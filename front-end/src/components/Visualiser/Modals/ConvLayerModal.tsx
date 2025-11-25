import {
  ConvParams,
  LayerDims,
  MAX_DEPTH,
  MAX_FILTER_SIZE,
  MAX_FILTERS,
  MAX_HEIGHT,
  MAX_PADDING,
  MAX_STRIDE,
  MAX_WIDTH,
} from "@/utils/types";
import { MathJax } from "better-react-mathjax";
import { useState } from "react";

// -- Props --
interface ConvModalProps {
  onClose: () => void;
  onConfirm: (params: ConvParams) => void;
  hasStarted: boolean;
  prevDims?: LayerDims;
}

// -- Main Component --
const ConvLayerModal: React.FC<ConvModalProps> = ({
  onClose,
  onConfirm,
  hasStarted,
  prevDims,
}) => {
  // -- Constants and vars
  // Output dimensions
  var [outputWidth, setOutputWidth] = useState<number>(10);
  var [outputHeight, setOutputHeight] = useState<number>(10);
  var [outputDepth, setOutputDepth] = useState<number>(3);

  // -- State initialisation --
  const [stride, setStride] = useState<number>(1);
  const [numFilters, setNumFilters] = useState<number>(1);
  const [padding, setPadding] = useState<number>(0);
  const [filterSize, setFilterSize] = useState<number>(2);

  // -- Event handlers --
  const handleSubmit = (e: React.FormEvent) => {
    let output: ConvParams = {
      width: outputWidth,
      height: outputHeight,
      depth: outputDepth,
    };
    e.preventDefault();

    if (!isOutputValid) return;

    if (hasStarted && prevDims) {
      output.stride = stride;
      output.filterSize = filterSize;
      output.numFilters = numFilters;
      output.padding = padding;
    }

    onConfirm(output);
  };

  const handleOutputWidthChange = (value: number) => {
    if (value < 1) setOutputWidth(1);
    else if (value > MAX_WIDTH) setOutputWidth(MAX_WIDTH);
    else setOutputWidth(value);
  };

  const handleOutputHeightChange = (value: number) => {
    if (value < 1) setOutputHeight(1);
    else if (value > MAX_HEIGHT) setOutputHeight(MAX_HEIGHT);
    else setOutputHeight(value);
  };

  const handleOutputDepthChange = (value: number) => {
    if (value < 1) setOutputDepth(1);
    else if (value > MAX_DEPTH) setOutputDepth(MAX_DEPTH);
    else setOutputDepth(value);
  };

  // -- Render Logic --
  if (prevDims) {
    outputWidth = Math.floor(
      (prevDims.width + 2 * padding - filterSize) / stride + 1
    );
    outputHeight = Math.floor(
      (prevDims.height + 2 * padding - filterSize) / stride + 1
    );
    outputDepth = numFilters;
  }

  var isOutputValid =
    outputWidth > 0 &&
    outputDepth > 0 &&
    outputHeight > 0 &&
    outputWidth <= MAX_WIDTH &&
    outputDepth <= MAX_DEPTH &&
    outputHeight <= MAX_HEIGHT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 backdrop-blur-[1px] overflow-y-auto p-4">
      <div
        className={`bg-bg rounded-2xl shadow-xl p-6 animate-fadeIn flex ${
          hasStarted
            ? "flex-col md:flex-row gap-8 items-start w-full max-w-4xl "
            : "flex-col items-center"
        } max-h-[90vh] overflow-y-auto`}
      >
        {/* Conv Layer Formulas - Only appear when user defines kernels */}
        {hasStarted && prevDims && (
          <div className="flex-1 text-sm text-text-muted">
            <h3 className="text-base font-semibold mb-2">Output Dimensions</h3>
            <p>
              <strong>
                <MathJax className="opacity-60">
                  {"\\(H_{out} \\times W_{out} \\times D_{out}\\)"}
                </MathJax>
                <MathJax>{`\\(${outputHeight} \\times ${outputWidth} \\times ${outputDepth}\\)`}</MathJax>
              </strong>
            </p>
            <br></br>
            <h3 className="text-base font-semibold mb-2 py-2">
              Computed With...{" "}
            </h3>
            <p className="text-base">
              <MathJax>
                {`\\(H_{out} = \\lfloor \\frac{H_{in} - {\\color{#00BFA6}{F}} + 2{\\color{#FC3E00}{P}}}{{\\color{#5073B3}{S}}} + 1 \\rfloor = 
                \\lfloor \\frac{${prevDims.height} - {\\color{#00BFA6}{${filterSize}}} + 2({\\color{#FC3E00}{${padding}}})}{{\\color{#5073B3}{${stride}}}}  + 1 \\rfloor
                 = ${outputHeight}\\)`}
              </MathJax>

              <MathJax className="py-4">
                {`\\(W_{out} = \\lfloor \\frac{W_{in} - {\\color{#00BFA6}{F}} + 2{\\color{#FC3E00}{P}}}{{\\color{#5073B3}{S}}} + 1 \\rfloor = 
                \\lfloor \\frac{${prevDims.width} - {\\color{#00BFA6}{${filterSize}}} + 2({\\color{#FC3E00}{${padding}}})}{{\\color{#5073B3}{${stride}}}}  + 1 \\rfloor
                 = ${outputWidth}\\)`}
              </MathJax>

              <MathJax>{`\\(D_{out} = {\\color{#BB85FC}{K}} = {\\color{#BB85FC}{${numFilters}}}\\)`}</MathJax>
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl w-full ${
            hasStarted ? "md:w-1/2 space-y-4" : "max-w-md space-y-4"
          }`}
        >
          <h2 className="text-xl font-semibold mb-2 text-text">
            Set Convolution Layer Parameters
          </h2>
          {!isOutputValid && (
            <p className="text-accent-warm text-sm">
              ⚠️ One or more values exceed the allowed limits.
            </p>
          )}
          {/* User defines kernel - Appears after user creates first layer */}
          {hasStarted && prevDims && (
            <>
              <p className="text-sm text-text-muted">
                <MathJax>{`Previous Layer Dimensions: \\(${prevDims.height} \\times ${prevDims.width} \\times ${prevDims.depth}\\)`}</MathJax>
              </p>
              <MathJax>
                <div className="space-y-3">
                  {/* Number of Filters */}
                  <label className="flex flex-col text-sm text-text-muted">
                    <span>
                      {"Number of Filters (\\(\\textcolor{#BB85FC}{K}\\))"}
                    </span>
                    <input
                      type="number"
                      value={numFilters}
                      onChange={(e) =>
                        setNumFilters(
                          Math.min(Number(e.target.value), MAX_FILTERS)
                        )
                      }
                      min={1}
                      max={MAX_FILTERS}
                      className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
                    />
                  </label>

                  {/* Filter Size  9CEADF */}
                  <label className="flex flex-col text-sm text-text-muted">
                    <span>{"Filter Size (\\(\\color{#00BFA6}{F}\\))"}</span>
                    <p className="text-xs text-stroke opacity-60">
                      Kernel/filter size is currently {filterSize}×{filterSize}
                    </p>
                    <input
                      type="number"
                      value={filterSize}
                      onChange={(e) =>
                        setFilterSize(
                          Math.min(Number(e.target.value), MAX_FILTER_SIZE)
                        )
                      }
                      min={1}
                      max={MAX_FILTER_SIZE}
                      className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
                    />
                  </label>

                  {/* Stride */}
                  <label className="flex flex-col text-sm text-text-muted">
                    <span>{"Stride (\\(\\color{#5073B3}{S}\\))"}</span>
                    <p className="text-xs text-stroke opacity-60">
                      The stride with which we slide the filter
                    </p>
                    <input
                      type="number"
                      value={stride}
                      onChange={(e) =>
                        setStride(Math.min(Number(e.target.value), MAX_STRIDE))
                      }
                      min={1}
                      max={MAX_STRIDE}
                      className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
                    />
                  </label>

                  {/* Padding */}
                  <label className="flex flex-col text-sm text-text-muted">
                    <p>
                      Size of zero-padding{" "}
                      <span>{"(\\(\\color{#FC3E00}{P}\\))"}</span>
                    </p>
                    <p className="text-xs text-stroke opacity-60">
                      Specify the amount of zeros we pad around the input volume
                      border.
                    </p>
                    <input
                      type="number"
                      value={padding}
                      onChange={(e) =>
                        setPadding(
                          Math.min(Number(e.target.value), MAX_PADDING)
                        )
                      }
                      min={0}
                      max={MAX_PADDING}
                      className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
                    />
                  </label>
                </div>
              </MathJax>
            </>
          )}

          {/* When user is creating first layer  */}
          {!hasStarted && (
            <div className="space-y-3">
              <p>Pick the dimensions of your input layer!</p>
              <p className="text-xs">
                In practice, this could be the size of an image and each
                channel/depth would correspond to a colour channel.
              </p>
              {/* Output Width */}
              <label className="flex flex-col text-sm text-text-muted">
                Width & Height (max {Math.min(MAX_WIDTH, MAX_HEIGHT)}):
                <input
                  type="number"
                  value={outputWidth} // or outputHeight — they're kept in sync
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const clamped = Math.min(val, MAX_WIDTH, MAX_HEIGHT);

                    handleOutputWidthChange(clamped);
                    handleOutputHeightChange(clamped);
                  }}
                  min={1}
                  max={Math.min(MAX_WIDTH, MAX_HEIGHT)}
                  className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
                />
              </label>

              {/* Output Depth  */}
              <label className="flex flex-col text-sm text-text-muted">
                Depth (max {MAX_DEPTH}):
                <input
                  type="number"
                  value={outputDepth}
                  onChange={(e) =>
                    handleOutputDepthChange(Number(e.target.value))
                  }
                  min={1}
                  max={MAX_DEPTH}
                  className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
                />
              </label>
            </div>
          )}

          {/* Form submission buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-muted rounded-lg border border-gray-400 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isOutputValid}
              className={`px-4 py-2 rounded-md text-white transition ${
                isOutputValid
                  ? "bg-accent hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvLayerModal;
