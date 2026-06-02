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

export function useDenseAnimation(
  svgRef: RefObject<SVGSVGElement | null>,
  tensorLayers: dummyModelOutputs[],
  layerIndex: number[]
): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let didInit = false;
    if (!didInit) {
      didInit = true;
      const root = d3.select(svgRef.current);
      root.selectAll("*").remove();

      const denseTensor = tensorLayers[layerIndex[0]] as dummyModelDense;
      const inputConv = tensorLayers[layerIndex[1]];

      const inputGroup = root.append("g").attr("class", "padded-input").attr("transform", "translate(100, 0)");

      const inputLines = drawConvLayer(550, 650, MAXLAYERS, inputGroup, inputConv.output.arraySync());

      inputGroup.append("text").attr("x", inputGroup.select(`#rect-0`).attr("x")).attr("y", 500 * 0.05)
        .attr("text-anchor", "left").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333").text("Input Layer");
      inputGroup.append("text")
        .attr("x", +inputGroup.select(`#rect-0`).attr("x") + 0.5 * +inputGroup.select(`#rect-0`).attr("width"))
        .attr("y", 600).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333")
        .text(`${formatDimsFromTensorShape(inputConv.output.shape)}`);

      const outputGroup = root.append("g").attr("class", "output").attr("transform", "translate(700, 0)");
      const outputLines = drawNeurons(550, 650, denseTensor.neurons, 1, outputGroup, denseTensor.output.arraySync());

      const outputLabelX = parseInt(outputGroup.select(`#neuron-0`).attr("cx"));
      outputGroup.append("text").attr("x", outputLabelX).attr("y", 500 * 0.05).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333").text("Fully-Connected Output");
      outputGroup.append("text").attr("x", outputLabelX).attr("y", 500 * 0.05 + 20).attr("text-anchor", "middle").attr("font-size", 12).attr("opacity", 0.8).attr("fill", "#333").text("(before activation is applied)");
      outputGroup.append("text").attr("x", outputLabelX).attr("y", 600).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333")
        .text(`${denseTensor.neurons} ${denseTensor.neurons === 1 ? "neuron" : "neurons"}`);

      if (inputConv.output.shape.length === 2) {
        if (inputLines) {
          drawLayerConnections(root, [inputLines, outputLines]);
          drawLayerConnections(root, [inputLines, outputLines]);
        }
        outputGroup.append("text").attr("x", -400).attr("y", 500 * 0.25).attr("text-anchor", "left")
          .attr("font-size", 14).attr("opacity", 0.7).attr("fill", "#333")
          .text("As it is already a 1D vector, we can directly use the input for our fully connected layer.");
      } else {
        const flattenGroup = root.append("g").attr("class", "flatten").attr("transform", "translate(525, 0)");

        const flattenLines = drawFlattenedVector(75, 650, MAXLAYERS, flattenGroup, denseTensor.flatten.arraySync() as number[][]);

        const flattenLabelX = parseInt(flattenGroup.select(`#rect-0`).attr("x") + +flattenGroup.select(`#rect-0`).attr("width") * 0.5);
        flattenGroup.append("text").attr("x", flattenLabelX).attr("y", 500 * 0.05).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333").text("Flatten");
        flattenGroup.append("text").attr("x", flattenLabelX).attr("y", 600).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333")
          .text(`${formatDimsFromTensorShape(denseTensor.flatten.shape)}`);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgRef.current]);
}
