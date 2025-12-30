import * as d3 from "d3";

export function drawClickMe(
  x: number,
  y: number,
  svg:
    | d3.Selection<SVGGElement, unknown, null, undefined>
    | d3.Selection<SVGSVGElement, unknown, null, undefined>
    
) {
  const startX = x;
  const startY = y - 25;

  svg
    .append("defs")
    .append("marker")
    .attr("id", "dot-arrow")
    .attr("viewBox", "-3 -3 6 6") 
    .attr("refX", 0) 
    .attr("refY", 0)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto")
    .append("circle")
    .attr("cx", 0) 
    .attr("cy", 0)
    .attr("r", 1)
    .attr("fill", "#ef4565");

  
  const arrowGroup = svg
    .append("g")
    .attr("transform", `translate(${startX}, ${startY})`);

  arrowGroup
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 25)
    .attr("y2", 25)
    .attr("stroke", "#ef4565")
    .attr("stroke-width", 1)
    .attr("marker-end", "url(#dot-arrow)");

  arrowGroup
    .append("text")
    .attr("x", -10)
    .attr("y", -5)
    .attr("font-size", 8)
    .attr("text-anchor", "middle")
    .attr("fill", "#ef4565")
    .text("Click to animate!");

  setTimeout(() => {
    arrowGroup.transition().duration(500).style("opacity", 0).remove();
  }, 3000);
}
