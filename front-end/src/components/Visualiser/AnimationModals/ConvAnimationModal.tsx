import {
  dummyModelActivation,
  dummyModelConv,
  dummyModelOutputs,
  MAXLAYERS,
  MidPoint,
} from "@/utils/types";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { drawConvLayer } from "@/utils/drawConvLayer";
import { drawKernels } from "@/utils/drawKernels";
import { MathJax } from "better-react-mathjax";
import { drawBiases } from "@/utils/drawBiases";
import { drawRightBracketWithText } from "@/utils/drawRightBracketWithText";
import { ActivationType } from "../../../utils/types";
import { drawKernelsNotations } from "@/utils/drawKernelsNotation";
import { is3DTensor } from "@/utils/is3DTensor";
import { isNumberParam } from "@/utils/typeGuards";
import { drawConvNotation } from "@/utils/drawConvNotation";
import { formatDimsFromTensorShape } from "@/utils/formatDimsFromTensorShape";

interface Props {
  onClose: () => void;
  layerIndex: number[];
  tensorLayers: dummyModelOutputs[];
}

const ConvAnimationModal: React.FC<Props> = ({
  tensorLayers,
  layerIndex,
  onClose,
}) => {
  const initialRef = null;
  const modalSvgRef = useRef<SVGSVGElement | null>(initialRef);

  const inputConv = tensorLayers[layerIndex[1]] as dummyModelConv;
  const inputConvShape = inputConv.padded.shape as [
    number,
    number,
    number,
    number
  ];

  const outputConvShape = inputConv.output.shape as [
    number,
    number,
    number,
    number
  ];
  const convColourScheme = d3.schemeObservable10.slice(0, 5);
  const outputColourScheme = d3.schemeObservable10.slice(5, 11);
  const activationFormulaLatex: Record<ActivationType, string> = {
    Sigmoid: `\\(\\alpha(x) = \\frac{1}{1 + e^{-x}}\\)`,
    Tanh: `\\(\\alpha(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}}\\)`,
    ReLU: `\\(\\alpha(x) = max(0, x)\\)`,
    "Leaky ReLU": `\\(\\alpha(x) = max(0.01x, x)\\)`,
  };

  let didInit = false;
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      const root = d3.select(modalSvgRef.current);
      root.selectAll("*").remove();

      // DRAW PADDED INPUT
      const paddedGroup = root
        .append("g")
        .attr("class", `padded-input`)
        .attr("transform", `translate(50, 0)`);
      const paddedLines = drawConvLayer(
        550,
        650,
        MAXLAYERS,
        paddedGroup,
        (tensorLayers[layerIndex[1]] as dummyModelConv).padded.arraySync()
      );

      paddedGroup
        .append("text")
        .attr("x", paddedGroup.select(`#rect-0`).attr("x"))
        .attr("y", 500 * 0.05)
        .attr("text-anchor", "left")
        .attr("font-size", 14)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text("Input Layer");

      paddedGroup
        .append("text")
        .attr(
          "x",
          paddedGroup.select(`#rect-0`).attr("x") +
            0.5 * +paddedGroup.select(`#rect-0`).attr("width")
        )
        .attr("y", 600)
        .attr("text-anchor", "left")
        .attr("font-size", 14)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text(`${formatDimsFromTensorShape(inputConvShape)}`);

      paddedGroup
        .append("text")
        .attr("x", paddedGroup.select(`#rect-0`).attr("x"))
        .attr("y", 500 * 0.09)
        .attr("text-anchor", "left")
        .attr("font-size", 10)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text(`Padding Size of ${inputConv.padSize}`);

      paddedGroup
        .append("foreignObject")
        .attr(
          "x",
          parseInt(paddedGroup.select(`#rect-0`).attr("x")) +
            parseInt(paddedGroup.select(`#rect-0`).attr("width")) * 0.5 -
            7
        )
        .attr("y", parseInt(paddedGroup.select(`#rect-0`).attr("y")) - 25)
        .attr("width", 20)
        .attr("height", 20)
        .attr("font-size", 14)
        .append("xhtml:div")
        .style("position", "fixed")
        .style("color", "#333")
        .style("opacity", "1")
        .html("<span>\\(X\\)</span>");

      for (let i = 0; i < (inputConv.padded.shape[3] as number); i++) {
        paddedGroup
          .append("foreignObject")
          .attr("x", parseInt(paddedGroup.select(`#rect-${i}`).attr("x")) - 20)
          .attr(
            "y",
            parseInt(paddedGroup.select(`#rect-${i}`).attr("y")) +
              0.5 * parseInt(paddedGroup.select(`#rect-${i}`).attr("height")) -
              5
          )
          .attr("width", 20)
          .attr("height", 20)
          .attr("font-size", 10)
          .append("xhtml:div")
          .style("position", "fixed")
          .style("color", "#333")
          .style("opacity", "0.6")
          .html(`<span>\\(X_{${i + 1}}\\)</span>`);
      }

      const bracketX =
        parseInt(
          paddedGroup
            .select(`#rect-${(inputConv.padded.shape[3] as number) - 1}`)
            .attr("x")
        ) +
        6 +
        parseInt(
          paddedGroup
            .select(`#rect-${(inputConv.padded.shape[3] as number) - 1}`)
            .attr("width")
        );

      drawRightBracketWithText(paddedGroup, {
        x: bracketX,
        startY: parseInt(
          paddedGroup
            .select(`#rect-${(inputConv.padded.shape[3] as number) - 1}`)
            .attr("y")
        ),
        endY:
          parseInt(
            paddedGroup
              .select(`#rect-${(inputConv.padded.shape[3] as number) - 1}`)
              .attr("y")
          ) +
          parseInt(
            paddedGroup
              .select(`#rect-${(inputConv.padded.shape[3] as number) - 1}`)
              .attr("height")
          ),
        thickness: 1,
        text: "Channel",
        textXOffset: 10,
        verticalText: true,
      });

      // DRAW KERNEL
      const kernelGroup = root
        .append("g")
        .attr("class", `kernel`)
        .attr("transform", `translate(20, 0)`);

      const kernelLines = drawKernels(
        750,
        650,
        MAXLAYERS,
        kernelGroup,
        (
          tensorLayers[layerIndex[1]] as dummyModelConv
        ).kernel.arraySync() as number[][][][]
      );

      const kernelLabelX =
        parseInt(root.select(`#k-${0}-${0}`).attr("width")) * 0.5 +
        (parseInt(root.select(`#k-${0}-${0}`).attr("x")) +
          parseInt(
            root.select(`#k-${inputConv.dims.depth - 1}-${0}`).attr("x")
          )) /
          2;
      kernelGroup
        .append("text")
        .attr("x", kernelLabelX)
        .attr("y", 500 * 0.05)
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text("Filters");

      kernelGroup
        .append("text")
        .attr("x", kernelLabelX)
        .attr("y", 600)
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text(
          `${formatDimsFromTensorShape(
            (tensorLayers[layerIndex[1]] as dummyModelConv).kernel
              .shape as number[]
          )}`
        );

      kernelGroup
        .append("text")
        .attr("x", kernelLabelX)
        .attr("y", 500 * 0.05 + 20)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text(`${inputConv.filterSize}x ${inputConv.filterSize} kernel size`);

      kernelGroup
        .append("text")
        .attr("x", kernelLabelX)
        .attr("y", 500 * 0.05 + 31)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text(`stride of ${inputConv.stride}`);

      kernelGroup
        .append("text")
        .attr("x", kernelLabelX)
        .attr("y", 500 * 0.05 + 42)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text(`${inputConv.dims.depth} filter/s`);

      kernelGroup
        .append("foreignObject")
        .attr("x", kernelLabelX)
        .attr("y", parseInt(root.select(`#k-${0}-${0}`).attr("y")) - 50)
        .attr("width", 20)
        .attr("height", 20)
        .attr("font-size", 14)
        .append("xhtml:div")
        .style("position", "fixed")
        .style("color", "#333")
        .style("opacity", "1")
        .style("font-weight", "bold")
        .html(`<span>\\(\\Omega\\)</span>`);

      for (let i = 0; i < inputConv.dims.depth; i++) {
        kernelGroup
          .append("foreignObject")
          .attr(
            "x",
            parseInt(root.select(`#k-${i}-${0}`).attr("x")) +
              0.5 * parseInt(root.select(`#k-${i}-${0}`).attr("width")) -
              5
          )
          .attr("y", parseInt(root.select(`#k-${0}-${0}`).attr("y")) - 20)
          .attr("width", 20)
          .attr("height", 20)
          .attr("font-size", 10)
          .append("xhtml:div")
          .style("position", "fixed")
          .style("color", "#333")
          .style("opacity", "0.6")
          .html(`<span>\\(F_{${i + 1}}\\)</span>`);
      }

      const kernelBracketX =
        parseInt(
          root
            .select(
              `#k-${inputConv.dims.depth - 1}-${
                (inputConv.padded.shape[3] as number) - 1
              }`
            )
            .attr("x")
        ) +
        6 +
        parseInt(
          root
            .select(
              `#k-${inputConv.dims.depth - 1}-${
                (inputConv.padded.shape[3] as number) - 1
              }`
            )
            .attr("width")
        );

      drawRightBracketWithText(kernelGroup, {
        x: kernelBracketX,
        startY: parseInt(
          root
            .select(
              `#k-${inputConv.dims.depth - 1}-${
                (inputConv.padded.shape[3] as number) - 1
              }`
            )
            .attr("y")
        ),
        endY:
          parseInt(
            root
              .select(
                `#k-${inputConv.dims.depth - 1}-${
                  (inputConv.padded.shape[3] as number) - 1
                }`
              )
              .attr("y")
          ) +
          parseInt(
            root
              .select(
                `#k-${inputConv.dims.depth - 1}-${
                  (inputConv.padded.shape[3] as number) - 1
                }`
              )
              .attr("height")
          ),
        thickness: 1,
        text: "Kernel",
        textXOffset: 10,
        verticalText: true,
      });

      // DRAW BIAS
      const biasGroup = root
        .append("g")
        .attr("class", `biases`)
        .attr("transform", `translate(550, 0)`);

      const biasLines = drawBiases(
        1200,
        650,
        (
          (
            tensorLayers[layerIndex[1]] as dummyModelConv
          ).bias.arraySync() as number[]
        ).length,
        MAXLAYERS,
        biasGroup,
        (tensorLayers[layerIndex[1]] as dummyModelConv).bias.arraySync()
      );

      const biasLabelx = parseInt(root.select(`#neuron-0`).attr("cx"));

      biasGroup
        .append("text")
        .attr("x", biasLabelx)
        .attr("y", 500 * 0.05)
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text("Bias");

      biasGroup
        .append("text")
        .attr("x", biasLabelx)
        .attr("y", 600)
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text(
          `${
            (
              (
                tensorLayers[layerIndex[1]] as dummyModelConv
              ).bias.arraySync() as number[]
            ).length
          } ${
            (
              (
                tensorLayers[layerIndex[1]] as dummyModelConv
              ).bias.arraySync() as number[]
            ).length > 1
              ? "biases"
              : "bias"
          }`
        );

      biasGroup
        .append("foreignObject")
        .attr("x", biasLabelx - 7)
        .attr("y", parseInt(root.select(`#neuron-0`).attr("cy")) - 45)
        .attr("width", 20)
        .attr("height", 20)
        .attr("font-size", 14)
        .append("xhtml:div")
        .style("position", "fixed")
        .style("color", "#333")
        .style("opacity", "1")
        .html(`<span>\\(B\\)</span>`);

      for (
        let i = 0;
        i <
        (
          (
            tensorLayers[layerIndex[1]] as dummyModelConv
          ).bias.arraySync() as number[]
        ).length;
        i++
      ) {
        biasGroup
          .append("foreignObject")
          .attr(
            "x",
            parseInt(root.select(`#neuron-${i}`).attr("cx")) +
              1.8 * parseInt(root.select(`#neuron-${i}`).attr("r")) -
              5
          )
          .attr(
            "y",
            parseInt(root.select(`#neuron-${i}`).attr("cy")) +
              1.3 * parseInt(root.select(`#neuron-${i}`).attr("r"))
          )
          .attr("width", 20)
          .attr("height", 20)
          .attr("font-size", 10)
          .append("xhtml:div")
          .style("position", "fixed")
          .style("color", "#333")
          .style("opacity", "0.6")
          .html(`<span>\\(\\beta_{${i + 1}}\\)</span>`);
      }

      // DRAW OUTPUT
      const outputGroup = root
        .append("g")
        .attr("class", `output`)
        .attr("transform", `translate(700, 0)`);

      const outputLines = drawConvLayer(
        550,
        650,
        MAXLAYERS,
        outputGroup,
        tensorLayers[layerIndex[1]].output.arraySync()
      );

      const outputLabelX =
        parseInt(outputGroup.select(`#rect-0`).attr("x")) +
        parseInt(outputGroup.select(`#rect-0`).attr("width")) * 0.5;

      outputGroup
        .append("text")
        .attr("x", outputLabelX)
        .attr("y", 500 * 0.05)
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text("Pre-Activation");

      outputGroup
        .append("foreignObject")
        .attr("x", outputLabelX - 27)
        .attr("y", parseInt(outputGroup.select(`#rect-0`).attr("y")) - 20)
        .attr("width", 55)
        .attr("height", 20)
        .attr("font-size", 10)
        .append("xhtml:div")
        .style("position", "fixed")
        .style("color", "#333")
        .style("opacity", "1")
        .html(`<span>\\(\\Omega \\cdot X + B\\)</span>`);

      // DRAW ACTIVATION OUTPUT
      const activationGroup = root
        .append("g")
        .attr("class", `activation-output`)
        .attr("transform", `translate(820, 0)`);

      const activationLines = drawConvLayer(
        550,
        650,
        MAXLAYERS,
        activationGroup,
        (tensorLayers[layerIndex[0]] as dummyModelActivation).output.arraySync()
      );

      for (let i = 0; i < inputConv.dims.depth; i++) {
        activationGroup
          .append("foreignObject")
          .attr(
            "x",
            parseInt(activationGroup.select(`#rect-${i}`).attr("x")) +
              parseInt(activationGroup.select(`#rect-${i}`).attr("width")) +
              10
          )
          .attr(
            "y",
            parseInt(activationGroup.select(`#rect-${i}`).attr("y")) +
              0.5 *
                parseInt(activationGroup.select(`#rect-${i}`).attr("height")) -
              5
          )
          .attr("width", 20)
          .attr("height", 20)
          .attr("font-size", 10)
          .append("xhtml:div")
          .style("position", "fixed")
          .style("color", "#333")
          .style("opacity", "0.6")
          .html(`<span>\\(H_{${i + 1}}\\)</span>`);
      }

      const actiLabelX =
        parseInt(activationGroup.select(`#rect-0`).attr("x")) +
        parseInt(outputGroup.select(`#rect-0`).attr("width")) * 0.5;

      activationGroup
        .append("text")
        .attr("x", actiLabelX)
        .attr("y", 500 * 0.05)
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text("Activation");

      activationGroup
        .append("text")
        .attr("x", actiLabelX)
        .attr("y", 600)
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text(`${formatDimsFromTensorShape(outputConvShape)}`);

      activationGroup
        .append("text")
        .attr("x", actiLabelX)
        .attr("y", 500 * 0.05 + 20)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("opacity", 0.8)
        .attr("fill", "#333")
        .text(`${(tensorLayers[layerIndex[0]] as dummyModelActivation).type}`);

      activationGroup
        .append("foreignObject")
        .attr("x", actiLabelX - 35)
        .attr("y", parseInt(activationGroup.select(`#rect-0`).attr("y")) - 20)
        .attr("width", 70)
        .attr("height", 20)
        .attr("font-size", 10)
        .append("xhtml:div")
        .style("position", "fixed")
        .style("color", "#333")
        .style("opacity", "1")
        .html(`<span>\\(\\alpha(\\Omega \\cdot X + B\\))</span>`);

      activationGroup
        .append("foreignObject")
        .attr("x", actiLabelX - 7)
        .attr("y", parseInt(activationGroup.select(`#rect-0`).attr("y")) - 45)
        .attr("width", 20)
        .attr("height", 20)
        .attr("font-size", 14)
        .append("xhtml:div")
        .style("position", "fixed")
        .style("color", "#333")
        .style("opacity", "1")
        .html(`<span>\\(H\\)</span>`);

      const formulaGroup = root
        .append("g")
        .attr("class", `formula`)
        .attr("transform", `translate(1000, 10)`);

      var formulaText = [
        "Let \\(H_1\\) contain \\(H_{ij1}\\) outputs (All values of output channel \\(H_1\\))",
        `Let \\(K\\) be a kernel in Filter \\(F_{1}\\) and \\(K \\in \\mathbb{R}^{p \\times p}\\) `,
        `Let \\(D\\) denote the number of kernels in filter \\(F_{1}\\)`,
        `Let \\(\\alpha\\) denote the ${
          (tensorLayers[layerIndex[0]] as dummyModelActivation).type
        } activation function.</br>`,
        `\\(D = ${inputConv.padded.shape[3] as number}\\)`,
        `\\(p = ${inputConv.filterSize}\\)`,
        activationFormulaLatex[
          (tensorLayers[layerIndex[0]] as dummyModelActivation).type
        ],
        "</br>",
        `The convolution operation looks similar to the generalised deep neural network...`,
        `\\( H = \\alpha(\\Omega \\cdot X + B) \\) </br>`,
        "A single output in \\(H_1\\) can be calculated via...",
      ];

      if (inputConv.stride == 1) {
        formulaText.push(
          `\\( H_{ij1} =  \\alpha \\Bigl[\\sum_{l=1}^{D} \\sum_{m=1}^{p} \\sum_{n=1}^{p} (w_{mnl} \\times x_{i+m+p+1, j+n-p+1, l}) + \\beta_{${1}} \\Bigr] \\)`
        );
      }

      if (inputConv.filterSize > 3) {
        formulaText.push(
          `(If your filter size is less than 4x4 you can see the values of the weights and input, currently they are hidden due to size)`
        );
      } else {
        formulaText.push(
          `(Please note that final calculation results are rounded to 1dp and computing truncation is used)`
        );
      }
      const formulaParagraph = formulaText
        .map((s) => `<span>${s}</span>`)
        .join("<br/>");

      formulaGroup
        .append("g")
        .attr("class", "equations")
        .append("foreignObject")
        .attr("width", 700)
        .attr("height", 500)
        .attr("font-size", 14)
        .append("xhtml:div")
        .style("position", "fixed")
        .style("color", "#333")
        .html(formulaParagraph);

      formulaGroup
        .append("g")
        .attr("class", "visual")
        .attr("id", (d, i) => `formula-visual`)
        .attr("transform", `translate(0, 370)`)
        .attr("width", 700)
        .attr("height", 280);

      // vvv FOR EACH FILTER... vvv

      let batchWindowDelay = 0;

      const biasid = `#neuron-${0}`;
      const bias = biasGroup.select(biasid);

      const biasx = +bias.attr("cx");
      const biasy = +bias.attr("cy");
      const biasr = +bias.attr("r");

      const colourBias = biasGroup
        .append("circle")
        .attr("cx", biasx)
        .attr("cy", biasy)
        .attr("r", biasr)
        .attr("fill", outputColourScheme[0])
        .style("opacity", 0.7);

      // DRAW connecting lines
      // between input and kernel

      if (paddedLines && kernelLines) {
        for (let i = 0; i < (paddedLines[1] as MidPoint[]).length; i++) {
          const p1 = paddedLines[1][i];
          const p2 = kernelLines[0][0][i];
          const p3 = kernelLines[0][1][i];
          const p4 = biasLines[0][0];

          const pathIn = d3.path();
          const midXin = (p1.x + p2.x) / 2;
          pathIn.moveTo(p1.x, p1.y);
          pathIn.bezierCurveTo(midXin, p1.y, midXin, p2.y, p2.x, p2.y);

          root
            .append("path")
            .attr("class", "padded-kernel-connection")
            .attr("d", pathIn.toString())
            .attr("fill", "none")
            .attr("stroke", outputColourScheme[0])
            .attr("stroke-width", 2)
            .attr("opacity", 0)
            .transition()
            .delay(1000)
            .attr("opacity", 0.5);

          const pathOut = d3.path();
          const midXOut = (p3.x + p4.x) / 2;
          pathOut.moveTo(p3.x, p3.y);
          pathOut.bezierCurveTo(midXOut, p3.y, midXOut, p4.y, p4.x, p4.y);

          root
            .append("path")
            .attr("class", "kernel-output-connection")
            .attr("d", pathOut.toString())
            .attr("fill", "none")
            .attr("stroke", outputColourScheme[0])
            .attr("stroke-width", 2)
            .attr("opacity", 0)
            .transition()
            .delay(1000)
            .attr("opacity", 0.5);
        }
      }

      if (biasLines && outputLines && activationLines) {
        const f = 0;
        const p1 = biasLines[1][f];
        const p2 = outputLines[0][f];
        const p3 = outputLines[1][f];
        const p4 = activationLines[0][f];

        const pathIn = d3.path();
        const midXin = (p1.x + p2.x) / 2;
        pathIn.moveTo(p1.x, p1.y);
        pathIn.bezierCurveTo(midXin, p1.y, midXin, p2.y, p2.x, p2.y);

        root
          .append("path")
          .attr("class", "padded-kernel-connection")
          .attr("d", pathIn.toString())
          .attr("fill", "none")
          .attr("stroke", outputColourScheme[0])
          .attr("stroke-width", 2)
          .attr("opacity", 0)
          .transition()
          .delay(1000)
          .attr("opacity", 0.5);

        const pathOut = d3.path();
        const midXOut = (p3.x + p4.x) / 2;
        pathOut.moveTo(p3.x, p3.y);
        pathOut.bezierCurveTo(midXOut, p3.y, midXOut, p4.y, p4.x, p4.y);

        root
          .append("path")
          .attr("class", "kernel-output-connection")
          .attr("d", pathOut.toString())
          .attr("fill", "none")
          .attr("stroke", outputColourScheme[0])
          .attr("stroke-width", 2)
          .attr("opacity", 0)
          .transition()
          .delay(1000)
          .attr("opacity", 0.5);
      }

      // extra current filter values TODO
      var currFilterValues: number[][][][] = [];
      const filterTensor = (
        tensorLayers[layerIndex[1]] as dummyModelConv
      ).kernel.arraySync() as number[][][][];

      for (let row = 0; row < inputConv.filterSize; row++) {
        currFilterValues[row] = [];
        for (let col = 0; col < inputConv.filterSize; col++) {
          currFilterValues[row][col] = [];
          for (let k = 0; k < (inputConv.padded.shape[3] as number); k++) {
            currFilterValues[row][col][k] = [];
            currFilterValues[row][col][k][0] = filterTensor[row][col][k][0];
          }
        }
      }

      const formulaKernels = drawKernelsNotations(
        700,
        280,
        10,
        20,
        120,
        formulaGroup.select("#formula-visual"),
        currFilterValues,
        outputColourScheme[0],
        (
          (
            tensorLayers[layerIndex[1]] as dummyModelConv
          ).bias.arraySync() as number[]
        )[0],
        0
      );

      var currOutputi = 0;
      var currOutputj = 0;
      for (let i = 0; i < inputConvShape[1]; i += inputConv.stride) {
        currOutputj -= currOutputj;
        for (let j = 0; j < inputConvShape[2]; j += inputConv.stride) {
          if (
            i + inputConv.filterSize - 1 < inputConvShape[1] &&
            j + inputConv.filterSize - 1 < inputConvShape[2]
          ) {
            for (let k = 0; k < inputConvShape[3]; k++) {
              const id = `#square-${i}-${j}-${k}`;
              const outputid = `#square-${currOutputi}-${currOutputj}-${0}`;
              const kernelid = `#k-${0}-${k}`;

              const kernel = kernelGroup.select(kernelid);
              const rect = paddedGroup.select(id);
              const outputRect = outputGroup.select(outputid);
              const actiRect = activationGroup.select(outputid);

              if (rect.empty() && kernel.empty()) return;

              // get original geo
              const cellx = +rect.attr("x");
              const celly = +rect.attr("y");
              const cellw = +rect.attr("width");
              const cellh = +rect.attr("height");

              const outputCellx = +outputRect.attr("x");
              const outputCelly = +outputRect.attr("y");
              const outputCellw = +outputRect.attr("width");
              const outputCellh = +outputRect.attr("height");

              const kernelx = +kernel.attr("x");
              const kernely = +kernel.attr("y");
              const kernelw = +kernel.attr("width");
              const kernelh = +kernel.attr("height");

              const actiCellx = +actiRect.attr("x");
              const actiCelly = +actiRect.attr("y");
              const actiCellw = +actiRect.attr("width");
              const actiCellh = +actiRect.attr("height");

              const schemeColor = convColourScheme[k] as string;

              kernelGroup
                .append("rect")
                .attr("x", kernelx)
                .attr("y", kernely)
                .attr("width", kernelw)
                .attr("height", kernelh)
                .attr("fill", schemeColor)
                .style("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .style("opacity", 0.4)
                .transition()
                .delay(1000)
                .remove();

              outputGroup
                .append("rect")
                .attr("x", outputCellx)
                .attr("y", outputCelly)
                .attr("width", outputCellw)
                .attr("height", outputCellh)
                .attr("fill", outputColourScheme[0])
                .style("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .style("opacity", 0.4)
                .transition()
                .delay(1000)
                .remove();

              activationGroup
                .append("rect")
                .attr("x", actiCellx)
                .attr("y", actiCelly)
                .attr("width", actiCellw)
                .attr("height", actiCellh)
                .attr("fill", outputColourScheme[0])
                .style("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .style("opacity", 0.4)
                .transition()
                .delay(1000)
                .remove();

              paddedGroup
                .append("rect")
                .attr("x", cellx)
                .attr("y", celly)
                .attr("width", cellw * inputConv.filterSize)
                .attr("height", cellh * inputConv.filterSize)
                .attr("fill", schemeColor)
                .style("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .style("opacity", 0.7)
                .transition()
                .delay(1000)
                .remove();

              var filteredInput: number[][] = [];
              for (let dy = 0; dy < inputConv.filterSize; dy++) {
                filteredInput[dy] = [];
                for (let dx = 0; dx < inputConv.filterSize; dx++) {
                  var filterInputX = dx + j;
                  var filterInputY = dy + i;
                  var tensor = (
                    tensorLayers[layerIndex[1]] as dummyModelConv
                  ).padded.arraySync();
                  if (is3DTensor(tensor)) {
                    if (
                      isNumberParam(tensor[0][filterInputY][filterInputX][k])
                    ) {
                      filteredInput[dy][dx] =
                        tensor[0][filterInputY][filterInputX][k];
                    } else {
                    }
                  }
                }
              }

              const equationVisualiserGroup =
                formulaGroup.select(`#formula-visual`);

              var filterInput = drawConvNotation(
                schemeColor,
                700,
                280,
                10, //max layers
                20 + 123.2 * k,
                10,
                i,
                j,
                k,
                equationVisualiserGroup,
                1000 + batchWindowDelay * 2000,
                filteredInput,
                currOutputi == outputConvShape[1] - 1 &&
                  currOutputj == outputConvShape[2] - 1
                  ? true
                  : undefined
              );
            }

            if (
              !(
                currOutputi == outputConvShape[1] - 1 &&
                currOutputj == outputConvShape[2] - 1
              )
            ) {
              var lastKernel = formulaGroup
                .select(`#formula-visual`)
                .select(`#diagramatic-right-bracket`);
              const lastKernelx = +lastKernel.attr("x");
              const lastKernely = +lastKernel.attr("y");

              let randomOpacity = Math.random();

              if (
                isNumberParam(
                  (
                    tensorLayers[
                      layerIndex[0]
                    ].output.arraySync() as number[][][][]
                  )[0][currOutputi][currOutputj][0]
                )
              ) {
                // negative opacity shit solution
                // what to do -> future map them to a RGB range
                // more than 1 -> another shade -> etc...
                randomOpacity = (
                  tensorLayers[
                    layerIndex[1]
                  ].output.arraySync() as number[][][][]
                )[0][currOutputi][currOutputj][0];
                randomOpacity += Math.abs(-100);
                randomOpacity /= Math.abs(-100) + 100;
                if (randomOpacity > 1) {
                  randomOpacity = 1.0;
                } else if (randomOpacity < 0) {
                  randomOpacity = 0.0;
                }
              }
              formulaGroup
                .select(`#formula-visual`)
                .append("rect")
                .attr("x", lastKernelx + 157)
                .attr("y", lastKernely - 50)
                .attr("width", 60)
                .attr("height", 60)
                .attr("fill", "#5f6c7b")
                .attr("stroke", "#094067")
                .attr("stroke-opacity", 0)
                .attr("stroke-width", 1)
                .style("fill-opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .style("fill-opacity", randomOpacity)
                .attr("stroke-opacity", 1)
                .transition()
                .delay(1000)
                .remove();

              formulaGroup
                .select(`#formula-visual`)
                .append("text")
                .attr("x", lastKernelx + 157 + 4)
                .attr("y", lastKernely - 15)
                .attr("width", 60)
                .attr("height", 60)
                .attr("font-size", 20)
                .text(
                  `${(
                    tensorLayers[
                      layerIndex[1]
                    ].output.arraySync() as number[][][][]
                  )[0][currOutputi][currOutputj][0].toFixed(1)}`
                )
                .attr("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .attr("opacity", 1)
                .transition()
                .delay(1000)
                .remove();

              let outputRandomOpacity = Math.random();

              if (
                isNumberParam(
                  (
                    tensorLayers[
                      layerIndex[0]
                    ].output.arraySync() as number[][][][]
                  )[0][currOutputi][currOutputj][0]
                )
              ) {
                // negative opacity shit solution
                // what to do -> future map them to a RGB range
                // more than 1 -> another shade -> etc...
                outputRandomOpacity = (
                  tensorLayers[
                    layerIndex[0]
                  ].output.arraySync() as number[][][][]
                )[0][currOutputi][currOutputj][0];
                outputRandomOpacity += Math.abs(-100);
                outputRandomOpacity /= Math.abs(-100) + 100;
                if (outputRandomOpacity > 1) {
                  outputRandomOpacity = 1.0;
                } else if (outputRandomOpacity < 0) {
                  outputRandomOpacity = 0.0;
                }
              }
              formulaGroup
                .select(`#formula-visual`)
                .append("rect")
                .attr("x", lastKernelx + 330)
                .attr("y", lastKernely - 50)
                .attr("width", 60)
                .attr("height", 60)
                .attr("fill", "#5f6c7b")
                .attr("stroke", "#094067")
                .attr("stroke-opacity", 0)
                .attr("stroke-width", 1)
                .style("fill-opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .style("fill-opacity", outputRandomOpacity)
                .attr("stroke-opacity", 1)
                .transition()
                .delay(1000)
                .remove();

              formulaGroup
                .select(`#formula-visual`)
                .append("text")
                .attr("x", lastKernelx + 330 + 10)
                .attr("y", lastKernely - 15)
                .attr("width", 60)
                .attr("height", 60)
                .attr("font-size", 20)
                .text(
                  `${(
                    tensorLayers[
                      layerIndex[0]
                    ].output.arraySync() as number[][][][]
                  )[0][currOutputi][currOutputj][0].toFixed(1)}`
                )
                .attr("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .attr("opacity", 1)
                .transition()
                .delay(1000)
                .remove();

              formulaGroup
                .select(`#formula-visual`)
                .append("text")
                .attr("id", (d, _) => `text-output-index`)
                .attr("x", lastKernelx + 330 + 13)
                .attr("y", lastKernely + 3)
                .attr("width", 60)
                .attr("height", 60)
                .attr("text-anchor", "left")
                .append("tspan")
                .attr("font-size", 14)
                .text("h")
                .attr("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .attr("opacity", 1)
                .transition()
                .delay(1000)
                .remove();

              formulaGroup
                .select(`#formula-visual`)
                .append("text")
                .attr("id", (d, _) => `text-output-index`)
                .attr("x", lastKernelx + 330 + 24)
                .attr("y", lastKernely + 5)
                .attr("width", 60)
                .attr("height", 60)
                .attr("text-anchor", "left")
                .append("tspan")
                .attr("font-size", 10)
                .text(`${currOutputi + 1},${currOutputj + 1},${1}`)
                .attr("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .attr("opacity", 1)
                .transition()
                .delay(1000)
                .remove();
            } else {
              var lastKernel = formulaGroup
                .select(`#formula-visual`)
                .select(`#diagramatic-right-bracket`);
              const lastKernelx = +lastKernel.attr("x");
              const lastKernely = +lastKernel.attr("y");

              let randomOpacity = Math.random();

              if (
                isNumberParam(
                  (
                    tensorLayers[
                      layerIndex[0]
                    ].output.arraySync() as number[][][][]
                  )[0][currOutputi][currOutputj][0]
                )
              ) {
                // negative opacity shit solution
                // what to do -> future map them to a RGB range
                // more than 1 -> another shade -> etc...
                randomOpacity = (
                  tensorLayers[
                    layerIndex[1]
                  ].output.arraySync() as number[][][][]
                )[0][currOutputi][currOutputj][0];
                randomOpacity += Math.abs(-100);
                randomOpacity /= Math.abs(-100) + 100;
                if (randomOpacity > 1) {
                  randomOpacity = 1.0;
                } else if (randomOpacity < 0) {
                  randomOpacity = 0.0;
                }
              }
              formulaGroup
                .select(`#formula-visual`)
                .append("rect")
                .attr("x", lastKernelx + 157)
                .attr("y", lastKernely - 50)
                .attr("width", 60)
                .attr("height", 60)
                .attr("fill", "#5f6c7b")
                .attr("stroke", "#094067")
                .attr("stroke-opacity", 0)
                .attr("stroke-width", 1)
                .style("fill-opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .style("fill-opacity", randomOpacity)
                .attr("stroke-opacity", 1);

              formulaGroup
                .select(`#formula-visual`)
                .append("text")
                .attr("x", lastKernelx + 157 + 4)
                .attr("y", lastKernely - 15)
                .attr("width", 60)
                .attr("height", 60)
                .attr("font-size", 20)
                .text(
                  `${(
                    tensorLayers[
                      layerIndex[1]
                    ].output.arraySync() as number[][][][]
                  )[0][currOutputi][currOutputj][0].toFixed(1)}`
                )
                .attr("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .attr("opacity", 1);

              let outputRandomOpacity = Math.random();

              if (
                isNumberParam(
                  (
                    tensorLayers[
                      layerIndex[0]
                    ].output.arraySync() as number[][][][]
                  )[0][currOutputi][currOutputj][0]
                )
              ) {
                // negative opacity shit solution
                // what to do -> future map them to a RGB range
                // more than 1 -> another shade -> etc...
                outputRandomOpacity = (
                  tensorLayers[
                    layerIndex[0]
                  ].output.arraySync() as number[][][][]
                )[0][currOutputi][currOutputj][0];
                outputRandomOpacity += Math.abs(-100);
                outputRandomOpacity /= Math.abs(-100) + 100;
                if (outputRandomOpacity > 1) {
                  outputRandomOpacity = 1.0;
                } else if (outputRandomOpacity < 0) {
                  outputRandomOpacity = 0.0;
                }
              }
              formulaGroup
                .select(`#formula-visual`)
                .append("rect")
                .attr("x", lastKernelx + 330)
                .attr("y", lastKernely - 50)
                .attr("width", 60)
                .attr("height", 60)
                .attr("fill", "#5f6c7b")
                .attr("stroke", "#094067")
                .attr("stroke-opacity", 0)
                .attr("stroke-width", 1)
                .style("fill-opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .style("fill-opacity", outputRandomOpacity)
                .attr("stroke-opacity", 1);

              formulaGroup
                .select(`#formula-visual`)
                .append("text")
                .attr("x", lastKernelx + 330 + 10)
                .attr("y", lastKernely - 15)
                .attr("width", 60)
                .attr("height", 60)
                .attr("font-size", 20)
                .text(
                  `${(
                    tensorLayers[
                      layerIndex[0]
                    ].output.arraySync() as number[][][][]
                  )[0][currOutputi][currOutputj][0].toFixed(1)}`
                )
                .attr("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .attr("opacity", 1);

              formulaGroup
                .select(`#formula-visual`)
                .append("text")
                .attr("id", (d, _) => `text-output-index`)
                .attr("x", lastKernelx + 330 + 13)
                .attr("y", lastKernely + 3)
                .attr("width", 60)
                .attr("height", 60)
                .attr("text-anchor", "left")
                .append("tspan")
                .attr("font-size", 14)
                .text("h")
                .attr("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .attr("opacity", 1);

              formulaGroup
                .select(`#formula-visual`)
                .append("text")
                .attr("id", (d, _) => `text-output-index`)
                .attr("x", lastKernelx + 330 + 24)
                .attr("y", lastKernely + 5)
                .attr("width", 60)
                .attr("height", 60)
                .attr("text-anchor", "left")
                .append("tspan")
                .attr("font-size", 10)
                .text(`${currOutputi + 1},${currOutputj + 1},${1}`)
                .attr("opacity", 0)
                .transition()
                .duration(0)
                .delay(1000 + batchWindowDelay * 2000)
                .attr("opacity", 1);
            }

            batchWindowDelay += 1;
            currOutputj++;
          }
        }
        if (i + inputConv.filterSize - 1 < inputConvShape[1]) {
          currOutputi++;
        }
      }

      colourBias
        .transition()
        .delay(batchWindowDelay * 2000)
        .remove();
    }
  }, [modalSvgRef.current]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 p-4 sm:p-6">
      <div
        className="
          bg-bg rounded-2xl 
          w-full max-w-[80hh] 
          max-h-[90vh] sm:max-h-[95vh]
          overflow-y-auto 
          p-4 sm:p-6 
          relative
        "
      >
        <button
          onClick={() => {
            const root = d3.select(modalSvgRef.current);
            root.selectAll("*").remove();
            onClose();
          }}
          className="
            absolute top-3 right-4 
            text-2xl sm:text-xl 
            text-foreground/70 hover:text-foreground 
            transition
          "
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mt-6 sm:mt-0">
          <h1 className="text-text text-2xl pb-3 font-semibold">
            Applying Convolutions...
          </h1>
          <p className="text-base text-text-muted px-2 pb-5">
            A convolution transforms an input vector into an output vector such
            that each output element is a weighted sum of nearby input elements.
            Each weighted sum is determined by a convolutional filter. A
            convolutional filter contains several kernels, where the number of
            kernels corresponds directly to the number of input channels.
            Multiple filters can be used, and the number of filters equals the
            number of output channels. Each filter performs a convolution
            operation over the entire input vector.
          </p>
          <div className="relative max-h-1/3 max-w-[2100px] overflow-auto ">
            <MathJax>
              <svg ref={modalSvgRef} className="w-[2100px] h-[650px] "></svg>
            </MathJax>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvAnimationModal;
