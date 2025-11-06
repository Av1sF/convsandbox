/**
 * Draws a dense (fully connected) layer into the provided D3 selection.
 * @param canvasW - Width of the canvas in px
 * @param canvasH - Height of the canvas in px
 * @param numNeurons - Number of neurons in this dense layer (max 10)
 * @param maxLayers - Max number of layers user can add (max 5)
 * @param layerGroup - The i-th layer SVG group
 */

import * as d3 from "d3";
import { LayerConnections, MidPoint } from "./types";

export const drawNeurons = (
  canvasW: number,
  canvasH: number,
  numNeurons: number,
  maxLayers: number,
  layerGroup: d3.Selection<SVGGElement, unknown, null, undefined>
): LayerConnections => {
  const circleRadius = Math.trunc((0.35 * canvasW) / (maxLayers * 10 + 5));
  console.log(circleRadius)
  const verticalSpacing = circleRadius * 4;
  const totalHeight = (numNeurons - 1) * verticalSpacing;

  const startX = canvasW / (2 * maxLayers); // roughly same X positioning as conv layer
  const startY = canvasH / 2 - totalHeight / 2;

  const leftMidPoints: MidPoint[] = [];
  const rightMidPoints: MidPoint[] = [];
  const result: LayerConnections = [leftMidPoints, rightMidPoints];

  const match = /translate\(([^,]+),\s*([^)]+)\)/.exec(
    layerGroup.attr("transform")
  );
  const actualX = match ? parseFloat(match[1]) : 0;

  for (let i = 0; i < numNeurons; i++) {
    const cy = startY + i * verticalSpacing;
    const cx = startX;

    // Draw neuron (circle)
    layerGroup
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", circleRadius)
      .attr("class", "fill-bg stroke-text")
      .style("opacity", 0)
      .transition()
      .duration(400)
      .delay(i * 100)
      .style("opacity", 1);

    // Left + right midpoints (for connections)
    leftMidPoints.push({
      x: cx - circleRadius + actualX,
      y: cy,
    });
    rightMidPoints.push({
      x: cx + circleRadius + actualX,
      y: cy,
    });
  }

  // // Optional: layer label
  // layerGroup
  //   .append("text")
  //   .attr("x", startX)
  //   .attr("y", startY - verticalSpacing)
  //   .attr("text-anchor", "middle")
  //   .attr("font-size", 12)
  //   .attr("fill", "currentColor")
  //   .text(`Dense (${numNeurons})`)
  //   .style("opacity", 0)
  //   .transition()
  //   .duration(600)
  //   .style("opacity", 1);

  return result;
};
