import { ConvParams, LayerDims } from "@/utils/types";
import ConvInitModal from "./ConvInitModal";
import ConvKernelModal from "./ConvKernelModal";

interface ConvModalProps {
  onClose: () => void;
  onConfirm: (params: ConvParams) => void;
  hasStarted: boolean;
  prevDims?: LayerDims;
}

/**
 * Router component: shows `ConvInitModal` for the very first layer (input
 * dimensions only) and `ConvKernelModal` for every subsequent conv layer
 * (kernel/filter/stride/padding configuration).
 */
const ConvLayerModal: React.FC<ConvModalProps> = ({
  onClose,
  onConfirm,
  hasStarted,
  prevDims,
}) => {
  if (hasStarted && prevDims) {
    return (
      <ConvKernelModal
        onClose={onClose}
        onConfirm={onConfirm}
        prevDims={prevDims}
      />
    );
  }

  return <ConvInitModal onClose={onClose} onConfirm={onConfirm} />;
};

export default ConvLayerModal;