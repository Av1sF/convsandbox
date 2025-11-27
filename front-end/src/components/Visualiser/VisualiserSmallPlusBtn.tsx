import { LayerActionType, LayerSelectionBtnProps } from "@/utils/types";

export default function VisualiserSmallPlusBtn(props: LayerSelectionBtnProps) {
  return (
    <>
      {/* Convolutivonal Layer Button */}
      <g style={{ cursor: "pointer" }} onClick={props.onClick}>
        {/* plus icon */}
        <circle
          cx={props.x + 25}
          cy={props.y + 25}
          r={15}
          className="fill-bg-alt hover:fill-stroke"
        />
        <text
          x={props.x + 25}
          y={props.y + 26}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          className="fill-text font-bold"
        >
          +
        </text>
      </g>
    </>
  );
}
