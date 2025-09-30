import '../app/globals.css';
type BtnProps = {
  x: number;
  y: number;
  onClick?: () => void;
};

export default function GetStartedBtn (props: BtnProps) {
    const label = "Get Started!";
  return (
    <>
        <g
            transform={`translate(${props.x}, ${props.y})`}
            style={{ cursor: "pointer" }}
            // onClick={onClick}
        >
            <text 
                x = {props.x}
                y = {props.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-stroke "
            >
                {label}
            </text>

        </g>
    </>
  )
}
