/**
 * Draws bias values as circles into the provided D3 layer group.
 * If circles already exist in the group (i.e. an activation is being overlaid)
 * only the opacity of existing circles is updated — no new elements are created.
 * @param canvasW    - Canvas width in px
 * @param canvasH    - Canvas height in px
 * @param numNeurons - Number of bias neurons (one per filter)
 * @param maxLayers  - Max structural layers; used to scale circle size
 * @param layerGroup - The target SVG group
 * @param tensor     - Bias tensor values used to set per-neuron opacity
 */

import * as d3 from "d3";
import { BaseType } from "d3";
import { LayerConnections, MidPoint } from "./types";
import { is2DTensor } from "./is2DTensor";

const MAX_WEIGHT = 100;
const MIN_WEIGHT = -100;

export const drawBiases = (
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
  const circleRadius = Math.trunc((0.5 * canvasW) / (maxLayers * 10 + 5));
  const verticalSpacing = circleRadius * 7;
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
        .attr("id",   `neuron-${i}`)
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
