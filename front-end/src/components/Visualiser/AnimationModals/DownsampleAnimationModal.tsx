import { DownsamplingType, dummyModelDownsample, dummyModelOutputs } from "@/utils/types";
import { useRef, useState } from "react";
import * as d3 from "d3";
import { MathJax } from "better-react-mathjax";
import { useDownsampleAnimation } from "./hooks/useDownsampleAnimation";
import Modal from "@/components/Modal";

interface Props {
  onClose: () => void;
  layerIndex: number[];
  tensorLayers: dummyModelOutputs[];
}

const DownsampleAnimationModal: React.FC<Props> = ({ tensorLayers, layerIndex, onClose }) => {
  const modalSvgRef = useRef<SVGSVGElement | null>(null);
  const [poolingType, setPoolingType] = useState<DownsamplingType | undefined>();
  useDownsampleAnimation(modalSvgRef, tensorLayers, layerIndex, poolingType, setPoolingType);

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
            {(tensorLayers[layerIndex[0]] as dummyModelDownsample).type}
          </h1>

          {poolingType && !poolingType.includes("Global") && (
            <p className="text-base text-text-muted px-2 pb-5">
              Using a {(tensorLayers[layerIndex[0]] as dummyModelDownsample).filterSize}x
              {(tensorLayers[layerIndex[0]] as dummyModelDownsample).filterSize} filter and a stride of{" "}
              {(tensorLayers[layerIndex[0]] as dummyModelDownsample).stride}. This scales everything down by a factor of{" "}
              {(tensorLayers[layerIndex[0]] as dummyModelDownsample).stride}!
            </p>
          )}

          {poolingType && poolingType.includes("Global") && (
            <p className="text-base text-text-muted px-2 pb-5">
              The pooling function is applied to each channel to reduce each channel to a single value.
            </p>
          )}

          {poolingType && (
            <div className={`relative max-h-[${poolingType.includes("Global") ? "800px" : "650px"}] max-w-[900px] overflow-auto`}>
              <MathJax>
                {!poolingType.includes("Global") && (
                  <svg ref={modalSvgRef} className="w-[900px] h-[650px]"></svg>
                )}
                {poolingType.includes("Global") && (
                  <svg ref={modalSvgRef} className="w-[700px] h-[650px]"></svg>
                )}
              </MathJax>
            </div>
          )}
        </div>
    </Modal>
  );
};

export default DownsampleAnimationModal;
