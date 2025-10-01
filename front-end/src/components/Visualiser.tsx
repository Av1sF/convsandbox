'use client'
import React, { useRef } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import GetStartedBtn from "./GetStartedBtn";
import { useElementSize } from "@/hooks/useElementSize";

export default function Visualiser() {
  const svgRef = useRef<SVGSVGElement>(null!);
  const { width: w, height: h } = useElementSize(svgRef);

  return (
    <div className="w-full h-[80vh] rounded-md border border-secondary overflow-auto md:overflow-visible">
    <VisualiserCanvas
        id="canvas"
        ref={svgRef}
        className="md:w-full md:h-full w-[1183px] h-[840px]"
    >
        <GetStartedBtn x={0} y={0} width={w / 4} height={h} />
    </VisualiserCanvas>
    </div>
  );
}
