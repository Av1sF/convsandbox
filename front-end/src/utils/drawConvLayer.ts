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
import { isNumberParam } from './typeGuards';

function is3DTensor(t: any): t is number[][][][] {
  return (
    Array.isArray(t) &&
    t.every(
      a =>
        Array.isArray(a) &&
        a.every(b => Array.isArray(b))
    )
  );
}

export const drawConvLayer = (
  canvasW: number,
  canvasH: number,
  numDepth: number,
  numColumns: number,
  numRows: number,
  maxLayers: number,
  layerGroup:
    | d3.Selection<SVGGElement, unknown, null, undefined>
    | d3.Selection<BaseType, unknown, null, undefined>,
  tensor?: number | number[] | number[][] | number[][][] | number[][][][] | number[][][][][] | number[][][][][][]
) => {
  const rectWidth = Math.trunc(
    (numColumns / 25) * ((0.63 * canvasW) / maxLayers)
  );
  const rectHeight = Math.trunc(
    (numRows / 25) * ((0.63 * canvasW) / maxLayers)
  );

  const leftMidPoints: MidPoint[] = [];
  const rightMidPoints: MidPoint[] = [];
  const result: LayerConnections = [leftMidPoints, rightMidPoints];
  const cellWidth = rectWidth / numColumns;
  const cellHeight = rectHeight / numRows;

  const match = /translate\(([^,]+),\s*([^)]+)\)/.exec(
    layerGroup.attr("transform")
  );

  const actualX = match ? parseFloat(match[1]) : 0;

  var xOffset;
  var yOffset;
  if (numColumns <= 5) {
    xOffset = rectWidth * 0.8;
  } else if (5 < numColumns && numColumns <= 10) {
    xOffset = Math.trunc(rectWidth * 0.4);
  } else {
    xOffset = Math.trunc(rectWidth * 0.1);
  }

  if (numColumns <= 5) {
    yOffset = rectHeight * 0.6;
  } else if (numRows <= 10) {
    yOffset = Math.trunc(rectHeight * 0.4);
  } else {
    yOffset = Math.trunc(rectHeight * 0.2);
  }

  let totalConvHeight = rectHeight + (numDepth - 1) * yOffset;
  let totalConvWidth = rectWidth + (numDepth - 1) * xOffset;

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

    var rightPointY;
    if (j != numDepth - 1) {
      rightPointY = startY + j * yOffset + 0.5 * yOffset;
    } else {
      rightPointY = startY + j * yOffset + rectHeight / 2;
    }
    rightMidPoints.push({
      x: Math.min(
        startX + j * xOffset + actualX + rectWidth,
        startX + actualX + rectWidth + (numDepth - 1) * xOffset
      ),
      y: rightPointY,
    });

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numColumns; col++) {
        const x = startX + j * xOffset + col * cellWidth;
        const y = startY + j * yOffset + row * cellHeight;
        var randomOpacity = Math.random(); 
   
        if (is3DTensor(tensor)) {
          if (isNumberParam(tensor[0][row][col][j])) {
            randomOpacity = tensor[0][row][col][j];
          }
        }

        layerGroup
          .append("rect")
          .attr("x", x)
          .attr("y", y)
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          // .attr("class", "stroke-text")
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
