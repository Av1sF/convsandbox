import { RefObject, useEffect } from "react";
import * as d3 from "d3";
import {
  ActivationType,
  dummyModelActivation,
  dummyModelConv,
  dummyModelOutputs,
  MAXLAYERS,
  MidPoint,
} from "@/utils/types";
import { drawConvLayer } from "@/utils/drawConvLayer";
import { drawKernels } from "@/utils/drawKernels";
import { drawBiases } from "@/utils/drawBiases";
import { drawRightBracketWithText } from "@/utils/drawRightBracketWithText";
import { drawKernelsNotations } from "@/utils/drawKernelsNotation";
import { is3DTensor } from "@/utils/is3DTensor";
import { isNumberParam } from "@/utils/typeGuards";
import { drawConvNotation } from "@/utils/drawConvNotation";
import { formatDimsFromTensorShape } from "@/utils/formatDimsFromTensorShape";
import { clearAnimations } from "@/utils/d3Cleanup";

/**
 * Renders and animates a step-by-step convolution operation into the provided SVG ref.
 *
 * Draws five visual groups (padded input, filters/kernels, biases, pre-activation
 * output, activation output) and then plays a sliding-window animation over every
 * output position, one filter at a time, showing how the dot-product and bias-add
 * produce each output value.
 *
 * @param svgRef       - Ref to the modal SVG element where the animation is rendered.
 * @param tensorLayers - Ordered list of all layer tensors from the dummy model.
 * @param layerIndex   - Two-element array: [activation layer index, conv layer index].
 */
