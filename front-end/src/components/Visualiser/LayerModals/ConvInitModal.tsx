import { useState } from "react";
import { MAX_WIDTH, MAX_HEIGHT, MAX_DEPTH, ConvParams } from "@/utils/types";

interface Props {
  onClose: () => void;
  onConfirm: (params: ConvParams) => void;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 p-4">
      <div className="bg-bg rounded-2xl p-6 w-full max-w-md">
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
              className="mt-1 border px-3 py-1 rounded-md"
            />
          </label>

          <label className="flex flex-col text-sm text-text-muted">
            Depth (max {MAX_DEPTH}):
            <input
              type="number"
              value={depth}
              min={1}
              max={MAX_DEPTH}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="mt-1 border px-3 py-1 rounded-md"
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
      </div>
    </div>
  );
};

export default ConvInitModal;
