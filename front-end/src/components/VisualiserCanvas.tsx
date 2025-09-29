'use client'
import { useRef, useEffect } from "react"; 
import * as d3 from "d3"

type CanvasProps = {
    width?: number; 
    height?: number;
    className?: string; 
    children?: React.ReactNode;
}

const VisualiserCanvas: React.FC<CanvasProps> = ({ 
  width = 800, 
  height = 600, 
  className = "", 
  children 
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // optional cleanup if you want "fresh" mounts
  }, []);

  return (
    <svg
      ref={svgRef}
 
      className={`${className}`}
    >
      <g className="d3-root">{children}</g>
    </svg>
  );
};

export default VisualiserCanvas;