export function useConvAnimation(
  svgRef: RefObject<SVGSVGElement | null>,
  tensorLayers: dummyModelOutputs[],
  layerIndex: number[]
): void {
  const inputConv = tensorLayers[layerIndex[1]] as dummyModelConv;
  const inputConvShape = inputConv.padded.shape as [number, number, number, number];
  const outputConvShape = inputConv.output.shape as [number, number, number, number];
  const convColourScheme = d3.schemeObservable10.slice(0, 5);
  const outputColourScheme = d3.schemeObservable10.slice(5, 11);
  const activationFormulaLatex: Record<ActivationType, string> = {
    Sigmoid: `\\(\\alpha(x) = \\frac{1}{1 + e^{-x}}\\)`,
    Tanh: `\\(\\alpha(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}}\\)`,
    ReLU: `\\(\\alpha(x) = max(0, x)\\)`,
    "Leaky ReLU": `\\(\\alpha(x) = max(0.01x, x)\\)`,
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const node = svgRef.current;
    let didInit = false;

    // Ensure only initalise animation once 
    if (!didInit) {
      didInit = true;
      const root = d3.select(svgRef.current);
      root.selectAll("*").remove();

      // DRAW PADDED INPUT LAYER (Left most)
      const paddedGroup = root
        .append("g")
        .attr("class", "padded-input")
        .attr("transform", "translate(50, 0)");

      const paddedLines = drawConvLayer(
        550, 650, MAXLAYERS, paddedGroup,
        (tensorLayers[layerIndex[1]] as dummyModelConv).padded.arraySync()
      );

      paddedGroup.append("text")
        .attr("x", paddedGroup.select(`#rect-0`).attr("x"))
        .attr("y", 500 * 0.05)
        .attr("text-anchor", "left").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333")
        .text("Input Layer");

      // Dimensions of input layer 
      paddedGroup.append("text")
        .attr("x", paddedGroup.select(`#rect-0`).attr("x") + 0.5 * +paddedGroup.select(`#rect-0`).attr("width"))
        .attr("y", 600)
        .attr("text-anchor", "left").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333")
        .text(`${formatDimsFromTensorShape(inputConvShape)}`);

      paddedGroup.append("text")
        .attr("x", paddedGroup.select(`#rect-0`).attr("x"))
        .attr("y", 500 * 0.09)
        .attr("text-anchor", "left").attr("font-size", 10).attr("opacity", 0.8).attr("fill", "#333")
        .text(`Padding Size of ${inputConv.padSize}`);

      paddedGroup.append("foreignObject")
        .attr("x", parseInt(paddedGroup.select(`#rect-0`).attr("x")) + parseInt(paddedGroup.select(`#rect-0`).attr("width")) * 0.5 - 7)
        .attr("y", parseInt(paddedGroup.select(`#rect-0`).attr("y")) - 25)
        .attr("width", 20).attr("height", 20).attr("font-size", 14)
        .append("xhtml:div").style("position", "fixed").style("color", "#333").style("opacity", "1")
        .html("<span>\\(X\\)</span>");

      // Add math notation for each layer
      for (let i = 0; i < (inputConv.padded.shape[3] as number); i++) {
        paddedGroup.append("foreignObject")
          .attr("x", parseInt(paddedGroup.select(`#rect-${i}`).attr("x")) - 20)
          .attr("y", parseInt(paddedGroup.select(`#rect-${i}`).attr("y")) + 0.5 * parseInt(paddedGroup.select(`#rect-${i}`).attr("height")) - 5)
          .attr("width", 20).attr("height", 20).attr("font-size", 10)
          .append("xhtml:div").style("position", "fixed").style("color", "#333").style("opacity", "0.6")
          .html(`<span>\\(X_{${i + 1}}\\)</span>`);
      }

      // Draw ' ]  Channel ' pointer 
      const bracketX =
        parseInt(paddedGroup.select(`#rect-${(inputConv.padded.shape[3] as number) - 1}`).attr("x")) +
        6 +
        parseInt(paddedGroup.select(`#rect-${(inputConv.padded.shape[3] as number) - 1}`).attr("width"));

      drawRightBracketWithText(paddedGroup, {
        x: bracketX,
        startY: parseInt(paddedGroup.select(`#rect-${(inputConv.padded.shape[3] as number) - 1}`).attr("y")),
        endY: parseInt(paddedGroup.select(`#rect-${(inputConv.padded.shape[3] as number) - 1}`).attr("y")) +
          parseInt(paddedGroup.select(`#rect-${(inputConv.padded.shape[3] as number) - 1}`).attr("height")),
        thickness: 1, text: "Channel", textXOffset: 10, verticalText: true,
      });

      // DRAW FILTER / CHANNELS 
      const kernelGroup = root.append("g").attr("class", "kernel").attr("transform", "translate(20, 0)");

      const kernelLines = drawKernels(
        750, 650, MAXLAYERS, kernelGroup,
        (tensorLayers[layerIndex[1]] as dummyModelConv).kernel.arraySync() as number[][][][]
      );

      const kernelLabelX =
        parseInt(root.select(`#k-${0}-${0}`).attr("width")) * 0.5 +
        (parseInt(root.select(`#k-${0}-${0}`).attr("x")) +
          parseInt(root.select(`#k-${inputConv.dims.depth - 1}-${0}`).attr("x"))) / 2;

      // Draw kernel titles 
      kernelGroup.append("text").attr("x", kernelLabelX).attr("y", 500 * 0.05).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333").text("Filters");
      kernelGroup.append("text").attr("x", kernelLabelX).attr("y", 600).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333")
        .text(`${formatDimsFromTensorShape((tensorLayers[layerIndex[1]] as dummyModelConv).kernel.shape as number[])}`);
      kernelGroup.append("text").attr("x", kernelLabelX).attr("y", 500 * 0.05 + 20).attr("text-anchor", "middle").attr("font-size", 10).attr("opacity", 0.8).attr("fill", "#333").text(`${inputConv.filterSize}x ${inputConv.filterSize} kernel size`);
      kernelGroup.append("text").attr("x", kernelLabelX).attr("y", 500 * 0.05 + 31).attr("text-anchor", "middle").attr("font-size", 10).attr("opacity", 0.8).attr("fill", "#333").text(`stride of ${inputConv.stride}`);
      kernelGroup.append("text").attr("x", kernelLabelX).attr("y", 500 * 0.05 + 42).attr("text-anchor", "middle").attr("font-size", 10).attr("opacity", 0.8).attr("fill", "#333").text(`${inputConv.dims.depth} filter/s`);

      kernelGroup.append("foreignObject")
        .attr("x", kernelLabelX).attr("y", parseInt(root.select(`#k-${0}-${0}`).attr("y")) - 50)
        .attr("width", 20).attr("height", 20).attr("font-size", 14)
        .append("xhtml:div").style("position", "fixed").style("color", "#333").style("opacity", "1").style("font-weight", "bold")
        .html(`<span>\\(\\Omega\\)</span>`);

      // Draw math notation vertically for each filter 
      for (let i = 0; i < inputConv.dims.depth; i++) {
        kernelGroup.append("foreignObject")
          .attr("x", parseInt(root.select(`#k-${i}-${0}`).attr("x")) + 0.5 * parseInt(root.select(`#k-${i}-${0}`).attr("width")) - 5)
          .attr("y", parseInt(root.select(`#k-${0}-${0}`).attr("y")) - 20)
          .attr("width", 20).attr("height", 20).attr("font-size", 10)
          .append("xhtml:div").style("position", "fixed").style("color", "#333").style("opacity", "0.6")
          .html(`<span>\\(F_{${i + 1}}\\)</span>`);
      }

      // Draw ' ] Kernel ' pointer 
      const kernelBracketX =
        parseInt(root.select(`#k-${inputConv.dims.depth - 1}-${(inputConv.padded.shape[3] as number) - 1}`).attr("x")) +
        6 +
        parseInt(root.select(`#k-${inputConv.dims.depth - 1}-${(inputConv.padded.shape[3] as number) - 1}`).attr("width"));

      drawRightBracketWithText(kernelGroup, {
        x: kernelBracketX,
        startY: parseInt(root.select(`#k-${inputConv.dims.depth - 1}-${(inputConv.padded.shape[3] as number) - 1}`).attr("y")),
        endY: parseInt(root.select(`#k-${inputConv.dims.depth - 1}-${(inputConv.padded.shape[3] as number) - 1}`).attr("y")) +
          parseInt(root.select(`#k-${inputConv.dims.depth - 1}-${(inputConv.padded.shape[3] as number) - 1}`).attr("height")),
        thickness: 1, text: "Kernel", textXOffset: 10, verticalText: true,
      });

      // DRAW BIASES
      const biasGroup = root.append("g").attr("class", "biases").attr("transform", "translate(550, 0)");
      const biasArray = (tensorLayers[layerIndex[1]] as dummyModelConv).bias.arraySync() as number[];

      const biasLines = drawBiases(1200, 650, biasArray.length, MAXLAYERS, biasGroup,
        (tensorLayers[layerIndex[1]] as dummyModelConv).bias.arraySync()
      );

      const biasLabelx = parseInt(root.select(`#neuron-0`).attr("cx"));

      // Numbers of biases text 
      biasGroup.append("text").attr("x", biasLabelx).attr("y", 500 * 0.05).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333").text("Bias");
      biasGroup.append("text").attr("x", biasLabelx).attr("y", 600).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333")
        .text(`${biasArray.length} ${biasArray.length > 1 ? "biases" : "bias"}`);

      // Bias math notation 
      biasGroup.append("foreignObject")
        .attr("x", biasLabelx - 7).attr("y", parseInt(root.select(`#neuron-0`).attr("cy")) - 45)
        .attr("width", 20).attr("height", 20).attr("font-size", 14)
        .append("xhtml:div").style("position", "fixed").style("color", "#333").style("opacity", "1")
        .html(`<span>\\(B\\)</span>`);

      for (let i = 0; i < biasArray.length; i++) {
        biasGroup.append("foreignObject")
          .attr("x", parseInt(root.select(`#neuron-${i}`).attr("cx")) + 1.8 * parseInt(root.select(`#neuron-${i}`).attr("r")) - 5)
          .attr("y", parseInt(root.select(`#neuron-${i}`).attr("cy")) + 1.3 * parseInt(root.select(`#neuron-${i}`).attr("r")))
          .attr("width", 20).attr("height", 20).attr("font-size", 10)
          .append("xhtml:div").style("position", "fixed").style("color", "#333").style("opacity", "0.6")
          .html(`<span>\\(\\beta_{${i + 1}}\\)</span>`);
      }

      // DRAW OUTPUT
      const outputGroup = root.append("g").attr("class", "output").attr("transform", "translate(700, 0)");
      const outputLines = drawConvLayer(550, 650, MAXLAYERS, outputGroup, tensorLayers[layerIndex[1]].output.arraySync());
      const outputLabelX = parseInt(outputGroup.select(`#rect-0`).attr("x")) + parseInt(outputGroup.select(`#rect-0`).attr("width")) * 0.5;

      // Output heading and equation 
      outputGroup.append("text").attr("x", outputLabelX).attr("y", 500 * 0.05).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333").text("Pre-Activation");
      outputGroup.append("foreignObject")
        .attr("x", outputLabelX - 27).attr("y", parseInt(outputGroup.select(`#rect-0`).attr("y")) - 20)
        .attr("width", 55).attr("height", 20).attr("font-size", 10)
        .append("xhtml:div").style("position", "fixed").style("color", "#333").style("opacity", "1")
        .html(`<span>\\(\\Omega \\cdot X + B\\)</span>`);

      // DRAW ACTIVATION OUTPUT
      const activationGroup = root.append("g").attr("class", "activation-output").attr("transform", "translate(820, 0)");

      // Draw output layers 
      const activationLines = drawConvLayer(550, 650, MAXLAYERS, activationGroup,
        (tensorLayers[layerIndex[0]] as dummyModelActivation).output.arraySync()
      );

      // Math notation for output layers 
      for (let i = 0; i < inputConv.dims.depth; i++) {
        activationGroup.append("foreignObject")
          .attr("x", parseInt(activationGroup.select(`#rect-${i}`).attr("x")) + parseInt(activationGroup.select(`#rect-${i}`).attr("width")) + 10)
          .attr("y", parseInt(activationGroup.select(`#rect-${i}`).attr("y")) + 0.5 * parseInt(activationGroup.select(`#rect-${i}`).attr("height")) - 5)
          .attr("width", 20).attr("height", 20).attr("font-size", 10)
          .append("xhtml:div").style("position", "fixed").style("color", "#333").style("opacity", "0.6")
          .html(`<span>\\(H_{${i + 1}}\\)</span>`);
      }

      const actiLabelX = parseInt(activationGroup.select(`#rect-0`).attr("x")) + parseInt(outputGroup.select(`#rect-0`).attr("width")) * 0.5;
      
      activationGroup.append("foreignObject")
        .attr("x", actiLabelX - 7).attr("y", parseInt(activationGroup.select(`#rect-0`).attr("y")) - 45)
        .attr("width", 20).attr("height", 20).attr("font-size", 14)
        .append("xhtml:div").style("position", "fixed").style("color", "#333").style("opacity", "1")
        .html(`<span>\\(H\\)</span>`);

      // Text for output dimensions and activation type 
      activationGroup.append("text").attr("x", actiLabelX).attr("y", 500 * 0.05).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333").text("Activation");
      activationGroup.append("text").attr("x", actiLabelX).attr("y", 600).attr("text-anchor", "middle").attr("font-size", 14).attr("opacity", 0.8).attr("fill", "#333")
        .text(`${formatDimsFromTensorShape(outputConvShape)}`);
      activationGroup.append("text").attr("x", actiLabelX).attr("y", 500 * 0.05 + 20).attr("text-anchor", "middle").attr("font-size", 10).attr("opacity", 0.8).attr("fill", "#333")
        .text(`${(tensorLayers[layerIndex[0]] as dummyModelActivation).type}`);

      // Equations 
      activationGroup.append("foreignObject")
        .attr("x", actiLabelX - 35).attr("y", parseInt(activationGroup.select(`#rect-0`).attr("y")) - 20)
        .attr("width", 70).attr("height", 20).attr("font-size", 10)
        .append("xhtml:div").style("position", "fixed").style("color", "#333").style("opacity", "1")
        .html(`<span>\\(\\alpha(\\Omega \\cdot X + B\\))</span>`);

      // CONVOLUTION FORMULA EQUATION 
      const formulaGroup = root.append("g").attr("class", "formula").attr("transform", "translate(1000, 10)");

      const formulaText = [
        "Let \\(H_1\\) contain \\(H_{ij1}\\) outputs (All values of output channel \\(H_1\\))",
        `Let \\(K\\) be a kernel in Filter \\(F_{1}\\) and \\(K \\in \\mathbb{R}^{p \\times p}\\) `,
        `Let \\(D\\) denote the number of kernels in filter \\(F_{1}\\)`,
        `Let \\(\\alpha\\) denote the ${(tensorLayers[layerIndex[0]] as dummyModelActivation).type} activation function.</br>`,
        `\\(D = ${inputConv.padded.shape[3] as number}\\)`,
        `\\(p = ${inputConv.filterSize}\\)`,
        activationFormulaLatex[(tensorLayers[layerIndex[0]] as dummyModelActivation).type],
        "</br>",
        "The convolution operation looks similar to the generalised deep neural network...",
        `\\( H = \\alpha(\\Omega \\cdot X + B) \\) </br>`,
        "A single output in \\(H_1\\) can be calculated via...",
      ];

      if (inputConv.stride === 1) {
        formulaText.push(
          `\\( H_{ij1} =  \\alpha \\Bigl[\\sum\\limits_{l=1}^{D} \\sum\\limits_{m=1}^{p} \\sum\\limits_{n=1}^{p} (w_{mnl} \\times x_{i+m+p+1, j+n-p+1, l}) + \\beta_{${1}} \\Bigr] \\)`
        );
      }

      if (inputConv.filterSize > 3) {
        formulaText.push("(If your filter size is less than 4x4 you can see the values of the weights and input, currently they are hidden due to size)");
      } else {
        formulaText.push("(Please note that final calculation results are rounded to 1dp and computing truncation is used)");
      }

      const formulaParagraph = formulaText.map((s) => `<span>${s}</span>`).join("<br/>");

      formulaGroup.append("g").attr("class", "equations")
        .append("foreignObject").attr("width", 700).attr("height", 500).attr("font-size", 14)
        .append("xhtml:div").style("position", "fixed").style("color", "#333")
        .html(formulaParagraph);

      formulaGroup.append("g").attr("class", "visual").attr("id", "formula-visual")
        .attr("transform", "translate(0, 370)").attr("width", 700).attr("height", 280);

      const numFilters = inputConv.dims.depth;
      const posPerFilter = outputConvShape[1] * outputConvShape[2];
      const biasVals = (tensorLayers[layerIndex[1]] as dummyModelConv).bias.arraySync() as number[];
      const filterTensor = (tensorLayers[layerIndex[1]] as dummyModelConv).kernel.arraySync() as number[][][][];
      const preActOut = tensorLayers[layerIndex[1]].output.arraySync() as number[][][][];
      const actOut = tensorLayers[layerIndex[0]].output.arraySync() as number[][][][];
      const paddedArr = inputConv.padded.arraySync();
      const formulaVisual = formulaGroup.select("#formula-visual");

      let batchWindowDelay = 0;

      // Animate the convolution once per output channel — one filter / bias per pass.
      for (let f = 0; f < numFilters; f++) {
        const filterStartDelay = batchWindowDelay;
        const isLastFilter = f === numFilters - 1;
        const filterColour = outputColourScheme[f];

        // Highlight the bias neuron used for this filter
        const bias = biasGroup.select(`#neuron-${f}`);
        const biasx = +bias.attr("cx");
        const biasy = +bias.attr("cy");
        const biasr = +bias.attr("r");

        const colourBias = biasGroup.append("circle")
          .attr("cx", biasx).attr("cy", biasy).attr("r", biasr)
          .attr("fill", filterColour).style("opacity", 0);
        colourBias
          .transition().duration(0).delay(1000 + filterStartDelay * 2000).style("opacity", 0.7)
          .transition().duration(0).delay(posPerFilter * 2000).style("opacity", 0).remove();

        // Each filter draws its notation into its own subgroup so element ids never collide
        const filterNotationGroup = formulaVisual
          .append("g")
          .attr("id", `filter-notation-${f}`)
          .style("opacity", 0);
        const reveal = filterNotationGroup
          .transition("reveal")
          .duration(0)
          .delay(1000 + filterStartDelay * 2000)
          .style("opacity", 1);
        if (!isLastFilter) {
          reveal
            .transition()
            .duration(0)
            .delay(posPerFilter * 2000)
            .style("opacity", 0)
            .remove();
        }

        // Connecting lines: padded input -> kernel(f) -> bias(f)
        if (paddedLines && kernelLines) {
          for (let i = 0; i < (paddedLines[1] as MidPoint[]).length; i++) {
            const p1 = paddedLines[1][i];
            const p2 = kernelLines[f][0][i];
            const p3 = kernelLines[f][1][i];
            const p4 = biasLines![0][f];

            const pathIn = d3.path();
            const midXin = (p1.x + p2.x) / 2;
            pathIn.moveTo(p1.x, p1.y);
            pathIn.bezierCurveTo(midXin, p1.y, midXin, p2.y, p2.x, p2.y);
            root.append("path").attr("class", "padded-kernel-connection").attr("d", pathIn.toString())
              .attr("fill", "none").attr("stroke", filterColour).attr("stroke-width", 2).attr("opacity", 0)
              .transition().delay(1000 + filterStartDelay * 2000).attr("opacity", 0.5)
              .transition().delay(posPerFilter * 2000).attr("opacity", 0).remove();

            const pathOut = d3.path();
            const midXOut = (p3.x + p4.x) / 2;
            pathOut.moveTo(p3.x, p3.y);
            pathOut.bezierCurveTo(midXOut, p3.y, midXOut, p4.y, p4.x, p4.y);
            root.append("path").attr("class", "kernel-output-connection").attr("d", pathOut.toString())
              .attr("fill", "none").attr("stroke", filterColour).attr("stroke-width", 2).attr("opacity", 0)
              .transition().delay(1000 + filterStartDelay * 2000).attr("opacity", 0.5)
              .transition().delay(posPerFilter * 2000).attr("opacity", 0).remove();
          }
        }

        // Connecting lines: bias(f) -> pre-activation(f) -> activation(f)
        if (biasLines && outputLines && activationLines) {
          const p1 = biasLines[1][f];
          const p2 = outputLines[0][f];
          const p3 = outputLines[1][f];
          const p4 = activationLines[0][f];

          const pathIn = d3.path();
          const midXin = (p1.x + p2.x) / 2;
          pathIn.moveTo(p1.x, p1.y);
          pathIn.bezierCurveTo(midXin, p1.y, midXin, p2.y, p2.x, p2.y);
          root.append("path").attr("class", "padded-kernel-connection").attr("d", pathIn.toString())
            .attr("fill", "none").attr("stroke", filterColour).attr("stroke-width", 2).attr("opacity", 0)
            .transition().delay(1000 + filterStartDelay * 2000).attr("opacity", 0.5)
            .transition().delay(posPerFilter * 2000).attr("opacity", 0).remove();

          const pathOut = d3.path();
          const midXOut = (p3.x + p4.x) / 2;
          pathOut.moveTo(p3.x, p3.y);
          pathOut.bezierCurveTo(midXOut, p3.y, midXOut, p4.y, p4.x, p4.y);
          root.append("path").attr("class", "kernel-output-connection").attr("d", pathOut.toString())
            .attr("fill", "none").attr("stroke", filterColour).attr("stroke-width", 2).attr("opacity", 0)
            .transition().delay(1000 + filterStartDelay * 2000).attr("opacity", 0.5)
            .transition().delay(posPerFilter * 2000).attr("opacity", 0).remove();
        }

        const currFilterValues: number[][][][] = [];
        for (let row = 0; row < inputConv.filterSize; row++) {
          currFilterValues[row] = [];
          for (let col = 0; col < inputConv.filterSize; col++) {
            currFilterValues[row][col] = [];
            for (let k = 0; k < (inputConv.padded.shape[3] as number); k++) {
              currFilterValues[row][col][k] = [];
              currFilterValues[row][col][k][0] = filterTensor[row][col][k][f];
            }
          }
        }

        drawKernelsNotations(
          700, 280, 10, 20, 120,
          filterNotationGroup,
          currFilterValues,
          filterColour,
          biasVals[f],
          f
        );

        let currOutputi = 0;
        let currOutputj = 0;
      
      // Draw sliding window 
      for (let i = 0; i < inputConvShape[1]; i += inputConv.stride) {
        currOutputj = 0;
        for (let j = 0; j < inputConvShape[2]; j += inputConv.stride) {
          if (i + inputConv.filterSize - 1 < inputConvShape[1] && j + inputConv.filterSize - 1 < inputConvShape[2]) {
            for (let k = 0; k < inputConvShape[3]; k++) {
              const id = `#square-${i}-${j}-${k}`;
              const outputid = `#square-${currOutputi}-${currOutputj}-${f}`;
              const kernelid = `#k-${f}-${k}`;

              const kernel = kernelGroup.select(kernelid);
              const rect = paddedGroup.select(id);
              const outputRect = outputGroup.select(outputid);
              const actiRect = activationGroup.select(outputid);

              if (rect.empty() && kernel.empty()) return;

              const cellx = +rect.attr("x"); const celly = +rect.attr("y");
              const cellw = +rect.attr("width"); const cellh = +rect.attr("height");
              const outputCellx = +outputRect.attr("x"); const outputCelly = +outputRect.attr("y");
              const outputCellw = +outputRect.attr("width"); const outputCellh = +outputRect.attr("height");
              const kernelx = +kernel.attr("x"); const kernely = +kernel.attr("y");
              const kernelw = +kernel.attr("width"); const kernelh = +kernel.attr("height");
              const actiCellx = +actiRect.attr("x"); const actiCelly = +actiRect.attr("y");
              const actiCellw = +actiRect.attr("width"); const actiCellh = +actiRect.attr("height");
              const schemeColor = convColourScheme[k] as string;

              kernelGroup.append("rect").attr("x", kernelx).attr("y", kernely).attr("width", kernelw).attr("height", kernelh)
                .attr("fill", schemeColor).style("opacity", 0)
                .transition().duration(0).delay(1000 + batchWindowDelay * 2000).style("opacity", 0.4)
                .transition().delay(1000).remove();

              outputGroup.append("rect").attr("x", outputCellx).attr("y", outputCelly).attr("width", outputCellw).attr("height", outputCellh)
                .attr("fill", filterColour).style("opacity", 0)
                .transition().duration(0).delay(1000 + batchWindowDelay * 2000).style("opacity", 0.4)
                .transition().delay(1000).remove();

              activationGroup.append("rect").attr("x", actiCellx).attr("y", actiCelly).attr("width", actiCellw).attr("height", actiCellh)
                .attr("fill", filterColour).style("opacity", 0)
                .transition().duration(0).delay(1000 + batchWindowDelay * 2000).style("opacity", 0.4)
                .transition().delay(1000).remove();

              paddedGroup.append("rect").attr("x", cellx).attr("y", celly)
                .attr("width", cellw * inputConv.filterSize).attr("height", cellh * inputConv.filterSize)
                .attr("fill", schemeColor).style("opacity", 0)
                .transition().duration(0).delay(1000 + batchWindowDelay * 2000).style("opacity", 0.7)
                .transition().delay(1000).remove();

              const filteredInput: number[][] = [];
              for (let dy = 0; dy < inputConv.filterSize; dy++) {
                filteredInput[dy] = [];
                for (let dx = 0; dx < inputConv.filterSize; dx++) {
                  const filterInputX = dx + j;
                  const filterInputY = dy + i;
                  const tensor = paddedArr;
                  if (is3DTensor(tensor)) {
                    if (isNumberParam(tensor[0][filterInputY][filterInputX][k])) {
                      filteredInput[dy][dx] = tensor[0][filterInputY][filterInputX][k];
                    }
                  }
                }
              }

              const equationVisualiserGroup = filterNotationGroup;
              const isLast = currOutputi === outputConvShape[1] - 1 && currOutputj === outputConvShape[2] - 1;

              drawConvNotation(
                schemeColor, 700, 280, 10, 20 + 123.2 * k, 10,
                i, j, k, equationVisualiserGroup,
                1000 + batchWindowDelay * 2000,
                filteredInput,
                isLast ? true : undefined
              );
            }

            if (!(currOutputi === outputConvShape[1] - 1 && currOutputj === outputConvShape[2] - 1)) {
              const lastKernel = filterNotationGroup.select(`#diagramatic-right-bracket`);
              const lastKernelx = +lastKernel.attr("x");
              const lastKernely = +lastKernel.attr("y");

              let randomOpacity = preActOut[0][currOutputi][currOutputj][f];
              randomOpacity += Math.abs(-100);
              randomOpacity /= Math.abs(-100) + 100;
              randomOpacity = Math.max(0, Math.min(1, randomOpacity));

              filterNotationGroup.append("rect")
                .attr("x", lastKernelx + 157).attr("y", lastKernely - 50).attr("width", 60).attr("height", 60)
                .attr("fill", "#5f6c7b").attr("stroke", "#094067").attr("stroke-opacity", 0).attr("stroke-width", 1).style("fill-opacity", 0)
                .transition().duration(0).delay(1000 + batchWindowDelay * 2000).style("fill-opacity", randomOpacity).attr("stroke-opacity", 1)
                .transition().delay(1000).remove();

              filterNotationGroup.append("text")
                .attr("x", lastKernelx + 157 + 4).attr("y", lastKernely - 15).attr("width", 60).attr("height", 60).attr("font-size", 20)
                .text(`${preActOut[0][currOutputi][currOutputj][f].toFixed(1)}`)
                .attr("opacity", 0).transition().duration(0).delay(1000 + batchWindowDelay * 2000).attr("opacity", 1)
                .transition().delay(1000).remove();

              let outputRandomOpacity = actOut[0][currOutputi][currOutputj][f];
              outputRandomOpacity += Math.abs(-100);
              outputRandomOpacity /= Math.abs(-100) + 100;
              outputRandomOpacity = Math.max(0, Math.min(1, outputRandomOpacity));

              filterNotationGroup.append("rect")
                .attr("x", lastKernelx + 330).attr("y", lastKernely - 50).attr("width", 60).attr("height", 60)
                .attr("fill", "#5f6c7b").attr("stroke", "#094067").attr("stroke-opacity", 0).attr("stroke-width", 1).style("fill-opacity", 0)
                .transition().duration(0).delay(1000 + batchWindowDelay * 2000).style("fill-opacity", outputRandomOpacity).attr("stroke-opacity", 1)
                .transition().delay(1000).remove();

              filterNotationGroup.append("text")
                .attr("x", lastKernelx + 330 + 10).attr("y", lastKernely - 15).attr("width", 60).attr("height", 60).attr("font-size", 20)
                .text(`${actOut[0][currOutputi][currOutputj][f].toFixed(1)}`)
                .attr("opacity", 0).transition().duration(0).delay(1000 + batchWindowDelay * 2000).attr("opacity", 1)
                .transition().delay(1000).remove();

              filterNotationGroup.append("text").attr("id", "text-output-index")
                .attr("x", lastKernelx + 330 + 13).attr("y", lastKernely + 3).attr("width", 60).attr("height", 60).attr("text-anchor", "left")
                .append("tspan").attr("font-size", 14).text("h")
                .attr("opacity", 0).transition().duration(0).delay(1000 + batchWindowDelay * 2000).attr("opacity", 1)
                .transition().delay(1000).remove();

              filterNotationGroup.append("text").attr("id", "text-output-index")
                .attr("x", lastKernelx + 330 + 24).attr("y", lastKernely + 5).attr("width", 60).attr("height", 60).attr("text-anchor", "left")
                .append("tspan").attr("font-size", 10).text(`${currOutputi + 1},${currOutputj + 1},${f + 1}`)
                .attr("opacity", 0).transition().duration(0).delay(1000 + batchWindowDelay * 2000).attr("opacity", 1)
                .transition().delay(1000).remove();
            } else {
              const lastKernel = filterNotationGroup.select(`#diagramatic-right-bracket`);
              const lastKernelx = +lastKernel.attr("x");
              const lastKernely = +lastKernel.attr("y");

              let randomOpacity = preActOut[0][currOutputi][currOutputj][f];
              randomOpacity += Math.abs(-100);
              randomOpacity /= Math.abs(-100) + 100;
              randomOpacity = Math.max(0, Math.min(1, randomOpacity));

              filterNotationGroup.append("rect")
                .attr("x", lastKernelx + 157).attr("y", lastKernely - 50).attr("width", 60).attr("height", 60)
                .attr("fill", "#5f6c7b").attr("stroke", "#094067").attr("stroke-opacity", 0).attr("stroke-width", 1).style("fill-opacity", 0)
                .transition().duration(0).delay(1000 + batchWindowDelay * 2000).style("fill-opacity", randomOpacity).attr("stroke-opacity", 1);

              filterNotationGroup.append("text")
                .attr("x", lastKernelx + 157 + 4).attr("y", lastKernely - 15).attr("width", 60).attr("height", 60).attr("font-size", 20)
                .text(`${preActOut[0][currOutputi][currOutputj][f].toFixed(1)}`)
                .attr("opacity", 0).transition().duration(0).delay(1000 + batchWindowDelay * 2000).attr("opacity", 1);

              let outputRandomOpacity = actOut[0][currOutputi][currOutputj][f];
              outputRandomOpacity += Math.abs(-100);
              outputRandomOpacity /= Math.abs(-100) + 100;
              outputRandomOpacity = Math.max(0, Math.min(1, outputRandomOpacity));

              filterNotationGroup.append("rect")
                .attr("x", lastKernelx + 330).attr("y", lastKernely - 50).attr("width", 60).attr("height", 60)
                .attr("fill", "#5f6c7b").attr("stroke", "#094067").attr("stroke-opacity", 0).attr("stroke-width", 1).style("fill-opacity", 0)
                .transition().duration(0).delay(1000 + batchWindowDelay * 2000).style("fill-opacity", outputRandomOpacity).attr("stroke-opacity", 1);

              filterNotationGroup.append("text")
                .attr("x", lastKernelx + 330 + 10).attr("y", lastKernely - 15).attr("width", 60).attr("height", 60).attr("font-size", 20)
                .text(`${actOut[0][currOutputi][currOutputj][f].toFixed(1)}`)
                .attr("opacity", 0).transition().duration(0).delay(1000 + batchWindowDelay * 2000).attr("opacity", 1);

              filterNotationGroup.append("text").attr("id", "text-output-index")
                .attr("x", lastKernelx + 330 + 13).attr("y", lastKernely + 3).attr("width", 60).attr("height", 60).attr("text-anchor", "left")
                .append("tspan").attr("font-size", 14).text("h")
                .attr("opacity", 0).transition().duration(0).delay(1000 + batchWindowDelay * 2000).attr("opacity", 1);

              filterNotationGroup.append("text").attr("id", "text-output-index")
                .attr("x", lastKernelx + 330 + 24).attr("y", lastKernely + 5).attr("width", 60).attr("height", 60).attr("text-anchor", "left")
                .append("tspan").attr("font-size", 10).text(`${currOutputi + 1},${currOutputj + 1},${f + 1}`)
                .attr("opacity", 0).transition().duration(0).delay(1000 + batchWindowDelay * 2000).attr("opacity", 1);
            }

            batchWindowDelay += 1;
            currOutputj++;
          }
        }
        if (i + inputConv.filterSize - 1 < inputConvShape[1]) {
          currOutputi++;
        }
      }
      }
    }
    return () => clearAnimations(node);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgRef.current]);
}
