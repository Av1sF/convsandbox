import { useState } from "react";
import { AnimationModalKey, AnimationTrigger } from "@/utils/types";

type LayerModalKey = "conv" | "activation" | "upsample" | "downsample" | "dense";

/**
 * Manages open/closed state for both sets of modals in the visualiser:
 *
 * - Layer modals - configuration forms shown before a layer is added
 *   (e.g. conv filter size, activation type).
 * - Animation modals - step-by-step animated explanations triggered by
 *   clicking a layer region on the canvas.
 *
 * Only one modal of each set should be open at a time; callers are responsible
 * for closing the current modal before opening another.
 */
export function useModalState() {
  /** Open/closed flag for each layer-configuration modal. */
  const [layerModals, setLayerModals] = useState<Record<LayerModalKey, boolean>>({
    conv: false,
    activation: false,
    upsample: false,
    downsample: false,
    dense: false,
  });

  /** Open/closed flag for each animation modal. */
  const [animationModals, setAnimationModals] = useState<Record<AnimationModalKey, boolean>>({
    conv: false,
    downsample: false,
    dense: false,
  });

  /**
   * The animation trigger that was clicked last — passed to the animation modal
   * so it knows which layer indices to animate.
   */
  const [currAnimationTrigger, setCurrAnimationTrigger] = useState<AnimationTrigger | undefined>();

  function openLayerModal(key: LayerModalKey) {
    setLayerModals((p) => ({ ...p, [key]: true }));
  }
  function closeLayerModal(key: LayerModalKey) {
    setLayerModals((p) => ({ ...p, [key]: false }));
  }
  function openAnimationModal(key: AnimationModalKey) {
    setAnimationModals((p) => ({ ...p, [key]: true }));
  }
  function closeAnimationModal(key: AnimationModalKey) {
    setAnimationModals((p) => ({ ...p, [key]: false }));
  }

  /** `true` when no layer-configuration modal is open; used to gate canvas interactions. */
  const allLayerModalsClosed = Object.values(layerModals).every((v) => !v);

  return {
    layerModals,
    animationModals,
    currAnimationTrigger,
    setCurrAnimationTrigger,
    openLayerModal,
    closeLayerModal,
    openAnimationModal,
    closeAnimationModal,
    allLayerModalsClosed,
  };
}

export type ModalStateReturn = ReturnType<typeof useModalState>;
