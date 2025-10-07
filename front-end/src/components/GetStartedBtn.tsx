import '../app/globals.css';
import { TfiLayersAlt } from "react-icons/tfi";

type BtnProps = {
    // start point 
  x: number;
  y: number; 
    // max width and height 
  height: number;
  width: number; 
  onClick: () => void;
  showLabel: boolean; 
};

// TODO think about button move and box thing 

export default function GetStartedBtn (props: BtnProps) {
    const label = props.showLabel ? "Get Started!" : "Add...";
    
    const svg_x_start = props.width / 5 - 20;
    const svg_y_start = 1.3 * props.height / 3;

    const icon_x = svg_x_start + 196;
    const icon_y = svg_y_start  + 16; 
    const short_icon_x = icon_x - 30;
  return (
    <>
        <g
        transform={`translate(${props.x}, ${props.y})`}
        style={{ cursor: "pointer" }}
        onClick={props.onClick}
        >
        {/* first label above rectangle, aligned left */}
        <text
            x={svg_x_start}
            y={svg_y_start - 20} // 10px above the rect
            textAnchor="start" // align to left edge
            dominantBaseline="auto" // align baseline
            className="fill-text-muted font-main"
        >
            {label}
        </text>

        {/* pill background */}
        <rect
            x={svg_x_start}
            y={svg_y_start}
            width={props.showLabel? 230: 200}
            height={50}
            rx={25}
            className="fill-bg stroke-text hover:fill-gray-100 transition-colors"
        />

        {/* plus icon */}
        <circle
            cx={svg_x_start + 25}
            cy={svg_y_start + 25}
            r={15}
            className="fill-bg-alt hover:fill-stroke"
        />
        <text
            x={svg_x_start + 25}
            y={svg_y_start + 26}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="20"
            className="fill-text font-bold"
        >
            +
        </text>

        {/* add label */}
        <text
            x={svg_x_start + 48}
            y={svg_y_start + 29}
            fontSize="13"
            className="fill-text-muted font-secondary pointer-events-none"
        >
            {/* add convolutional layer */}
            {props.showLabel? "add convolutional layer": "convolutional layer"}
        </text>

        {/* right-hand icon */}
        <g transform={`translate(${props.showLabel? icon_x: short_icon_x}, ${icon_y})`} className="fill-text">
            <TfiLayersAlt />
        </g>
        </g>

    </>
  )
}
