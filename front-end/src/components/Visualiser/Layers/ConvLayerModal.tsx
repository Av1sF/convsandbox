import React, { useState } from "react";

export interface ConvParams {
  width: number;
  height: number;
  depth: number;
}

interface ConvModalProps {
  onClose: () => void;
  onConfirm: (params: ConvParams) => void;
}

const ConvLayerModal: React.FC<ConvModalProps> = ({ onClose, onConfirm }) => {
  const [width, setWidth] = useState<number>(25);
  const [height, setHeight] = useState<number>(25);
  const [depth, setDepth] = useState<number>(5);

  const MAX_WIDTH = 25;
  const MAX_HEIGHT = 25;
  const MAX_DEPTH = 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ width, height, depth });
  };

  const handleWidthChange = (value: number) => {
    if (value < 1) setWidth(1);
    else if (value > MAX_WIDTH) setWidth(MAX_WIDTH);
    else setWidth(value);
  };

  const handleHeightChange = (value: number) => {
    if (value < 1) setHeight(1);
    else if (value > MAX_HEIGHT) setHeight(MAX_HEIGHT);
    else setHeight(value);
  };

  const handleDepthChange = (value: number) => {
    if (value < 1) setDepth(1);
    else if (value > MAX_DEPTH) setDepth(MAX_DEPTH);
    else setDepth(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 backdrop-blur-[1px]">
      <form
        onSubmit={handleSubmit}
        className="bg-bg rounded-2xl shadow-xl w-[90%] max-w-md p-6 space-y-4 animate-fadeIn"
      >
        <h2 className="text-xl font-semibold mb-2 text-text">
          Set Convolution Layer Parameters
        </h2>

        <div className="space-y-3">
          <label className="flex flex-col text-sm text-text-muted">
            Width (max {MAX_WIDTH}):
            <input
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              min={1}
              max={MAX_WIDTH}
              className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
            />
          </label>

          <label className="flex flex-col text-sm text-text-muted">
            Height (max {MAX_HEIGHT}):
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              min={1}
              max={MAX_HEIGHT}
              className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
            />
          </label>

          <label className="flex flex-col text-sm text-text-muted">
            Depth (max {MAX_DEPTH}):
            <input
              type="number"
              value={depth}
              onChange={(e) => handleDepthChange(Number(e.target.value))}
              min={1}
              max={MAX_DEPTH}
              className="mt-1 border border-gray-300 rounded-md px-3 py-1 bg-gray-50"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-text-muted rounded-lg border border-gray-400 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-bg rounded-lg hover:bg-blue-700 transition"
          >
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConvLayerModal;
