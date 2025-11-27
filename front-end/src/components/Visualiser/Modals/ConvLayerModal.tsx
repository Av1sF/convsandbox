// ConvLayerModal.tsx
// import ConvKernelModal from "./ConvKernelModal";
import { ConvParams, LayerDims } from "@/utils/types";
import ConvInitModal from "./ConvInitModal";
import ConvKernelModal from "./ConvKernelModal";

interface ConvModalProps {
  onClose: () => void;
  onConfirm: (params: ConvParams) => void;
  hasStarted: boolean;
  prevDims?: LayerDims;
}

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