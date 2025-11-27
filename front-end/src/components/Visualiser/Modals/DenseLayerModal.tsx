import React, { useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">

        {/* === Header === */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Add Dense (Fully Connected) Layer
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Specify the number of neurons for this dense layer.
        </p>

        {/* === Form === */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col text-sm text-gray-700">
            Number of Neurons
            <input
              type="number"
              value={neurons}
              min={1}
              max={MAX_NEURONS}
              onChange={(e) =>
                setNeurons(Math.min(Number(e.target.value), MAX_NEURONS))
              }
              className="mt-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="text-xs text-gray-500 mt-1">
              Max allowed neurons: {MAX_NEURONS}
            </span>
          </label>

          {/* === Error Message === */}
          {neurons > MAX_NEURONS && (
            <p className="text-red-600 text-sm">
              You cannot exceed {MAX_NEURONS} neurons.
            </p>
          )}

          {/* === Footer Buttons === */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={neurons < 1 || neurons > MAX_NEURONS}
              className={`px-4 py-2 rounded-lg text-white transition ${
                neurons < 1 || neurons > MAX_NEURONS
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DenseLayerModal;
