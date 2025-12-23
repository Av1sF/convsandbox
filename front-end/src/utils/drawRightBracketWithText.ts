interface BracketOptions {
  x: number;
  startY: number;
  endY: number;
  thickness: number;
  text?: string;
  textXOffset?: number;
  verticalText?: boolean;  // New: enable vertical orientation
}

export function drawRightBracketWithText(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined> |  d3.Selection<SVGGElement, unknown, null, undefined>,
  options: BracketOptions
): void {
  const { x, startY, endY, thickness, text, textXOffset = -10, verticalText = false } = options;
  const height = endY - startY;
  const textY = startY + height * 0.5;
  
  // Bracket path (unchanged)
  // `M ${x + thickness} ${startY} L ${x + thickness} ${endY} L ${x} 


  svg.append("path")
    .attr("d", `M ${x-thickness} ${startY} H ${x+thickness} V ${endY} H ${x-thickness}`)
    .attr("fill", "none")
    .attr("stroke", "#333")
    .attr("stroke-width", 1);

  if (text) {
    const textSel = svg.append("text")
      .attr("x", x + textXOffset)
      .attr("y", textY)
      .attr("dominant-baseline", "middle")
      .attr("font-size", 10)
      .attr("fill", "#333")
      .text(text);

    if (verticalText) {
      // Method 1: writing-mode (modern browsers)
      textSel.style("writing-mode", "tb")
             .style("glyph-orientation-vertical", "0")
             .attr("text-anchor", "middle");
      
      // Alternative: rotate 90° (better cross-browser)
      // textSel.attr("transform", `rotate(-90 ${x + textXOffset} ${textY})`);
    }
  }
}
