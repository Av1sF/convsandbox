import { RefObject, useEffect } from "react";
import * as d3 from "d3";
import {
  dummyModelDense,
  dummyModelOutputs,
  LayerConnections,
  MAXLAYERS,
} from "@/utils/types";
import { drawConvLayer } from "@/utils/drawConvLayer";
import { formatDimsFromTensorShape } from "@/utils/formatDimsFromTensorShape";
import { drawNeurons } from "@/utils/drawNeurons";
import drawLayerConnections from "@/utils/drawLayerConnection";
import { drawFlattenedVector } from "@/utils/drawFlattenVector";
import { clearAnimations } from "@/utils/d3Cleanup";

/**
 * Renders a dense (fully-connected) layer animation into the provided SVG ref.
 *
 * When the input is already 1-D the animation shows a direct connection from the
 * input to the output neurons. When the input is 2-D or 3-D it first illustrates
 * the flatten step that collapses the spatial dimensions into a 1-D vector before
 * drawing connections to the output neurons.
 *
 * @param svgRef       - Ref to the modal SVG element where the animation is rendered.
 * @param tensorLayers - Ordered list of all layer tensors from the dummy model.
 * @param layerIndex   - Two-element array: [dense layer index, preceding layer index].
 */
export function useDenseAnimation(
  svgRef: RefObject<SVGSVGElement | null>,
  tensorLayers: dummyModelOutputs[],
  layerIndex: number[]
): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const node = svgRef.current;
    let didInit = false;

    // Ensure it is only intialised once
    if (!didInit) {
      didInit = true;
      const root = d3.select(svgRef.current);
      root.selectAll("*").remove();

      const denseTensor = tensorLayers[layerIndex[0]] as dummyModelDense;
      const inputConv = tensorLayers[layerIndex[1]];
      const inputGroup = root.append("g").attr("class", "padded-input").attr("transform", "translate(100, 0)");

      // Draw input layer 
      const inputLines = drawConvLayer(550, 650, MAXLAYERS, inputGroup, inputConv.output.arraySync());

      // Input layer dimensions text
      inputGroup.append("text").attr("x", inputGroup.select(`#rect-0`).attr("x")).attr("y", 500 * 0.05)
        .attr("text-anchor", "left").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333").text("Input Layer");
      inputGroup.append("text")
        .attr("x", +inputGroup.select(`#rect-0`).attr("x") + 0.5 * +inputGroup.select(`#rect-0`).attr("width"))
        .attr("y", 600).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333")
        .text(`${formatDimsFromTensorShape(inputConv.output.shape)}`);

      // Draw flatten output neuron 
      const outputGroup = root.append("g").attr("class", "output").attr("transform", "translate(700, 0)");
      const outputLines = drawNeurons(550, 650, denseTensor.neurons, 1, outputGroup, denseTensor.output.arraySync());

      // Flatten output text 
      const outputLabelX = parseInt(outputGroup.select(`#neuron-0`).attr("cx"));
      outputGroup.append("text").attr("x", outputLabelX).attr("y", 500 * 0.05).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333").text("Fully-Connected Output");
      outputGroup.append("text").attr("x", outputLabelX).attr("y", 500 * 0.05 + 20).attr("text-anchor", "middle").attr("font-size", 12).attr("opacity", 0.8).attr("fill", "#333").text("(before activation is applied)");
      outputGroup.append("text").attr("x", outputLabelX).attr("y", 600).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333")
        .text(`${denseTensor.neurons} ${denseTensor.neurons === 1 ? "neuron" : "neurons"}`);

      // Animation 
      if (inputConv.output.shape.length === 2) {
        // If input is 1D 
        if (inputLines) {
          drawLayerConnections(root, [inputLines, outputLines]);
          drawLayerConnections(root, [inputLines, outputLines]);
        }
        outputGroup.append("text").attr("x", -400).attr("y", 500 * 0.25).attr("text-anchor", "left")
          .attr("font-size", 14).attr("opacity", 0.7).attr("fill", "#333")
          .text("As it is already a 1D vector, we can directly use the input for our fully connected layer.");
      } else {
        // Else if it is still 2D or 3D 
        const flattenGroup = root.append("g").attr("class", "flatten").attr("transform", "translate(525, 0)");

        const flattenLines = drawFlattenedVector(75, 650, MAXLAYERS, flattenGroup, denseTensor.flatten.arraySync() as number[][]);

        const flattenLabelX = parseInt(flattenGroup.select(`#rect-0`).attr("x") + +flattenGroup.select(`#rect-0`).attr("width") * 0.5);
        flattenGroup.append("text").attr("x", flattenLabelX).attr("y", 500 * 0.05).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333").text("Flatten");
        flattenGroup.append("text").attr("x", flattenLabelX).attr("y", 600).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333")
          .text(`${formatDimsFromTensorShape(denseTensor.flatten.shape)}`);

        // Draw visual lines 
        if (flattenLines && inputLines) {
          const shortFlattenedLines = [[flattenLines[0][0]], [flattenLines[1][0]]] as LayerConnections;
          const shortInputLines = [[inputLines[0][0]], [inputLines[1][0]]] as LayerConnections;
          drawLayerConnections(root, [shortInputLines, shortFlattenedLines]);
          drawLayerConnections(root, [shortInputLines, shortFlattenedLines]);
          drawLayerConnections(root, [shortFlattenedLines, outputLines]);
          drawLayerConnections(root, [shortFlattenedLines, outputLines]);
        }

        outputGroup.append("text").attr("x", -150).attr("y", 500).attr("text-anchor", "middle")
          .attr("font-size", 14).attr("opacity", 0.7).attr("fill", "#333")
          .text("The flatten operation converts and formats the multi-dimensional output from");
        outputGroup.append("text").attr("x", -150).attr("y", 500 + 16).attr("text-anchor", "middle")
          .attr("font-size", 14).attr("opacity", 0.7).attr("fill", "#333")
          .text("pooling into a 1D vector to be used as an input for the fully connected (dense) layers.");
      }
    }
    return () => clearAnimations(node);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgRef.current]);
}
