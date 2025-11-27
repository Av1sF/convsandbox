"use client";
import React, { forwardRef } from "react";
type CanvasProps = {
  width?: number;
  height?: number;
  className?: string;
  children?: React.ReactNode;
  id: string;
};

const VisualiserCanvas = forwardRef<SVGSVGElement, CanvasProps>(
  ({ className = "", children }, ref) => {
    return (
      <svg ref={ref} className={className}>
        <g className="d3-root">{children}</g>
      </svg>
    );
  }
);

VisualiserCanvas.displayName = "VisualiserCanvas";

export default VisualiserCanvas;
