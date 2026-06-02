import { dummyModelOutputs } from "@/utils/types";
import { useRef } from "react";
import * as d3 from "d3";
import { MathJax } from "better-react-mathjax";
import { useDenseAnimation } from "./hooks/useDenseAnimation";
import Modal from "@/components/Modal";

interface Props {
  onClose: () => void;
  layerIndex: number[];
  tensorLayers: dummyModelOutputs[];
}

const DenseAnimationModal: React.FC<Props> = ({ tensorLayers, layerIndex, onClose }) => {
  const modalSvgRef = useRef<SVGSVGElement | null>(null);
  useDenseAnimation(modalSvgRef, tensorLayers, layerIndex);

  const handleClose = () => {
    d3.select(modalSvgRef.current).selectAll("*").remove();
    onClose();
  };

  return (
    <Modal
      onClose={handleClose}
      showCloseButton
      overlayClassName="p-4 sm:p-6"
      className="max-w-[80hh] max-h-[90vh] sm:max-h-[95vh] overflow-y-auto p-4 sm:p-6"
    >
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
    </Modal>
  );
};

export default DenseAnimationModal;
