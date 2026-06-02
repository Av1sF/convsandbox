import { dummyModelOutputs } from "@/utils/types";
import { useRef } from "react";
import * as d3 from "d3";
import { MathJax } from "better-react-mathjax";
import { useDenseAnimation } from "./hooks/useDenseAnimation";

interface Props {
  onClose: () => void;
  layerIndex: number[];
  tensorLayers: dummyModelOutputs[];
}

const DenseAnimationModal: React.FC<Props> = ({ tensorLayers, layerIndex, onClose }) => {
  const modalSvgRef = useRef<SVGSVGElement | null>(null);
  useDenseAnimation(modalSvgRef, tensorLayers, layerIndex);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 p-4 sm:p-6">
      <div className="bg-bg rounded-2xl max-w-[80hh] max-h-[90vh] sm:max-h-[95vh] overflow-y-auto p-4 sm:p-6 relative">
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
          <h1 className="text-text text-2xl pb-3 font-semibold">
            Flattening: Transitioning from Convolutional to Fully-Connected Layers
          </h1>
          <p className="text-base text-text-muted px-2 pb-5">
            The curves display the weights connecting one neuron from the flattened layer to the dense layer.
          </p>
          <div className="relative max-h-[700px] max-w-[1100px] overflow-auto">
            <MathJax>
              <svg ref={modalSvgRef} className="w-[1100px] h-[650px]"></svg>
            </MathJax>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DenseAnimationModal;
