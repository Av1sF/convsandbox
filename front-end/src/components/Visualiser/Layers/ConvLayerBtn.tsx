import { ConvLayerSelectionBtnProps } from "@/app/types";
import { TfiLayersAlt } from "react-icons/tfi";

export default function ConvLayerBtn(props: ConvLayerSelectionBtnProps) {
  const icon_x = props.x + 197;
  const icon_y = props.y + 16;
  const short_icon_x = icon_x - 40;
  return (
    <>
      {/* Convolutivonal Layer Button */}
      <g style={{ cursor: "pointer" }} onClick={props.onClick}>
        {/* pill background */}
        <rect
          x={props.x}
          y={props.y}
          width={props.showLabel ? 230 : 185}
          height={50}
          rx={25}
          className="fill-bg stroke-text hover:fill-gray-100 transition-colors"
        />

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

        {/* add label */}
        <text
          x={props.x + 48}
          y={props.y + 29}
          fontSize="13"
          className="fill-text-muted font-secondary pointer-events-none"
        >
          {/* add convolutional layer */}
          {props.showLabel ? "add convolutional layer" : "convolution layer"}
        </text>

        {/* right-hand icon */}
        <g
          transform={`translate(${
            props.showLabel ? icon_x : short_icon_x
          }, ${icon_y})`}
          className="fill-text"
        >
          <TfiLayersAlt />
        </g>
      </g>
    </>
  );
}
