import { dummyModelActivation, dummyModelConv, dummyModelOutputs } from "@/utils/types";

interface Props {
  onClose: () => void;
  layerIndex: number[], 
  tensorLayers: dummyModelOutputs[]
}

const ConvAnimation: React.FC<Props> = ({layerIndex, onClose }) => {
  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 p-4 sm:p-6">
      <div
        className="
          bg-bg rounded-2xl 
          w-full max-w-3xl 
          max-h-[90vh] sm:max-h-[95vh]
          overflow-y-auto 
          p-4 sm:p-6 
          relative
        "
      >
        <button
          onClick={onClose}
          className="
            absolute top-3 right-4 
            text-2xl sm:text-xl 
            text-foreground/70 hover:text-foreground 
            transition
          "
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mt-3 sm:mt-0 ">
          <h1 className="text-text">Applying Convolutions...</h1>
        </div>
      </div>
    </div>
  );
};

export default ConvAnimation;
