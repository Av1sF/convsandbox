import React, { useState } from "react";
import Modal from "@/components/Modal";

interface DenseLayerModalProps {
  onClose: () => void;
  onConfirm: (numNeurons: number) => void;
}

const MAX_NEURONS = 10;

const DenseLayerModal: React.FC<DenseLayerModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const [neurons, setNeurons] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (neurons < 1 || neurons > MAX_NEURONS) return; // safety guard
    onConfirm(neurons);
  };

  return (
    <Modal
      onClose={onClose}
      overlayClassName="backdrop-blur-[1px] overflow-y-auto"
      className="bg-white shadow-xl w-full max-w-md p-6 animate-fadeIn"
    >
        {/* === Header === */}
        <h2 className="text-xl font-semibold text-text-muted mb-2">
          Add Fully-Connected (Dense) Layer
        </h2>
        <p className="text-sm text-text-muted mb-6">
          Specify the number of neurons for this dense layer.
        </p>

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col text-sm text-text-muted">
            Number of Neurons
            <input
              type="number"
              value={neurons}
              min={1}
              max={MAX_NEURONS}
              onChange={(e) =>
                setNeurons(Number(e.target.value))
              }
              className="mt-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="text-xs text-text-muted mt-1">
              Max allowed neurons: {MAX_NEURONS}
            </span>
          </label>

          {/* === Error Message === */}
          {neurons > MAX_NEURONS && (
            <p className="text-accent-warm text-sm">
              You cannot exceed {MAX_NEURONS} neurons.
            </p>
          )}

          {/* === Footer Buttons === */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-muted rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={neurons < 1 || neurons > MAX_NEURONS}
              className={`px-4 py-2 rounded-lg text-white transition ${
                neurons < 1 || neurons > MAX_NEURONS
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-accent hover:bg-blue-700"
              }`}
            >
              Confirm
            </button>
          </div>
        </form>
    </Modal>
  );
};

export default DenseLayerModal;
