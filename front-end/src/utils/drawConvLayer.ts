/**
 * Draws a convolutional layer into the provided D3 selection.
 * @param canvasW - The width of the canvas in px
 * @param canvasH - The height of the canvas in px
 * @param numDepth - Depth of the conv layer (max 5)
 * @param numColumns - Width of the conv layer (max 25)
 * @param numRows - Height of the conv layer (max 25)
 * @param maxLayers - Max number of layers user can add (max 5)
 * @param layerGroup - The i th layer svg group
 */

import { BaseType } from "d3";
import { LayerConnections, MidPoint } from "./types";

export const drawConvLayer = (
  canvasW: number,
  canvasH: number,
  numDepth: number,
  numColumns: number,
  numRows: number,
  maxLayers: number,
  layerGroup: d3.Selection<SVGGElement, unknown, null, undefined> | d3.Selection<BaseType, unknown, null, undefined>
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

    // var rightMidPointY = startY + j * yOffset + rectHeight / 2;
    // var numXoffset = numDepth - 1;
    // var biggerThan = rectStartYs.filter((num) => num < rightMidPointY);
    // if (biggerThan.length != 0) {
    //   numXoffset = Math.max(biggerThan.length - 1 - j, 0);
    // }

    // rightMidPoints.push({
    //   x: Math.min(
    //     startX + (j + numXoffset) * xOffset + actualX + rectWidth,
    //     startX + actualX + rectWidth + (numDepth - 1) * xOffset
    //   ),
    //   // x: Math.max((startX + j * xOffset + actualX + rectWidth + (Math.floor((rectHeight / 2)/yOffset) * xOffset)), numDepth* xOffset + actualX),
    //   y: rightMidPointY,
    // });

    var rightPointY; 
    if (j != numDepth-1){
      rightPointY = startY + j * yOffset + 0.5*yOffset
    } else {
      rightPointY = startY + j * yOffset + rectHeight / 2
    }
    rightMidPoints.push({
      x: Math.min(
        startX + (j) * xOffset + actualX + rectWidth,
        startX + actualX + rectWidth + (numDepth - 1) * xOffset
      ),
      y: rightPointY,
    });

    // console.log(rightMidPoints)
    // console.log(leftMidPoints)


    // Vertical grid lines
    if (numColumns > 1) {
      for (let i = 1; i < numColumns; i++) {
        const x = startX + i * cellWidth;
        layerGroup
          .append("line")
          .attr("x1", x + j * xOffset)
          .attr("y1", startY + j * yOffset)
          .attr("x2", x + j * xOffset)
          .attr("y2", startY + rectHeight + j * yOffset)
          .attr("class", "stroke-stroke")
          .attr("stroke-width", i % 5 === 0 ? 1.5 : 0.5)
          .attr("opacity", 0)
          .transition()
          .duration(400)
          .delay(i * 20)
          .attr("opacity", 1);
      }
    }

    // Horizontal grid lines
    if (numRows > 1) {
      for (let i = 1; i < numRows; i++) {
        const y = startY + i * cellHeight;
        layerGroup
          .append("line")
          .attr("x1", startX + j * xOffset)
          .attr("y1", y + j * yOffset)
          .attr("x2", startX + rectWidth + j * xOffset)
          .attr("y2", y + j * yOffset)
          .attr("class", "stroke-stroke")
          .attr("stroke-width", i % 5 === 0 ? 1.5 : 0.5)
          .attr("opacity", 0)
          .transition()
          .duration(400)
          .delay(i * 20)
          .attr("opacity", 1);
      }
    }
  }

  return result;
};
