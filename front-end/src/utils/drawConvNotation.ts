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
import { isNumberParam } from "./typeGuards";
import { is2DTensor } from "./is2DTensor";

const MAX_WEIGHT = 100;
const MIN_WEIGHT = -100;

export const drawConvNotation = (
  color: string,
  canvasW: number,
  canvasH: number,
  maxLayers: number,
  startX: number,
  startY: number,
  i: number,
  j: number,
  l: number,
  layerGroup:
    | d3.Selection<SVGSVGElement | null, unknown, null, undefined>
    | d3.Selection<SVGGElement, unknown, null, undefined>
    | d3.Selection<BaseType, unknown, null, undefined>,
  delay: number,
  tensor:
    | number
    | number[]
    | number[][]
    | number[][][]
    | number[][][][]
    | number[][][][][]
    | number[][][][][][],
  last?: boolean
) => {
  if (!is2DTensor(tensor)) return;

  const filterSize = tensor.length;

  const rectWidth = Math.trunc((1.1 * canvasW) / maxLayers);
  const rectHeight = Math.trunc((1.1 * canvasW) / maxLayers);

  const cellWidth = rectWidth / filterSize;
  const cellHeight = rectHeight / filterSize;

  let yOffset;
  if (filterSize <= 5) {
    yOffset = rectHeight * 1.15;
  } else if (filterSize <= 10) {
    yOffset = Math.trunc(rectHeight * 1.15);
  } else {
    yOffset = Math.trunc(rectHeight * 1.15);
  }

  let xOffset;
  if (filterSize <= 5) {
    xOffset = rectWidth * 1.6;
  } else if (5 < filterSize && filterSize <= 10) {
    xOffset = Math.trunc(rectWidth * 1.6);
  } else {
    xOffset = Math.trunc(rectWidth * 1.6);
  }

  var rect = layerGroup.append("g");

  const haschildren = !layerGroup.select(`#k-${l}`).empty();

  if (!haschildren) {
    rect
      .append("rect")
      .attr("id", (d, _) => `k-${l}`)
      .attr("x", startX)
      .attr("y", startY)
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("class", "fill-bg stroke-text")
      // .attr("fill", color)
      .style("opacity", 1);
  }

  for (let row = 0; row < filterSize; row++) {
    for (let col = 0; col < filterSize; col++) {
      const x = startX + col * cellWidth;
      const y = startY + row * cellHeight;
      let randomOpacity = Math.random();

      if (is2DTensor(tensor)) {
        if (isNumberParam(tensor[row][col])) {
          // negative opacity shit solution
          // what to do -> future map them to a RGB range
          // more than 1 -> another shade -> etc...
          randomOpacity = tensor[row][col];
          randomOpacity += Math.abs(MIN_WEIGHT);
          randomOpacity /= Math.abs(MIN_WEIGHT) + MAX_WEIGHT;
          if (randomOpacity > 1) {
            randomOpacity = 1.0;
          } else if (randomOpacity < 0) {
            randomOpacity = 0.0;
          }
        }
      } else {
      }
      if (!last) {
        const cell = layerGroup
          .append("g")
          .attr("id", (d, _) => `square-${row}-${col}`);

        cell
          .append("rect")
          .attr("x", x)
          .attr("y", y)
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          .attr("fill", "#5f6c7b")
          .style("opacity", 0)
          .transition()
          .duration(0)
          .delay(delay)
          .style("opacity", randomOpacity)
          .transition()
          .delay(1000)
          .remove();

        if (filterSize < 4) {
          cell
            .append("text")
            .attr("x", x + 0.25 * cellWidth)
            .attr("y", y + 0.5 * cellHeight - 4)
            .attr("width", cellWidth)
            .attr("text-anchor", "left")
            .attr("font-size", filterSize == 3 ? 5 : 8)
            .attr("height", cellHeight)
            .transition()
            .duration(0)
            .delay(delay)
            .text(`${tensor[row][col].toFixed(2)}`)
            .transition()
            .delay(1000)
            .remove();

          cell
            .append("text")
            .attr("id", (d, _) => `text-${row}-${col}`)
            .attr("x", x + 0.25 * cellWidth + 3)
            .attr("y", y + 0.5 * cellHeight + 7)
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .attr("text-anchor", "left")
            .append("tspan")
            .attr("font-size", 8)
            .text("x")
            .append("tspan")
            .attr("baseline-shift", "sub")
            .attr("font-size", filterSize === 3 ? 5 : 8)
            .text(`${i + row + 1},${j + col + 1},${l + 1}`);

          cell
            .select(`#text-${row}-${col}`)
            .attr("opacity", 0)
            .transition()
            .duration(0)
            .delay(delay)
            .attr("opacity", 1)
            .transition()
            .delay(1000)
            .remove();
        }
      } else {
        const cell = layerGroup
          .append("g")
          .attr("id", (d, _) => `square-${row}-${col}`);

        cell
          .append("rect")
          .attr("x", x)
          .attr("y", y)
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          .attr("fill", "#5f6c7b")
          .style("opacity", 0)
          .transition()
          .duration(0)
          .delay(delay)
          .style("opacity", randomOpacity);

        if (filterSize < 4) {
          cell
            .append("text")
            .attr("x", x + 0.25 * cellWidth)
            .attr("y", y + 0.5 * cellHeight - 4)
            .attr("width", cellWidth)
            .attr("text-anchor", "left")
            .attr("font-size", filterSize == 3 ? 5 : 8)
            .attr("height", cellHeight)
            .transition()
            .duration(0)
            .delay(delay)
            .text(`${tensor[row][col].toFixed(2)}`);

          cell
            .append("text")
            .attr("id", (d, _) => `text-${row}-${col}`)
            .attr("x", x + 0.25 * cellWidth + 3)
            .attr("y", y + 0.5 * cellHeight + 7)
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .attr("text-anchor", "left")
            .append("tspan")
            .attr("font-size", 8)
            .text("x")
            .append("tspan")
            .attr("baseline-shift", "sub")
            .attr("font-size", filterSize === 3 ? 5 : 8)
            .text(`${i + row + 1},${j + col + 1},${l + 1}`);

          cell
            .select(`#text-${row}-${col}`)
            .attr("opacity", 0)
            .transition()
            .duration(0)
            .delay(delay)
            .attr("opacity", 1);
        }
      }
    }
  }


  if (!last) {
  rect
    .append("rect")
    .attr("id", (d, _) => `k-${l}-color`)
    .attr("x", startX)
    .attr("y", startY)
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    // .attr("class", "fill-bg stroke-text")
    .attr("fill", color)

    .style("opacity", 0)
    .transition()
    .duration(0)
    .delay(delay)
    .style("opacity", 0.7)
    .transition()
    .delay(1000)
    .remove();
  } else {
    rect
    .append("rect")
    .attr("id", (d, _) => `k-${l}-color`)
    .attr("x", startX)
    .attr("y", startY)
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .attr("fill", color)
    .style("opacity", 0)
    .transition()
    .duration(0)
    .delay(delay)
    .style("opacity", 0.7)
 
  }

  return rect;
};
