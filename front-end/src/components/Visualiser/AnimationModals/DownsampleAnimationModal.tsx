import { DownsamplingType, dummyModelDownsample, dummyModelOutputs } from "@/utils/types";
import { useRef, useState } from "react";
import { MathJax } from "better-react-mathjax";
import { useDownsampleAnimation } from "./hooks/useDownsampleAnimation";
import Modal from "@/components/Modal";
import { clearAnimations } from "@/utils/d3Cleanup";

interface Props {
  onClose: () => void;
  /** Two-element array: [downsample layer index, preceding layer index]. */
  layerIndex: number[];
  tensorLayers: dummyModelOutputs[];
}

/**
 * Modal that plays the downsampling animation for a pooling layer.
 *
 * Defers the SVG dimensions to `useDownsampleAnimation`, which resolves the
 * pooling variant and surfaces it back via `poolingType` so the correct canvas
 * size is rendered before the animation begins.
 */
const DownsampleAnimationModal: React.FC<Props> = ({ tensorLayers, layerIndex, onClose }) => {
  const modalSvgRef = useRef<SVGSVGElement | null>(null);
  const [poolingType, setPoolingType] = useState<DownsamplingType | undefined>();
  useDownsampleAnimation(modalSvgRef, tensorLayers, layerIndex, poolingType, setPoolingType);

  const handleClose = () => {
    clearAnimations(modalSvgRef.current);
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
            {/* Downsample Type - Modal Title */}
            {(tensorLayers[layerIndex[0]] as dummyModelDownsample).type}
          </h1>

          {/*  Non-global method pooling text */}
          {poolingType && !poolingType.includes("Global") && (
            <p className="text-base text-text-muted px-2 pb-5">
              Using a {(tensorLayers[layerIndex[0]] as dummyModelDownsample).filterSize}x
              {(tensorLayers[layerIndex[0]] as dummyModelDownsample).filterSize} filter and a stride of{" "}
              {(tensorLayers[layerIndex[0]] as dummyModelDownsample).stride}. This scales everything down by a factor of{" "}
              {(tensorLayers[layerIndex[0]] as dummyModelDownsample).stride}!
            </p>
          )}

          {/* Global Pooling method text */}
          {poolingType && poolingType.includes("Global") && (
            <p className="text-base text-text-muted px-2 pb-5">
              The pooling function is applied to each channel to reduce each channel to a single value.
            </p>
          )}

          {/* Orchastrate to show different types of animations depending global or non-global pooling */}
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
