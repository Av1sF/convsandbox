import "../../app/globals.css";
import ConvLayerBtn from "./Layers/ConvLayerBtn";
import ActivationLayerBtn from "./Layers/ActivationLayerBtn";
import UpsamplingLayerBtn from "./Layers/UpsamplingLayerBtn";
import { VisualiserMenuBtnProps } from "@/app/types";

export default function VisualiserMenuBtn(props: VisualiserMenuBtnProps) {
  const label = props.showLabel ? "Get Started!" : "Add...";

  const svgXstart = props.width / 6 - 24;
  const svgYstart = (1.3 * props.height) / 3;
  const buttonYoffset = 60

  // Individual button click handlers (add more later )
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

  return (
    <>
      <g transform={`translate(${props.x}, ${props.y})`}>
        {/* first label above rectangle, aligned left */}
        <text
          x={svgXstart}
          y={svgYstart - 20} // 10px above the rect
          textAnchor="start" // align to left edge
          dominantBaseline="auto" // align baseline
          className="fill-text-muted font-main"
        >
          {label}
        </text>

        {props.validLayerTypes.conv && (
          <ConvLayerBtn
            onClick={handleAddConvLayer}
            x={svgXstart}
            y={svgYstart}
            showLabel={props.showLabel}
          />
        )}

        {!props.showLabel && props.validLayerTypes.activation && (
          <ActivationLayerBtn
            onClick={handleAddActivationLayer}
            x={svgXstart}
            y={svgYstart + buttonYoffset}
          />
        )}

        {!props.showLabel && props.validLayerTypes.activation && (
          <UpsamplingLayerBtn
            onClick={handleAddUpsamplingLayer}
            x={svgXstart}
            y={svgYstart + buttonYoffset * 2}
          />
        )}
      </g>
    </>
  );
}
