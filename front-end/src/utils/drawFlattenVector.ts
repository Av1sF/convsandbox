/**
 * Draws a 1-D flattened vector as a vertical stack of thin rectangles.
 * Cell height adapts so the stack fits within `canvasH` even for large tensors,
 * capping at `MAX_DEPTH * MAX_WIDTH * MAX_HEIGHT * 0.75` rendered rows.
 * @param canvasW    - Canvas width in px
 * @param canvasH    - Canvas height in px
 * @param maxLayers  - Used to scale cell width
 * @param layerGroup - Target SVG group
 * @param tensor     - 2-D array `[1][n]` of flattened values
 */

import { BaseType } from "d3";
import {
  LayerConnections,
  MAX_DEPTH,
  MAX_HEIGHT,
  MAX_WIDTH,
  MidPoint,
} from "./types";
import { is2DTensor } from "./is2DTensor";

const MAX_WEIGHT = 2;
const MIN_WEIGHT = -2;

export const drawFlattenedVector = (
  canvasW: number,
  canvasH: number,
  maxLayers: number,
  layerGroup:
    | d3.Selection<SVGSVGElement | null, unknown, null, undefined>
    | d3.Selection<SVGGElement, unknown, null, undefined>
    | d3.Selection<BaseType, unknown, null, undefined>,
  tensor: number[][]
) => {
  if (!is2DTensor(tensor)) return;

  const leftMidPoints: MidPoint[] = [];
  const rightMidPoints: MidPoint[] = [];
  const result: LayerConnections = [leftMidPoints, rightMidPoints];

  const match = /translate\(([^,]+),\s*([^)]+)\)/.exec(
    layerGroup.attr("transform")
  );

  const actualX = match ? parseFloat(match[1]) : 0;

  const numRows = tensor[0].length;

  const rectHeight = numRows <= MAX_DEPTH * MAX_WIDTH * MAX_HEIGHT*0.5?
    Math.trunc(canvasH) / (MAX_DEPTH * MAX_WIDTH * MAX_HEIGHT*0.5): Math.trunc(canvasH) / (1.5*MAX_DEPTH * MAX_WIDTH * MAX_HEIGHT);
  const rectWidth = Math.trunc(0.8 * canvasW);

  const totalRectHeight = rectHeight * numRows;

  const startX = 0;
  const startY = canvasH / 2 - 0.5 * totalRectHeight;

  // Draw n number of rectangles
  for (let i = 0; i < Math.min(numRows, MAX_DEPTH * MAX_WIDTH * MAX_HEIGHT * 0.75); i++) {
    let randomOpacity = Math.random();

    if (is2DTensor(tensor)) {
      randomOpacity = tensor[0][i];
      randomOpacity += Math.abs(MIN_WEIGHT);
      randomOpacity /= Math.abs(MIN_WEIGHT) + MAX_WEIGHT;
      if (randomOpacity > 1) {
        randomOpacity = 1.0;
      } else if (randomOpacity < 0) {
        randomOpacity = 0.0;
      }
    }

    layerGroup
      .append("rect")
      .attr("id", `rect-${i}`)
      .attr("x", startX)
      .attr("y", startY + i * (rectHeight))
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("fill", "#5f6c7b")
      .style("opacity", 0)
      .transition()
      .duration(400)
      .delay(i * 10)
      .style("opacity", randomOpacity);

    leftMidPoints.push({
      x: startX + actualX,
      y: startY + (i * rectHeight * 0.5),
    });

    rightMidPoints.push({
      x: startX + actualX + rectWidth,
      y: startY + (i * rectHeight * 0.5),
    });

  }

  return result;
};
