import "../../app/globals.css";
import { TfiLayersAlt } from "react-icons/tfi";
import ConvLayerBtn from "./Layers/ConvLayerBtn";

type BtnProps = {
  // start point
  x: number;
  y: number;
  // max width and height
  height: number;
  width: number;
  onAction: (action: string) => void;
  showLabel: boolean;
};

export default function VisualiserMenuBtn(props: BtnProps) {

  const label = props.showLabel ? "Get Started!" : "Add...";

  const svgXstart = props.width / 5 - 20;
  const svgYstart = (1.3 * props.height) / 3;

  // Individual button click handlers (add more later )
  const handleAddConvLayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger header pop-up 
    // wwhich then draws it... 
    props.onAction("add-conv-layer");
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

        <ConvLayerBtn
          onClick={handleAddConvLayer}
          x={svgXstart}
          y={svgYstart}
          showLabel={props.showLabel}
        />
      </g>
    </>
  );
}
