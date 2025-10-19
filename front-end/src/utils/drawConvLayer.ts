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
export const drawConvLayer = (
  canvasW: number,
  canvasH: number,
  numDepth: number,
  numColumns: number,
  numRows: number,
  maxLayers: number,
  layerGroup: d3.Selection<SVGGElement, unknown, null, undefined>
) => {
  const rectWidth = Math.trunc((numColumns / 25) * 150);
  const rectHeight = Math.trunc((numRows / 25) * 150);

  const cellWidth = rectWidth / numColumns;
  const cellHeight = rectHeight / numRows;

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

  // Draw n number of rectangles/squares
  for (let j = 0; j < numDepth; j++) {
    layerGroup
      .append("rect")
      .attr("x", startX + j * xOffset)
      .attr("y", startY + j * yOffset)
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("class", "fill-bg stroke-text")
      .style("opacity", 0)
      .transition()
      .duration(400)
      .delay(j * 150)
      .style("opacity", 1);

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
};
