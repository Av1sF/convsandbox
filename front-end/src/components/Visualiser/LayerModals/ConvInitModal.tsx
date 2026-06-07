import { useState } from "react";
import { MAX_WIDTH, MAX_HEIGHT, MAX_DEPTH, ConvParams } from "@/utils/types";
import Modal from "@/components/Modal";

interface Props {
  onClose: () => void;
  onConfirm: (params: ConvParams) => void;
}

/**
 * Config modal for the very first layer — sets the raw input dimensions
 * (width × height × depth) before any convolution is applied.
 */
const ConvInitModal: React.FC<Props> = ({ onClose, onConfirm }) => {
  const [size, setSize] = useState(10);
  const [depth, setDepth] = useState(3);

  const isValid =
    size >= 1 &&
    size <= Math.min(MAX_WIDTH, MAX_HEIGHT) &&
    depth >= 1 &&
    depth <= MAX_DEPTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    // Kernel-related fields are zeroed — the first layer is the raw input,
    // so no convolution operation is performed on it.
    onConfirm({
      width: size,
      height: size,
      depth: depth,
      stride: 0,
      numFilters: 0,
      padding: 0,
      filterSize: 0,
      inChannels: 0,
    });
  };

  return (
    <Modal onClose={onClose} className="p-6 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-1">
          <h2 className="text-xl text-text font-semibold">Set Input Dimensions</h2>
          <p className="text-text-muted">Pick the dimensions of your input layer!</p>
          <p className="text-xs text-text-muted pb-5">
            In practice, this could be the size of an image and each
            channel/depth would correspond to a colour channel.{" "}
          </p>
          <label className="flex flex-col text-sm text-text-muted">
            Width & Height (max {Math.min(MAX_WIDTH, MAX_HEIGHT)}):
            <input
              type="number"
              value={size}
              min={1}
              max={Math.min(MAX_WIDTH, MAX_HEIGHT)}
              onChange={(e) => setSize(Number(e.target.value))}
              className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
            />
          </label>

          <label className="flex flex-col text-sm text-text-muted">
            Depth/Channels (max {MAX_DEPTH}):
            <input
              type="number"
              value={depth}
              min={1}
              max={MAX_DEPTH}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
            />
          </label>

          <div className="flex justify-end gap-2 pt-8">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="bg-accent text-white px-4 py-2 rounded-lg"
            >
              Confirm
            </button>
          </div>
        </form>
    </Modal>
  );
};

export default ConvInitModal;
