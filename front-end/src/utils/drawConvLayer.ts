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
import { LayerConnections, MidPoint } from "./types";
import { isNumberParam } from "./typeGuards";
import { is3DTensor } from "./is3DTensor";
import { is2DTensor } from "./is2DTensor";

const MAX_WEIGHT = 100;
const MIN_WEIGHT = -100;

export const drawConvLayer = (
  canvasW: number,
  canvasH: number,
  maxLayers: number,
  layerGroup:
    | d3.Selection<SVGSVGElement | null, unknown, null, undefined>
    | d3.Selection<SVGGElement, unknown, null, undefined>
    | d3.Selection<BaseType, unknown, null, undefined>,
  tensor:
    | number
    | number[]
    | number[][]
    | number[][][]
    | number[][][][]
    | number[][][][][]
    | number[][][][][][]
) => {
  console.log(!(is3DTensor(tensor) && is2DTensor(tensor)))
  if (!(is3DTensor(tensor) || is2DTensor(tensor))) return;
  const numColumns = is3DTensor(tensor)? tensor[0].length: 1;
  const numRows = is3DTensor(tensor)? tensor[0][0].length: 1;
  const numDepth = is3DTensor(tensor)? tensor[0][0][0].length: tensor[0].length;
  
  const rectWidth = Math.trunc((0.7 * canvasW) / maxLayers);

  const rectHeight = Math.trunc((0.7 * canvasW) / maxLayers);

  const leftMidPoints: MidPoint[] = [];
  const rightMidPoints: MidPoint[] = [];
  const result: LayerConnections = [leftMidPoints, rightMidPoints];
  const cellWidth = rectWidth / numColumns;
  const cellHeight = rectHeight / numRows;

  const match = /translate\(([^,]+),\s*([^)]+)\)/.exec(
    layerGroup.attr("transform")
  );

  const actualX = match ? parseFloat(match[1]) : 0;

  const xOffset = 0;
  let yOffset;

  if (numRows <= 5) {
    yOffset = rectHeight * 1.5;
  } else if (numRows <= 10) {
    yOffset = Math.trunc(rectHeight * 1.3);
  } else {
    yOffset = Math.trunc(rectHeight * 1.1);
  }

  const totalConvHeight = rectHeight + (numDepth - 1) * yOffset;
  const totalConvWidth = rectWidth + (numDepth - 1) * xOffset;

  const startX = canvasW / (2 * maxLayers) - 0.5 * totalConvWidth;
  const startY = canvasH / 2 - 0.5 * totalConvHeight;

  const rectStartYs = [];

  for (let i = 0; i < numDepth; i++) {
    rectStartYs.push(startY + i * yOffset);
  }

  // Draw n number of rectangles/squares
  for (let j = 0; j < numDepth; j++) {
    layerGroup
      .append("rect")
      .attr("id", (d, i) => `rect-${j}`)
      .attr("x", startX + j * xOffset)
      .attr("y", rectStartYs[j])
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("class", "fill-bg stroke-text")
      .style("opacity", 0)
      .transition()
      .duration(400)
      .delay(j * 150)
      .style("opacity", 1);

    // left mid point of square
    leftMidPoints.push({
      x: startX + j * xOffset + actualX,
      y: startY + j * yOffset + rectHeight / 2,
    });


    rightMidPoints.push({
      x:  startX + j * xOffset + actualX + rectWidth,
      y: startY + j * yOffset + rectHeight / 2,
    });

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numColumns; col++) {
        const x = startX + j * xOffset + col * cellWidth;
        const y = startY + j * yOffset + row * cellHeight;
        let randomOpacity = Math.random();

        if (is3DTensor(tensor)) {
          if (isNumberParam(tensor[0][row][col][j])) {
            // negative opacity shit solution
            // what to do -> future map them to a RGB range
            // more than 1 -> another shade -> etc...
            randomOpacity = tensor[0][row][col][j];
            
            randomOpacity += Math.abs(MIN_WEIGHT);
            randomOpacity /= Math.abs(MIN_WEIGHT) + MAX_WEIGHT;
            if (randomOpacity > 1) {
              randomOpacity = 1.0;
            } else if (randomOpacity < 0) {
              randomOpacity = 0.0;
            }
          }

        } else if (is2DTensor(tensor)) {
          randomOpacity = tensor[row][j];
          console.log(randomOpacity)
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
          .attr("x", x)
          .attr("y", y)
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          .attr("id", (d, i) => `square-${row}-${col}-${j}`)
          .attr("fill", "#5f6c7b")
          .style("opacity", 0)
          .transition()
          .duration(400)
          .delay((row * numColumns + col) * 10)
          .style("opacity", randomOpacity);
      }
    }
  }

  return result;
};
