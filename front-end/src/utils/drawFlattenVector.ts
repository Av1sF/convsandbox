/**
 * Draws a convolutional layer into the provided D3 selection.
 * @param canvasW - The width of the canvas in px
 * @param canvasH - The height of the canvas in px
 * @param numDepth - Depth of the conv layer (max 5)
 * @param numColumns - Width of the conv layer (max 25)
 * @param numRows - Height of the conv layer (max 25)
 * @param maxLayers - Max number of layers user can add (max 5)
 * @param layerGroup - The i th layer svg group
 * @param tensor
 */

import { BaseType } from "d3";
import {
  LayerConnections,
  MAX_DEPTH,
  MAX_HEIGHT,
  MAX_WIDTH,
  MidPoint,
} from "./types";
import { isNumberParam } from "./typeGuards";
import { is3DTensor } from "./is3DTensor";
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

  const rectHeight =
    Math.trunc(canvasH) / (MAX_DEPTH * MAX_WIDTH * MAX_HEIGHT*0.5);
  const rectWidth = Math.trunc(0.8 * canvasW);

  const totalRectHeight = rectHeight * numRows;

  const startX = 0;
  const startY = canvasH / 2 - 0.5 * totalRectHeight;

  // Draw n number of rectangles
  for (let i = 0; i < numRows; i++) {
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
