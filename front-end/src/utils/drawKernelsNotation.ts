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
import { is3DTensor } from "./is3DTensor";
import { LayerConnections, MidPoint } from "./types";

const MAX_WEIGHT = 1;
const MIN_WEIGHT = -1;

export const drawKernelsNotations = (
 
  canvasW: number,
  canvasH: number,
  maxLayers: number,
  startX: number,
  startY: number,
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
    | number[][][][][][],
    biasColor:string,
  biasValue: number,
  filternum: number, 
) => {
  if (!is3DTensor(tensor)) return;
  
  const numFilter = tensor[0][0][0].length
  const inChannels = tensor[0][0].length 
  const filterSize = tensor.length

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


  const result: LayerConnections[] = [];
  
  const totalConvHeight = rectHeight + (numFilter - 1) * yOffset; 
  const totalConvWidth = rectWidth + (inChannels - 1) * xOffset; 

  const match = /translate\(([^,]+),\s*([^)]+)\)/.exec(
    layerGroup.attr("transform")
  );

  const actualX = match ? parseFloat(match[1]) : 0;
  
  layerGroup.append("text")
  .attr("x", startX -65)
  .attr("y", startY-3)
  .attr("width", 30)
  .attr("height", 30)
  .attr("font-size", 60)
  .attr("class", `font-mono`)
  .text("α")
  .append("tspan")
  .attr("class", "font-main")
  .text("[")
  .style("opacity", 1)

  layerGroup.append("text")
  .attr("x", totalConvWidth + 100 + 35)
  .attr("y", startY-3)
  .attr("width", 30)
  .attr("height", 30)
  .attr("font-size", 60)
  .attr("id", (d, i) => `diagramatic-right-bracket`)
  .text("] = ")
  .append("tspan")
  .attr("class", `font-mono`)
  .text("α")
  .append("tspan")
  .attr("class", "font-main")
  .text("[‎ ‎ ‎‎ ‎‎ ‎ ‎ ] = ")
  .style("opacity", 1)

  layerGroup.append("circle")
  .attr("cx", totalConvWidth + 100)
  .attr("cy", startY-20)
  .attr("r", 30)
  .attr("class", `stroke-text`)
  .attr("fill", biasColor)
        .style("opacity", 0)
        .transition()
        .duration(400)
        .delay(100)
        .style("opacity", 1)

  layerGroup.append("text")
  .attr("x", totalConvWidth + 88)
  .attr("y", startY-20)
  .attr("width", 30)
  .attr("height", 30)
  .attr("font-size", 12)
  .text(biasValue.toFixed(2).toString())
  .style("opacity", 1)

  layerGroup.append("text")
  .attr("x", totalConvWidth + 95)
  .attr("y", startY-5)
  .attr("width", 30)
  .attr("height", 30)
  .attr("font-size", 12)
  .append("tspan")
            .attr("font-size", 12)
            .text(`β`)
            .append("tspan")
            .attr("baseline-shift", "sub")
            .attr("font-size", 10)
            .text(`${filternum + 1}`)
  .style("opacity", 1)
  

  for (let f=0; f < inChannels; f++) {
    result[f] = [[],[]]
    
    // each row is a channel 
    for (let j = 0; j < numFilter; j++) {
      layerGroup
      .append("rect")
      .attr("id", (d, i) => `k-${f}-${j}`)
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

      layerGroup.append("text")
      .attr("x", startX + f * xOffset + 0.5*rectWidth - 5)
      .attr("y", startY + j * yOffset - 5  )
      .text("⋅")
      .style("opacity", 0)
      .attr("font-size", 40)
      .transition()
      .duration(400)
      .delay(j * 150)
      .style("opacity", 1);
      

        layerGroup.append("text")
      .attr("x", startX + f * xOffset + 1.25*rectWidth - 5)
      .attr("y", startY + j * yOffset - 10 )
      .text("+")
      .style("opacity", 0)
      .attr("font-size", 30)
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
                if (isNumberParam(tensor[row][col][f][j])) {
                  // negative opacity shit solution 
                  // what to do -> future map them to a RGB range 
                  // more than 1 -> another shade -> etc... 
                  randomOpacity = tensor[row][col][f][j];
                  randomOpacity += Math.abs(MIN_WEIGHT)
                  randomOpacity /= Math.abs(MIN_WEIGHT) + MAX_WEIGHT
                  if (randomOpacity > 1) {
                    randomOpacity = 1.0
                  } else if (randomOpacity < 0) {
                    randomOpacity = 0.0 
                  }
                }
              } 

              const cell = layerGroup
              .append("g")
              .attr("id", (d, i) => `square-${row}-${col}-${f}-${j}`)
            
              cell
                .append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", cellWidth)
                .attr("height", cellHeight)
                .attr("fill", "#5f6c7b")
                .style("opacity", 0)
                .transition()
                .duration(400)
                .delay((row * filterSize + col) * 10)
                .style("opacity", randomOpacity);
              
              if (filterSize < 4) {
                cell.append("foreignObject")
                .attr("x", x + 0.25 * cellWidth)
                .attr("y", y + 0.25 * cellHeight)
                .attr("width", cellWidth)
                .attr("height", cellHeight)
                .attr("font-size", (filterSize == 3? 6: 10))
                .style("color", "#333")
                .style("opacity", "1")
                .html(`<div style="line-height:${(filterSize == 3? 6: 10)}px;"><span>${tensor[row][col][f][j].toFixed(2)} </br> \\(w_{${row+1}${col+1}${col+1}}\\)</span></div>`)

              }
            }
          }
    }

    
    

  }
  return result
};
