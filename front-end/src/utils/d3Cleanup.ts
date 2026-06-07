import * as d3 from "d3";

// Transition names used across the animation hooks. d3 can only interrupt one
// named transition at a time, so every name we schedule must be listed here.
const TRANSITION_NAMES = ["reveal"];

/**
 * Cancel every pending/active d3 transition in an SVG subtree and remove its
 * contents. 
 */
export function clearAnimations(node: SVGSVGElement | null) {
  if (!node) return;

  const root = d3.select(node);
  const all = root.selectAll("*");

  // Default (unnamed) transitions
  root.interrupt();
  all.interrupt();

  // Named transitions
  for (const name of TRANSITION_NAMES) {
    root.interrupt(name);
    all.interrupt(name);
  }

  all.remove();
}
