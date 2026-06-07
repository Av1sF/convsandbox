import * as d3 from "d3";

/**
 * Appends a centred text label to a D3 layer group.
 * The element id is derived from the label text (spaces → dashes) so callers
 * can later select it by id to reposition or remove it.
 */
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
    .attr("id",   `${text.replaceAll(' ', '-')}`)
    .attr("text-anchor", "middle")
    .attr("font-size", font_size || 14)
    .attr("opacity", 0.8)
    .attr("fill", "#333")
    .text(text);
}
