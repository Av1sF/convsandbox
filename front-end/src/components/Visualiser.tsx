'use client'
import React, { useRef } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import GetStartedBtn from "./GetStartedBtn";
import { useElementSize } from "@/hooks/useElementSize";

export default function Visualiser() {
  const svgRef = useRef<SVGSVGElement>(null!);
  const { width: w, height: h } = useElementSize(svgRef);

  return (
    <VisualiserCanvas
      id="canvas"
      className="w-full h-[80vh] rounded-md border border-secondary"
      ref={svgRef}
    >
      <text x={200} y={200}>
        {w} {h}
      </text>
      <GetStartedBtn x={w/4} y={h/4} />
    </VisualiserCanvas>
  );
}
