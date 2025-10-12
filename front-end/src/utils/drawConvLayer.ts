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
  const rectWidth = (numColumns / 25) * 200;
  const rectHeight = (numRows / 25) * 200;

  const cellWidth = rectWidth / numColumns;
  const cellHeight = rectHeight / numRows;

  var xOffset = rectWidth * 0.25;
  const yOffset = rectHeight * 0.75;

  const startX = canvasW / (2 * maxLayers) - 0.5 * rectWidth;
  const startY = canvasH / 2 - 0.5 * rectHeight;

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
          .attr("x1", x)
          .attr("y1", startY)
          .attr("x2", x)
          .attr("y2", startY + rectHeight)
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
      for (let j = 1; j < numRows; j++) {
        const y = startY + j * cellHeight;
        layerGroup
          .append("line")
          .attr("x1", startX)
          .attr("y1", y)
          .attr("x2", startX + rectWidth)
          .attr("y2", y)
          .attr("class", "stroke-stroke")
          .attr("stroke-width", j % 5 === 0 ? 1.5 : 0.5)
          .attr("opacity", 0)
          .transition()
          .duration(400)
          .delay(j * 20)
          .attr("opacity", 1);
      }
    }
  }
};
