/**
 * Draws a dense (fully connected) layer into the provided D3 selection.
 * @param canvasW - Width of the canvas in px
 * @param canvasH - Height of the canvas in px
 * @param numNeurons - Number of neurons in this dense layer (max 10)
 * @param maxLayers - Max number of layers user can add (max 5)
 * @param layerGroup - The i-th layer SVG group
 */

import * as d3 from "d3";
import { BaseType } from "d3";
import { LayerConnections, MidPoint } from "./types";
import { is2DTensor } from "./is2DTensor";

const MAX_WEIGHT = 2;
const MIN_WEIGHT = -2;

export const drawNeurons = (
  canvasW: number,
  canvasH: number,
  numNeurons: number,
  maxLayers: number,
  layerGroup:
    | d3.Selection<SVGSVGElement | null, unknown, null, undefined>
    | d3.Selection<SVGGElement, unknown, null, undefined>
    | d3.Selection<BaseType, unknown, null, undefined>,
  tensor?:
    | number
    | number[]
    | number[][]
    | number[][][]
    | number[][][][]
    | number[][][][][]
    | number[][][][][][]
): LayerConnections => {
  const circleRadius = Math.trunc((0.35 * canvasW) / (maxLayers * 10 + 5));
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
  const haschildren = !layerGroup.select("circle").empty();

  for (let i = 0; i < numNeurons; i++) {
    const cy = startY + i * verticalSpacing;
    const cx = startX;
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

    if (!haschildren) {
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

      layerGroup
        .append("circle")
        .attr("id", (d, i) => `neuron-${i}`)
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", circleRadius)
        .attr("fill", "#5f6c7b")
        .style("opacity", 0)
        .transition()
        .duration(400)
        .delay(i * 100)
        .style("opacity", randomOpacity);

      // Left + right midpoints (for connections)
      leftMidPoints.push({
        x: cx - circleRadius + actualX,
        y: cy,
      });
      rightMidPoints.push({
        x: cx + circleRadius + actualX,
        y: cy,
      });
    } else {
      layerGroup.select(`#neuron-${i}`)
        .transition()
        .duration(400)
        .delay(i * 100)
        .style("opacity", randomOpacity);
    }
  }

  return result;
};
