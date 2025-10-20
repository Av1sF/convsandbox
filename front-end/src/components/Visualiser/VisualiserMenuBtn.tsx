import "../../app/globals.css";
import { TfiLayersAlt } from "react-icons/tfi";
import ConvLayerBtn from "./Layers/ConvLayerBtn";
import ActivationLayerBtn from "./Layers/ActivationLayerBtn";
import { validLayerTypes } from "./Visualiser";

type BtnProps = {
  // start point
  x: number;
  y: number;
  // max width and height
  height: number;
  width: number;
  onAction: (action: string) => void;
  showLabel: boolean;
  validLayerTypes: validLayerTypes;
};

export default function VisualiserMenuBtn(props: BtnProps) {
  const label = props.showLabel ? "Get Started!" : "Add...";

  const svgXstart = props.width / 5 - 20;
  const svgYstart = (1.3 * props.height) / 3;

  // Individual button click handlers (add more later )
  const handleAddConvLayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onAction("add-conv-layer");
  };

  const handleAddActivationLayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onAction("add-activation");
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
            y={svgYstart + 60}
          />
        )}
      </g>
    </>
  );
}
