// ConvKernelModal.tsx
import { useState, useEffect } from "react";
import {
  ConvParams,
  LayerDims,
  MAX_DEPTH,
  MAX_FILTERS,
  MAX_FILTER_SIZE,
  MAX_HEIGHT,
  MAX_PADDING,
  MAX_STRIDE,
  MAX_WIDTH,
} from "@/utils/types";
import { MathJax } from "better-react-mathjax";

interface Props {
  onClose: () => void;
  onConfirm: (params: ConvParams) => void;
  prevDims: LayerDims;
}

const ConvKernelModal: React.FC<Props> = ({ onClose, onConfirm, prevDims }) => {
  const [numFilters, setNumFilters] = useState(1);
  const [filterSize, setFilterSize] = useState(2);
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(0);

  const [outW, setOutW] = useState(1);
  const [outH, setOutH] = useState(1);
  const [outD, setOutD] = useState(5);

  // compute output dims
  useEffect(() => {
    setOutW(
      Math.floor((prevDims.width + 2 * padding - filterSize) / stride + 1)
    );
    setOutH(
      Math.floor((prevDims.height + 2 * padding - filterSize) / stride + 1)
    );
    setOutD(numFilters);
  }, [filterSize, stride, padding, numFilters,  prevDims]);

  const isValid =
    outW > 0 &&
    outD > 0 &&
    outH > 0 &&
    outW <= MAX_WIDTH &&
    outD <= MAX_DEPTH &&
    outH <= MAX_HEIGHT;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    onConfirm({
      width: outW,
      height: outH,
      depth: numFilters,
      stride,
      padding,
      filterSize,
      numFilters,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 p-4">
      <div className="bg-bg rounded-2xl p-6 w-full max-w-3xl flex flex-col md:flex-row gap-8">
        <div className="flex-1 text-sm text-text-muted">
          <h3 className="text-base font-semibold mb-2">Output Dimensions</h3>
          <p>
            <strong>
              <MathJax className="opacity-60">
                {"\\(H_{out} \\times W_{out} \\times D_{out}\\)"}
              </MathJax>
              <MathJax>{`\\(${outH} \\times ${outW} \\times ${outD}\\)`}</MathJax>
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
                 = ${outH}\\)`}
            </MathJax>

            <MathJax className="py-4">
              {`\\(W_{out} = \\lfloor \\frac{W_{in} - {\\color{#00BFA6}{F}} + 2{\\color{#FC3E00}{P}}}{{\\color{#5073B3}{S}}} + 1 \\rfloor = 
                \\lfloor \\frac{${prevDims.width} - {\\color{#00BFA6}{${filterSize}}} + 2({\\color{#FC3E00}{${padding}}})}{{\\color{#5073B3}{${stride}}}}  + 1 \\rfloor
                 = ${outW}\\)`}
            </MathJax>

            <MathJax>{`\\(D_{out} = {\\color{#BB85FC}{K}} = {\\color{#BB85FC}{${numFilters}}}\\)`}</MathJax>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="md:w-1/2 space-y-4">
          <h2 className="text-xl font-semibold mb-2 text-text">
            Set Convolution Layer Parameters
          </h2>

          {!isValid && (
            <p className="text-accent-warm text-sm">
              ⚠️ One or more values exceed the allowed limits.
            </p>
          )}

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
                    setNumFilters(Math.min(Number(e.target.value), MAX_FILTERS))
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
                    setPadding(Math.min(Number(e.target.value), MAX_PADDING))
                  }
                  min={0}
                  max={MAX_PADDING}
                  className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
                />
              </label>
            </div>
          </MathJax>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="bg-accent px-4 py-2 text-white rounded-lg"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvKernelModal;
