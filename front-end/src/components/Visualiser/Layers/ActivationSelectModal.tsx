import { MathJax } from "better-react-mathjax";
import React from "react";

export type ActivationType = "Tanh" | "Sigmoid" | "ReLU" | "Leaky ReLU";

export function isActivationType(value: any): value is ActivationType {
  return (
    typeof value === "string" &&
    ["Tanh", "Sigmoid", "ReLU", "Leaky ReLU"].includes(value)
  );
}

interface ActivationSelectModalProps {
  onClose: () => void;
  onSelect: (activation: ActivationType) => void;
}

const ACTIVATIONS: {
  type: ActivationType;
  title: string;
  formula: React.ReactElement;
  description: string;
  graph: React.ReactElement;
}[] = [
  {
    type: "Tanh",
    title: "Tanh (Hyperbolic Tangent)",
    formula: (
      <MathJax>{`\\(tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}}\\)`}</MathJax>
    ),
    description:
      "Outputs values between -1 and 1. Useful for centered activations and smooth gradients.",
    graph: (
      <svg width="80" height="60" viewBox="0 0 100 60">
        <path
          d="M0,49 20,49 C59,48 46,3 96,3"
          stroke="#16a34a"
          strokeWidth="2"
          fill="none"
        />
        <line x1="50" y1="0" x2="50" y2="60" stroke="#999" strokeWidth="0.5" />
        <line x1="0" y1="30" x2="100" y2="30" stroke="#999" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    type: "Sigmoid",
    title: "Sigmoid",
    formula: <MathJax>{`\\(\\sigma(x) = \\frac{1}{1 + e^{-x}}\\)`}</MathJax>,
    description:
      "Maps any real number into the range [0, 1]. Common for probabilities and binary classification.",
    graph: (
      <svg width="80" height="60" viewBox="0 0 100 60">
        <path
          d="M0,58 20,58 C59,57 46,12 96,12 "
          stroke="#2563eb"
          strokeWidth="2"
          fill="none"
        />
        <line x1="50" y1="0" x2="50" y2="60" stroke="#999" strokeWidth="0.5" />
        <line x1="0" y1="60" x2="100" y2="60" stroke="#999" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    type: "ReLU",
    title: "ReLU (Rectified Linear Unit)",
    formula: <MathJax>{`\\(f(x) = max(0, x)\\)`}</MathJax>,
    description:
      "Outputs 0 for negative inputs and increases linearly for positive values.",
    graph: (
      <svg width="80" height="60" viewBox="0 0 100 60">
        <path
          d="M10,50 L50,50 L90,10"
          stroke="#dc2626"
          strokeWidth="2"
          fill="none"
        />
        <line x1="50" y1="0" x2="50" y2="60" stroke="#999" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#999" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    type: "Leaky ReLU",
    title: "Leaky ReLU",
    formula: <MathJax>{`\\(f(x) = max(0.01x, x)\\)`}</MathJax>,
    description:
      "Similar to ReLU, but allows a small negative slope for x < 0 to prevent dead neurons.",
    graph: (
      <svg width="80" height="60" viewBox="0 0 100 60">
        <path
          d="M10,55 L50,50 L90,10"
          stroke="#9333ea"
          strokeWidth="2"
          fill="none"
        />
        <line x1="50" y1="0" x2="50" y2="60" stroke="#999" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#999" strokeWidth="0.5" />
      </svg>
    ),
  },
];

const ActivationSelectModal: React.FC<ActivationSelectModalProps> = ({
  onClose,
  onSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-6 ">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-8 animate-fadeIn relative max-h-[95vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          Select Activation Function
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose the activation function for this layer.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACTIVATIONS.map((act) => (
            <button
              key={act.type}
              onClick={() => onSelect(act.type)}
              className="flex flex-col items-center border border-gray-300 rounded-2xl p-5 hover:shadow-lg transition bg-gray-50 hover:bg-gray-100"
            >
              <div className="mb-2">{act.graph}</div>
              <h3 className="font-semibold text-gray-800 text-center">
                {act.title}
              </h3>
              <div className="text-sm text-gray-700 my-1">{act.formula}</div>
              <p className="text-xs text-gray-600 text-center mt-1">
                {act.description}
              </p>
            </button>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-400 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivationSelectModal;
