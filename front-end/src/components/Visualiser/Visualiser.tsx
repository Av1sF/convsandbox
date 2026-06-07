"use client";
import { useRef } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import VisualiserMenuBtn from "./VisualiserMenuBtn";
import VisualiserSmallPlusBtn from "./VisualiserSmallPlusBtn";
import ConvLayerModal from "./LayerModals/ConvLayerModal";
import ActivationSelectModal from "./LayerModals/ActivationSelectModal";
import UpsamplingSelectModal from "./LayerModals/UpsamplingSelectModal";
import DownsamplingSelectModal from "./LayerModals/DownsamplingSelectModal";
import DenseLayerModal from "./LayerModals/DenseLayerModal";
import ConvAnimationModal from "./AnimationModals/ConvAnimationModal";
import DenseAnimationModal from "./AnimationModals/DenseAnimationModal";
import DownsampleAnimationModal from "./AnimationModals/DownsampleAnimationModal";
import { ParameterCount } from "./CalculationModals/ParameterCount";
import { ReceptiveFieldCount } from "./CalculationModals/ReceptiveFieldCount";
import { useLayerState } from "./hooks/useLayerState";
import { useModalState } from "./hooks/useModalState";
import { useLayerHandlers } from "./hooks/useLayerHandlers";
import { useVisualizerD3 } from "./hooks/useVisualizerD3";
import { convLayerDims, MAXLAYERS } from "@/utils/types";

const W = 1183;
const H = 500;

/**
 * Root visualiser component. Composes the four hooks into a single view:
 * - `useLayerState` / `useModalState` — all state
 * - `useLayerHandlers` — event callbacks wired to state mutations
 * - `useVisualizerD3` — imperative D3 rendering, runs as a side-effect
 *
 * Renders the SVG canvas, the floating layer-add menu, the parameter/receptive-field
 * counters, all layer-config modals, and all animation modals.
 */
export default function Visualiser() {
  const svgRef = useRef<SVGSVGElement>(null!);
  const layerState = useLayerState();
  const modalState = useModalState();
  const handlers = useLayerHandlers(layerState, modalState, svgRef);
  useVisualizerD3(layerState, modalState, svgRef);

  const {
    numLayers, layers, tensorLayers, started,
    prevLayerDims, allowedLayerTypes, menuAnnotation,
  } = layerState;

  const {
    layerModals, animationModals, currAnimationTrigger,
    closeLayerModal, closeAnimationModal,
  } = modalState;

  const {
    handleMenuAction, handleConvConfirm, handleActivationSelect,
    handleUpsamplingSelect, handleDownsamplingSelect,
    handleDenseNeuronSelect, handleVisualiserClick,
  } = handlers;

  return (
    <div className="w-full caret-transparent md:w-[1183px] h-[550px] rounded-md border border-bg-alt overflow-auto md:overflow-hidden">
      <VisualiserCanvas
        id="canvas"
        ref={svgRef}
        onClick={handleVisualiserClick}
        className="w-[1183px] h-[500px] d3-root select-none"
      >
        {numLayers < MAXLAYERS && (
          <VisualiserMenuBtn
            x={(W / MAXLAYERS) * numLayers}
            y={-50}
            width={W / MAXLAYERS}
            height={H}
            onAction={handleMenuAction}
            showLabel={!started}
            validLayerTypes={allowedLayerTypes}
            annotation={menuAnnotation}
          />
        )}

        {/* At max structural layers only activation layers can still be added —
            the full menu is replaced by a compact + button wired directly to that action.
            The x offset shifts slightly when the last layer already has an activation
            to avoid overlapping its label. */}
        {numLayers === MAXLAYERS && (
          <VisualiserSmallPlusBtn
            x={
              layers[layers.length - 1].type !== "add-activation"
                ? (W / MAXLAYERS) * (numLayers * 0.95) + 17
                : (W / MAXLAYERS) * (numLayers * 0.95)
            }
            y={H * 0.092}
            onClick={() => handleMenuAction("add-activation")}
          />
        )}
      </VisualiserCanvas>

      {numLayers > 0 && (
        <>
          <div className="flex gap-1.5">
            <ParameterCount layers={layers} tensorLayers={tensorLayers} />
            <ReceptiveFieldCount layers={layers} tensorLayers={tensorLayers} />
          </div>
          <p className="pl-4 font-light opacity-60 text-xs">
            <sub className="font-light text-xs italic">
              Wonder how it&apos;s all calculated? — Click on it! &nbsp;&nbsp;
              (receptive field only works with convolutional layers)
            </sub>
          </p>
        </>
      )}

      {layerModals.conv && (
        <ConvLayerModal
          prevDims={prevLayerDims as convLayerDims}
          onClose={() => closeLayerModal("conv")}
          onConfirm={handleConvConfirm}
          hasStarted={started}
        />
      )}
      {layerModals.activation && (
        <ActivationSelectModal
          onClose={() => closeLayerModal("activation")}
          onSelect={handleActivationSelect}
        />
      )}
      {layerModals.upsample && (
        <UpsamplingSelectModal
          prevDims={prevLayerDims as convLayerDims}
          onClose={() => closeLayerModal("upsample")}
          onConfirm={handleUpsamplingSelect}
        />
      )}
      {layerModals.downsample && (
        <DownsamplingSelectModal
          prevDims={prevLayerDims as convLayerDims}
          onClose={() => closeLayerModal("downsample")}
          onConfirm={handleDownsamplingSelect}
        />
      )}
      {layerModals.dense && (
        <DenseLayerModal
          onClose={() => closeLayerModal("dense")}
          onConfirm={handleDenseNeuronSelect}
        />
      )}

      {animationModals.conv && (
        <ConvAnimationModal
          onClose={() => closeAnimationModal("conv")}
          layerIndex={currAnimationTrigger ? currAnimationTrigger.layerNumber : []}
          tensorLayers={tensorLayers}
        />
      )}
      {animationModals.downsample && (
        <DownsampleAnimationModal
          onClose={() => closeAnimationModal("downsample")}
          layerIndex={currAnimationTrigger ? currAnimationTrigger.layerNumber : []}
          tensorLayers={tensorLayers}
        />
      )}
      {animationModals.dense && (
        <DenseAnimationModal
          onClose={() => closeAnimationModal("dense")}
          layerIndex={currAnimationTrigger ? currAnimationTrigger.layerNumber : []}
          tensorLayers={tensorLayers}
        />
      )}
    </div>
  );
}
