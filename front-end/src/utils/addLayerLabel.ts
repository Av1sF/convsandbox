import * as d3 from "d3";

export function addLayerLabel(
  x: number,
  y: number,
  layerGroup:
    | d3.Selection<SVGGElement, unknown, null, undefined>
    | d3.Selection<d3.BaseType, unknown, null, undefined>,
  text: string,
  font_size?: number
) {
  layerGroup
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("id", (d, i) => `${text.replaceAll(' ', '-')}`)
    .attr("text-anchor", "middle")
    .attr("font-size", font_size || 14)
    .attr("opacity", 0.8)
    .attr("fill", "#333")
    .text(text);
}
