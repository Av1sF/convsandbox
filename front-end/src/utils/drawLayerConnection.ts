import * as d3 from "d3";
import {LayerConnections } from "./types";

/**
 * Draws animated bezier curves connecting the right midpoints of the
 * second-to-last layer group to the left midpoints of the last layer group
 * in `allLayerConnections`. No-ops when fewer than two layers exist.
 */
function drawLayerConnections(
  svgRoot: | d3.Selection<d3.BaseType, unknown, null, undefined> | d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
  allLayerConnections: LayerConnections[],
) {
  if (allLayerConnections.length < 2) return;
    const [, prevRightPoints] =
      allLayerConnections[allLayerConnections.length - 2];
    const [nextLeftPoints] =
      allLayerConnections[allLayerConnections.length - 1];
    
  

    for (let i = 0; i < prevRightPoints.length; i++) {
      for (let j = 0; j < nextLeftPoints.length; j++) {
        const p1 = prevRightPoints[i];
        const p2 = nextLeftPoints[j];

        const path = d3.path();
        const midX = (p1.x + p2.x) / 2;
        path.moveTo(p1.x, p1.y);
        path.bezierCurveTo(midX, p1.y, midX, p2.y, p2.x, p2.y);

        svgRoot
          .append("path")
          .attr("class", "layer-connection")
          .attr("d", path.toString())
          .attr("fill", "none")
          .attr("stroke", "#999")
          .attr("stroke-width", 1)
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 20 + j * 5)
          .attr("opacity", 0.15);
      }
    }
}

export default drawLayerConnections;
