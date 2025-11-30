"use client";
import React, { forwardRef } from "react";
type CanvasProps = {
  width?: number;
  height?: number;
  className?: string;
  children?: React.ReactNode;
  onClick: React.MouseEventHandler<SVGSVGElement>; 
  id: string;
};

const VisualiserCanvas = forwardRef<SVGSVGElement, CanvasProps>(
  ({ className = "", children, onClick}, ref) => {
    return (
      <svg ref={ref} className={className} onClick={onClick}>
        <g className="d3-root">{children}</g>
      </svg>
    );
  }
);

VisualiserCanvas.displayName = "VisualiserCanvas";

export default VisualiserCanvas;
