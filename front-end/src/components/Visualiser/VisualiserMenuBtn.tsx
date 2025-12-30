import ConvLayerBtn from "./LayersMenu/ConvLayerBtn";
import ActivationLayerBtn from "./LayersMenu/ActivationLayerBtn";
import UpsamplingLayerBtn from "./LayersMenu/UpsamplingLayerBtn";
import { LayerActionType, VisualiserMenuBtnProps } from "@/utils/types";
import DownsamplingLayerBtn from "./LayersMenu/DownsamplingLayerBtn";
import DneseLayerBtn from "./LayersMenu/DenseLayerBtn";

export default function VisualiserMenuBtn(props: VisualiserMenuBtnProps) {
  const label = props.showLabel ? "Get Started!" : "Add...";

  const svgXstart = props.width / 6 - 24;
  const svgYstart = (1.3 * props.height) / 3;
  const buttonYoffset = 60;

  const handleAdd = (action: LayerActionType) => (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onAction(action);
  };

  const buttons = [
    {
      key: "conv",
      visible: props.validLayerTypes.conv,
      component: (
        <ConvLayerBtn
          onClick={handleAdd("add-conv-layer")}
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
          onClick={handleAdd("add-activation")}
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
          onClick={handleAdd("add-upsampling")}
          x={svgXstart}
          y={0}
        />
      ),
    },
    {
      key: "downsample",
      visible: props.validLayerTypes.downsample && !props.showLabel,
      component: (
        <DownsamplingLayerBtn
          onClick={handleAdd("add-downsampling")}
          x={svgXstart}
          y={0}
        />
      ),
    },
    {
      key: "dense",
      visible: props.validLayerTypes.dense && !props.showLabel,
      component: (
        <DneseLayerBtn
          onClick={handleAdd("add-dense-layer")}
          x={svgXstart}
          y={0}
        />
      ),
    },
  ];

  const visibleButtons = buttons.filter((b) => b.visible);

  return (
    <g transform={`translate(${props.x}, ${props.y})`}>
      <text
        x={svgXstart}
        y={svgYstart - 20}
        textAnchor="start"
        dominantBaseline="auto"
        className="fill-text-muted font-main"
      >
        {label}
      </text>

      {visibleButtons.map((btn, i) => (
        <g
          key={btn.key}
          transform={`translate(0, ${svgYstart + i * buttonYoffset})`}
        >
          {btn.component}
        </g>
      ))}

      {props.annotation && 
        <g
          key={"annotation"}
          transform={`translate(10, ${
            svgYstart + visibleButtons.length * buttonYoffset + 10
          })`}
        >
          {/* {btn.component} */}
          <foreignObject width="200" height="200">
            <div
              className="text-text-muted italic text-xs font-main whitespace-normal break-words max-w-[250px] leading-tight fixed"
            >
              {props.annotation}
            </div>
          </foreignObject>
        </g>
      }
    </g>
  );
}
