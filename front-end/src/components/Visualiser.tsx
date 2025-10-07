'use client'
import React, { useRef, useState } from "react";
import VisualiserCanvas from "./VisualiserCanvas";
import GetStartedBtn from "./GetStartedBtn";
import { useElementSize } from "@/hooks/useElementSize";

export default function Visualiser() {
  const svgRef = useRef<SVGSVGElement>(null!);
  const { width: w, height: h } = useElementSize(svgRef);

  // Number of Layers added 
  const [numLayers, setNumLayers] = useState<number>(0);

  // Has user started visualiser 
  const [started, setStarted] = useState<boolean>(false); 

  const handleAddLayer = () => {
    // Number of layers help decide how far to move button 
    if (!started) {
        setStarted(true);
    } 
    if (numLayers < 5) {
      setNumLayers(prev => prev + 1);
    }

  };

  return (
    <div className="w-full h-[80vh] rounded-md border border-bg-alt overflow-auto md:overflow-visible">
    <VisualiserCanvas
        id="canvas"
        ref={svgRef}
        className="md:w-full md:h-full w-[1183px] h-[840px]"
    >   
        {/* Render existing layer boxes */}
        {Array.from({ length: numLayers }).map((_, i) => (
          <g key={i}>
            <rect
              x={(w / 5) * i}
              y={0}
              width={w / 5}
              height={h}
              className="fill-text-muted stroke-stroke"
            />
          </g>
        ))}

        {/* Only render the button if fewer than 5 layers exist */}
        {numLayers < 5 && (
          <GetStartedBtn
            x={(w / 5) * numLayers}
            y={0}
            width={w / 5}
            height={h}
            onClick={handleAddLayer}
            showLabel={!started}
          />
        )}

    </VisualiserCanvas>
    </div>
  );
}
