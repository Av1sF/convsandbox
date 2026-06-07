/**
 * Draws all filter/kernel grids for a convolutional layer.
 * Returns a `LayerConnections[]` with one entry per filter, each containing
 * left and right midpoints per input channel — used to draw the bezier
 * connection lines in the conv animation modal.
 * @param canvasW    - Canvas width in px
 * @param canvasH    - Canvas height in px
 * @param maxLayers  - Used to scale tile dimensions
 * @param layerGroup - Target SVG group
 * @param tensor     - 4-D kernel tensor `[filterSize, filterSize, inChannels, numFilters]`
 */

import { BaseType } from "d3";
import { isNumberParam } from "./typeGuards";
import { is3DTensor } from "./is3DTensor";
import { LayerConnections } from "./types";

const MAX_WEIGHT = 1;
const MIN_WEIGHT = -1;

export const drawKernels = (
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
  if (!is3DTensor(tensor)) return;
  
  const numFilter = tensor[0][0][0].length
  const inChannels = tensor[0][0].length 
  const filterSize = tensor.length

  const rectWidth = Math.trunc((0.4 * canvasW) / maxLayers);
  const rectHeight = Math.trunc((0.4 * canvasW) / maxLayers);

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


  const result: LayerConnections[] = [];
  
  const totalConvHeight = rectHeight + (inChannels - 1) * yOffset; 
  const totalConvWidth = rectWidth + (numFilter - 1) * xOffset; 

  const startY = canvasH / 2 - 0.5* totalConvHeight
  const startX = canvasW / 2 - 0.5*totalConvWidth

  const match = /translate\(([^,]+),\s*([^)]+)\)/.exec(
    layerGroup.attr("transform")
  );

  const actualX = match ? parseFloat(match[1]) : 0;


  // 1 col = 1 filter 
  for (let f=0; f < numFilter; f++) {
    result[f] = [[],[]]
    
    // each row is a channel 
    for (let j = 0; j < inChannels; j++) {
      layerGroup
      .append("rect")
      .attr("id",   `k-${f}-${j}`)
      .attr("x", startX + f * xOffset)
      .attr("y", startY + j * yOffset)
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("class", "fill-bg stroke-text")
      .style("opacity", 0)
      .transition()
      .duration(400)
      .delay(j * 150)
      .style("opacity", 1);

      // left and right midpoints 
      result[f][0].push({
      x: startX + f * xOffset + actualX,
      y: startY + j * yOffset + rectHeight / 2,
    })

    result[f][1].push({
      x: startX + f * xOffset + actualX + rectWidth,
      y: startY + j * yOffset + rectHeight / 2,
    })


      for (let row = 0; row < filterSize; row++) {
            for (let col = 0; col < filterSize; col++) {
              const x = startX + f * xOffset + col * cellWidth;
              const y = startY + j * yOffset + row * cellHeight;
              let randomOpacity = Math.random(); 
        
              if (is3DTensor(tensor)) {
                if (isNumberParam(tensor[row][col][j][f])) {
                  // Normalise value from [MIN_WEIGHT, MAX_WEIGHT] to [0, 1] for CSS opacity; clamp outliers.
                  randomOpacity = tensor[row][col][j][f];
                  randomOpacity += Math.abs(MIN_WEIGHT)
                  randomOpacity /= Math.abs(MIN_WEIGHT) + MAX_WEIGHT
                  if (randomOpacity > 1) {
                    randomOpacity = 1.0
                  } else if (randomOpacity < 0) {
                    randomOpacity = 0.0 
                  }
                }
              } 

              layerGroup
                .append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", cellWidth)
                .attr("height", cellHeight)
                .attr("id",   `square-${row}-${col}-${j}-${f}`)
                .attr("fill", "#5f6c7b")
                .style("opacity", 0)
                .transition()
                .duration(400)
                .delay((row * filterSize + col) * 10)
                .style("opacity", randomOpacity);
            }
          }
    }

    
    

  }
  return result
};
