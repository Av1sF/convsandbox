import { useState } from "react";
import { AnimationModalKey, AnimationTrigger } from "@/utils/types";

type LayerModalKey = "conv" | "activation" | "upsample" | "downsample" | "dense";

export function useModalState() {
  const [layerModals, setLayerModals] = useState<Record<LayerModalKey, boolean>>({
    conv: false,
    activation: false,
    upsample: false,
    downsample: false,
    dense: false,
  });

  const [animationModals, setAnimationModals] = useState<Record<AnimationModalKey, boolean>>({
    conv: false,
    downsample: false,
    dense: false,
  });

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
