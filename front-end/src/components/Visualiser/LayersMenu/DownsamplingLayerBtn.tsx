import { LayerSelectionBtnProps } from "@/utils/types";
import { MdCompress } from "react-icons/md";

/** SVG pill button that opens the pooling-method selection modal. */
export default function DownsamplingLayerBtn(props: LayerSelectionBtnProps) {
  const icon_x = props.x + 130;
  const icon_y = props.y + 16;
  return (
    <>
      <g style={{ cursor: "pointer" }} onClick={props.onClick}>
        {/* pill background */}
        <rect
          x={props.x}
          y={props.y}
          width={160}
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
          pooling layer
        </text>

        {/* right-hand icon */}
        <g
          transform={`translate(${
            icon_x
          }, ${icon_y})`}
          className="fill-text"
        >
          <MdCompress />
        </g>
      </g>
    </>
  );
}
