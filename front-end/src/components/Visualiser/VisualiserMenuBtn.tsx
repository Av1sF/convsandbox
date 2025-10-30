import ConvLayerBtn from "./Layers/ConvLayerBtn";
import ActivationLayerBtn from "./Layers/ActivationLayerBtn";
import UpsamplingLayerBtn from "./Layers/UpsamplingLayerBtn";
import { VisualiserMenuBtnProps } from "@/utils/types";

export default function VisualiserMenuBtn(props: VisualiserMenuBtnProps) {
  const label = props.showLabel ? "Get Started!" : "Add...";

  const svgXstart = props.width / 6 - 24;
  const svgYstart = (1.3 * props.height) / 3;
  const buttonYoffset = 60;

  // Handlers
  const handleAddConvLayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onAction("add-conv-layer");
  };

  const handleAddActivationLayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onAction("add-activation");
  };

  const handleAddUpsamplingLayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onAction("add-upsampling");
  };

  // 👇 Array of available button configurations
  const buttons = [
    {
      key: "conv",
      visible: props.validLayerTypes.conv,
      component: (
        <ConvLayerBtn
          onClick={handleAddConvLayer}
          x={svgXstart}
          y={0}
          showLabel={props.showLabel}
        />
      ),
    },
    {
      key: "activation",
      visible: props.validLayerTypes.activation && !props.showLabel,
      component: (
        <ActivationLayerBtn
          onClick={handleAddActivationLayer}
          x={svgXstart}
          y={0}
        />
      ),
    },
    {
      key: "upsample",
      visible: props.validLayerTypes.upsample && !props.showLabel,
      component: (
        <UpsamplingLayerBtn
          onClick={handleAddUpsamplingLayer}
          x={svgXstart}
          y={0}
        />
      ),
    },
  ];

  // Filter only visible ones
  const visibleButtons = buttons.filter((b) => b.visible);

  return (
    <g transform={`translate(${props.x}, ${props.y})`}>
      {/* Title text above buttons */}
      <text
        x={svgXstart}
        y={svgYstart - 20}
        textAnchor="start"
        dominantBaseline="auto"
        className="fill-text-muted font-main"
      >
        {label}
      </text>

      {/* Dynamically stack visible buttons */}
      {visibleButtons.map((btn, i) => (
        <g key={btn.key} transform={`translate(0, ${svgYstart + i * buttonYoffset})`}>
          {btn.component}
        </g>
      ))}
    </g>
  );
}
