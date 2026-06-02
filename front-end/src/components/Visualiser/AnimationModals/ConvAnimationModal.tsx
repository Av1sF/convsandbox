import { dummyModelOutputs } from "@/utils/types";
import { useRef } from "react";
import * as d3 from "d3";
import { MathJax } from "better-react-mathjax";
import { useConvAnimation } from "./hooks/useConvAnimation";

interface Props {
  onClose: () => void;
  layerIndex: number[];
  tensorLayers: dummyModelOutputs[];
}

const ConvAnimationModal: React.FC<Props> = ({ tensorLayers, layerIndex, onClose }) => {
  const modalSvgRef = useRef<SVGSVGElement | null>(null);
  useConvAnimation(modalSvgRef, tensorLayers, layerIndex);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 p-4 sm:p-6">
      <div className="bg-bg rounded-2xl w-full max-w-[80hh] max-h-[90vh] sm:max-h-[95vh] overflow-y-auto p-4 sm:p-6 relative">
        <button
          onClick={() => {
            d3.select(modalSvgRef.current).selectAll("*").remove();
            onClose();
          }}
          className="absolute top-3 right-4 text-2xl sm:text-xl text-foreground/70 hover:text-foreground transition"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="mt-6 sm:mt-0">
          <h1 className="text-text text-2xl pb-3 font-semibold">Applying Convolutions...</h1>
          <p className="text-base text-text-muted px-2 pb-5">
            A convolution transforms an input vector into an output vector such that each output element is a weighted
            sum of nearby input elements. Each weighted sum is determined by a convolutional filter. A convolutional
            filter contains several kernels, where the number of kernels corresponds directly to the number of input
            channels. Multiple filters can be used, and the number of filters equals the number of output channels.
            Each filter performs a convolution operation over the entire input vector.
          </p>
          <div className="relative max-h-1/3 max-w-[2100px] overflow-auto">
            <MathJax>
              <svg ref={modalSvgRef} className="w-[2100px] h-[650px]"></svg>
            </MathJax>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvAnimationModal;
