interface ActivationSelectModalProps {
  onClose: () => void;
  onSelect: (activation: ActivationType) => void;
}

export type ActivationType = "Tanh" | "Sigmoid" | "ReLU" | "Leaky ReLU";

export function isActivationType(value: any): value is ActivationType {
  return (
    typeof value === "string" &&
    ["Tanh", "Sigmoid", "ReLU", "Leaky ReLU"].includes(value)
  );
}

const ACTIVATIONS: {
  type: ActivationType;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    type: "Tanh",
    title: "Tanh (Hyperbolic Tangent)",
    description:
      "Outputs values between -1 and 1. Useful for centered activations and gradients.",
    icon: "📈",
  },
  {
    type: "Sigmoid",
    title: "Sigmoid",
    description:
      "Squeezes inputs to [0,1]. Common for probabilistic outputs or binary classification.",
    icon: "🔁",
  },
  {
    type: "ReLU",
    title: "ReLU (Rectified Linear Unit)",
    description:
      "Most common activation. Zero for negative values, linear for positive.",
    icon: "⚡️",
  },
  {
    type: "Leaky ReLU",
    title: "Leaky ReLU",
    description:
      "Variant of ReLU that allows a small gradient when inputs are negative.",
    icon: "💧",
  },
];

const ActivationSelectModal: React.FC<ActivationSelectModalProps> = ({
  onClose,
  onSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fadeIn relative">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Select Activation Function
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose the activation function for this layer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACTIVATIONS.map((act) => (
            <button
              key={act.type}
              onClick={() => onSelect(act.type)}
              className="flex flex-col items-start border border-gray-300 rounded-xl p-4 hover:shadow-md transition bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{act.icon}</span>
                <h3 className="font-semibold text-gray-800">{act.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{act.description}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-end mt-6">
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
