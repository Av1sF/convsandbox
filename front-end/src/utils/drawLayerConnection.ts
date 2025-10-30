import * as d3 from "d3";
import { LayerActionType } from "./types";
type MidPoint = { x: number; y: number };

function drawLayerConnections(
  svgRoot: d3.Selection<d3.BaseType, unknown, null, undefined>,
  allLayerConnections: [MidPoint[], MidPoint[]][],
  prevLayerType: LayerActionType,
  currLayerType: LayerActionType
) {
  if (allLayerConnections.length < 2) return;

  if (currLayerType == "add-conv-layer") {
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
  } else {
    const [, prevRightPoints] =
      allLayerConnections[allLayerConnections.length - 2];
    const [nextLeftPoints] =
      allLayerConnections[allLayerConnections.length - 1];

    for (let j = 0; j < prevRightPoints.length; j++) {
      svgRoot
        .append("line")
        .attr("class", "layer-connection")
        .attr("x1", prevRightPoints[j].x)
        .attr("y1", prevRightPoints[j].y)
        .attr("x2", nextLeftPoints[j].x)
        .attr("y2", prevRightPoints[j].y)
        .attr("stroke", "#888")
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .duration(300)
        .attr("opacity", 0.15);
    }
  }
}

export default drawLayerConnections;
