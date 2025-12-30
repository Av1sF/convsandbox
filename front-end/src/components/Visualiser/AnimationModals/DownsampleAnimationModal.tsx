import {
  DownsamplingType,
  dummyModelDownsample,
  dummyModelOutputs,
  MAXLAYERS,
  MidPoint,
} from "@/utils/types";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { MathJax } from "better-react-mathjax";
import { drawConvLayer } from "@/utils/drawConvLayer";
import { is3DTensor } from "@/utils/is3DTensor";
import { isNumberParam } from "@/utils/typeGuards";
import { drawConvNotation } from "@/utils/drawConvNotation";
import { formatDimsFromTensorShape } from "@/utils/formatDimsFromTensorShape";

interface Props {
  onClose: () => void;
  layerIndex: number[];
  tensorLayers: dummyModelOutputs[];
}

const DownsampleAnimationModal: React.FC<Props> = ({
  tensorLayers,
  layerIndex,
  onClose,
}) => {
  const initialRef = null;
  const modalSvgRef = useRef<SVGSVGElement | null>(initialRef);

  const convColourScheme = d3.schemeObservable10.slice(0, 5);
  const [poolingType, setPoolingType] = useState<DownsamplingType>();
  // const outputColourScheme = d3.schemeObservable10.slice(5, 11);

  let didInit = false;
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      const root = d3.select(modalSvgRef.current);
      root.selectAll("*").remove();

      setPoolingType(
        (tensorLayers[layerIndex[0]] as dummyModelDownsample).type
      );
      const poolingFunction = (
        tensorLayers[layerIndex[0]] as dummyModelDownsample
      ).type
        .toLowerCase()
        .includes("max")
        ? "Max"
        : "Avg";

      const poolingConv = tensorLayers[layerIndex[0]] as dummyModelDownsample;
      const inputConv = tensorLayers[layerIndex[1]];
      const inputConvShape = inputConv.output.shape as [
        number,
        number,
        number,
        number
      ];

      const outputConvShape = poolingConv.output.shape as [
        number,
        number,
        number,
        number
      ];

      if (poolingType && !poolingType.includes("Global")) {
        // Draw input
        const inputGroup = root
          .append("g")
          .attr("class", `padded-input`)
          .attr("transform", `translate(100, 0)`);

        const inputLines = drawConvLayer(
          550,
          650,
          MAXLAYERS,
          inputGroup,
          tensorLayers[layerIndex[1]].output.arraySync()
        );

        inputGroup
          .append("text")
          .attr("x", inputGroup.select(`#rect-0`).attr("x"))
          .attr("y", 500 * 0.05)
          .attr("text-anchor", "left")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text("Input Layer");

        inputGroup
          .append("text")
          .attr("x", inputGroup.select(`#rect-0`).attr("x"))
          .attr("y", 600)
          .attr("text-anchor", "left")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text(
            `${formatDimsFromTensorShape(
              tensorLayers[layerIndex[1]].output.shape as number[]
            )}`
          );

        // Draw Output

        const outputGroup = root
          .append("g")
          .attr("class", `output`)
          .attr("transform", `translate(700, 0)`);

        const outputLines = drawConvLayer(
          550,
          650,
          MAXLAYERS,
          outputGroup,
          poolingConv.output.arraySync()
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
          .text("Pooled Output");

        outputGroup
          .append("text")
          .attr("x", outputLabelX)
          .attr("y", 600)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text(
            `${formatDimsFromTensorShape(poolingConv.output.shape as number[])}`
          );

        // for each channel

        let currOutputi = 0;
        let batchWindowDelay = 0;
        let currOutputj = 0;

        const stride = poolingConv.stride ? poolingConv.stride : 1;
        const filterSize = poolingConv.filterSize ? poolingConv.filterSize : 1;

        const startX =
          (+inputGroup.select(`#rect-${0}`).attr("x") +
            +inputGroup.select(`#rect-${0}`).attr("width") +
            800 +
            +outputGroup.select(`#rect-${0}`).attr("x")) /
            2 -
          28.9;

        const inputFilterGroup = root
          .append("g")
          .attr("class", `filter`)
          .attr("transform", `translate(${startX}, 0)`);

        // draw lines
        if (inputLines && outputLines) {
          for (let i = 0; i < (inputLines[1] as MidPoint[]).length; i++) {
            const p1 = inputLines[1][i];
            const p2 = outputLines[0][i];

            root
              .append("line")
              .attr("x1", p1.x)
              .attr("y1", p1.y)
              .attr("x2", p1.x + 165)
              .attr("y2", p2.y)
              .attr("stroke", convColourScheme[i])
              .attr("stroke-width", 2)
              .attr("opacity", 0.5);

            root
              .append("line")
              .attr("x1", p1.x + 350)
              .attr("y1", p2.y)
              .attr("x2", p2.x)
              .attr("y2", p2.y)
              .attr("stroke", convColourScheme[i])
              .attr("stroke-width", 2)
              .attr("opacity", 0.5);
          }
        }

        for (let i = 0; i < inputConvShape[1]; i += stride) {
          currOutputj -= currOutputj;
          for (let j = 0; j < inputConvShape[1]; j += stride) {
            if (
              i + filterSize - 1 < inputConvShape[1] &&
              j + filterSize - 1 < inputConvShape[2]
            ) {
              for (let c = 0; c < inputConvShape[3]; c++) {
                // do shi here
                const inputCell = inputGroup.select(`#square-${i}-${j}-${c}`);
                const outputCell = outputGroup.select(
                  `#square-${currOutputi}-${currOutputj}-${c}`
                );

                const inputChannel = inputGroup.select(`#rect-${c}`);
          
                const startY = +inputChannel.attr("y");

                const outputCellx = +outputCell.attr("x");
                const outputCelly = +outputCell.attr("y");
                const outputCellw = +outputCell.attr("width");
                const outputCellh = +outputCell.attr("height");

                const inputCellx = +inputCell.attr("x");
                const inputCelly = +inputCell.attr("y");
                const inputCellw = +inputCell.attr("width");
                const inputCellh = +inputCell.attr("height");

                // animate sliding window for input and output
                if (
                  currOutputi == outputConvShape[1] - 1 &&
                  currOutputj == outputConvShape[2] - 1
                ) {
                  outputGroup
                    .append("rect")
                    .attr("x", outputCellx)
                    .attr("y", outputCelly)
                    .attr("width", outputCellw)
                    .attr("height", outputCellh)
                    .attr("fill", convColourScheme[c])
                    .style("opacity", 0)
                    .transition()
                    .duration(0)
                    .delay(1000 + batchWindowDelay * 2000)
                    .style("opacity", 0.7);

                  inputGroup
                    .append("rect")
                    .attr("x", inputCellx)
                    .attr("y", inputCelly)
                    .attr("width", inputCellw * filterSize)
                    .attr("height", inputCellh * filterSize)
                    .attr("fill", convColourScheme[c])
                    .style("opacity", 0)
                    .transition()
                    .duration(0)
                    .delay(1000 + batchWindowDelay * 2000)
                    .style("opacity", 0.7);
                } else {
                  outputGroup
                    .append("rect")
                    .attr("x", outputCellx)
                    .attr("y", outputCelly)
                    .attr("width", outputCellw)
                    .attr("height", outputCellh)
                    .attr("fill", convColourScheme[c])
                    .style("opacity", 0)
                    .transition()
                    .duration(0)
                    .delay(1000 + batchWindowDelay * 2000)
                    .style("opacity", 0.7)
                    .transition()
                    .delay(1000)
                    .remove();

                  inputGroup
                    .append("rect")
                    .attr("x", inputCellx)
                    .attr("y", inputCelly)
                    .attr("width", inputCellw * filterSize)
                    .attr("height", inputCellh * filterSize)
                    .attr("fill", convColourScheme[c])
                    .style("opacity", 0)
                    .transition()
                    .duration(0)
                    .delay(1000 + batchWindowDelay * 2000)
                    .style("opacity", 0.7)
                    .transition()
                    .delay(1000)
                    .remove();
                }

                // animate filter window
                const filteredInput: number[][] = [];
                for (let dy = 0; dy < filterSize; dy++) {
                  filteredInput[dy] = [];
                  for (let dx = 0; dx < filterSize; dx++) {
                    const filterInputX = dx + j;
                    const filterInputY = dy + i;
                    const tensor = inputConv.output.arraySync();
                    if (is3DTensor(tensor)) {
                      if (
                        isNumberParam(tensor[0][filterInputY][filterInputX][c])
                      ) {
                        filteredInput[dy][dx] =
                          tensor[0][filterInputY][filterInputX][c];
                      }
                    }
                  }
                }

                if (currOutputi == 0 && currOutputj == 0) {
                  inputFilterGroup
                    .append("text")
                    .attr("x", -62)
                    .attr("y", startY + 40 + c * 10)
                    .attr("width", 30)
                    .attr("height", 30)
                    .attr("id",  `diagramatic-right-bracket`)
                    .append("tspan")
                    .attr("font-size", 20)
                    .attr("class", `font-main`)
                    .text(`${poolingFunction}`)
                    .append("tspan")
                    .attr("font-size", 60)
                    .attr("class", "font-main")
                    .text("[‎ ‎ ‎‎‎ ‎  ‎‎ ‎ ‎ ]")
                    .style("opacity", 1);
                }

                // create group
                drawConvNotation(
                  convColourScheme[c],
                  700,
                  280,
                  10, //max layers
                  0,
                  startY - 18 + c * 10,
                  i,
                  j,
                  c,
                  inputFilterGroup,
                  1000 + batchWindowDelay * 2000,
                  filteredInput,
                  currOutputi == outputConvShape[1] - 1 &&
                    currOutputj == outputConvShape[2] - 1
                    ? true
                    : undefined
                );
              }
              batchWindowDelay += 1;
              currOutputj++;
            }
          }
          if (i + filterSize - 1 < inputConvShape[1]) {
            currOutputi++;
          }
        }
      } else if (poolingType && poolingType.includes("Global")) {
        const batchWindowDelay = 0;

        const inputGroup = root
          .append("g")
          .attr("class", `input`)
          .attr("transform", `translate(200, -90)`);

        const outputGroup = root
          .append("g")
          .attr("class", `output`)
          .attr("transform", `translate(450, -90)`);

        for (let c = 0; c < inputConvShape[3]; c++) {
          // animate filter window
          const filteredInput: number[][] = [];
          for (let dy = 0; dy < inputConvShape[1]; dy++) {
            filteredInput[dy] = [];
            for (let dx = 0; dx < inputConvShape[2]; dx++) {
              const tensor = inputConv.output.arraySync();
              if (is3DTensor(tensor)) {
                if (isNumberParam(tensor[0][dy][dx][c])) {
                  filteredInput[dy][dx] = tensor[0][dy][dx][c];
                }
              }
            }
          }

          drawConvNotation(
            convColourScheme[c],
            700,
            280,
            10, //max layers
            0,
            200 + c * 100,
            0,
            0,
            c,
            outputGroup,
            1000 + batchWindowDelay * 2000,
            [[(poolingConv.output.arraySync() as number[][])[0][c]]],
            true
          );

          inputGroup
            .append("text")
            .attr("x", -65)
            .attr("y", 220 + 40 + c * 100)
            .attr("width", 30)
            .attr("height", 30)
            .attr("id",  `diagramatic-right-bracket`)
            .append("tspan")
            .attr("font-size", 20)
            .attr("class", `font-main`)
            .text(`${poolingFunction}`)
            .append("tspan")
            .attr("font-size", 60)
            .attr("class", "font-main")
            .text("[‎ ‎ ‎‎‎ ‎  ‎‎ ‎ ‎ ]")
            .style("opacity", 1);

          // create group
          drawConvNotation(
            convColourScheme[c],
            700,
            280,
            10, //max layers
            0,
            200 + c * 100,
            0,
            0,
            c,
            inputGroup,
            1000 + batchWindowDelay * 2000,
            filteredInput,
            true
          );

          // add lines
          const p1X = inputGroup.select(`#k-${c}`).attr("x") + 240;
          const p2X = outputGroup.select(`#k-${c}`).attr("x") + 100;
          const pY =
            +inputGroup.select(`#k-${c}`).attr("y") +
            0.5 * +inputGroup.select(`#k-${c}`).attr("height");

          inputGroup
            .append("line")
            .attr("x1", p1X)
            .attr("y1", pY)
            .attr("x2", p2X)
            .attr("y2", pY)
            .attr("stroke", convColourScheme[c])
            .attr("stroke-width", 2)
            .attr("opacity", 0.5);
        }

        const inputLabelX =
          parseInt(inputGroup.select(`#k-0`).attr("x")) +
          parseInt(inputGroup.select(`#k-0`).attr("width")) * 0.5;

        inputGroup
          .append("text")
          .attr("x", inputLabelX)
          .attr("y", 500 * 0.05 + 80)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text("Input");

        inputGroup
          .append("text")
          .attr("x", inputLabelX)
          .attr("y", 720)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text(
            `${formatDimsFromTensorShape(
              tensorLayers[layerIndex[1]].output.shape as number[]
            )}`
          );

        const outputLabelX =
          parseInt(outputGroup.select(`#k-0`).attr("x")) +
          parseInt(outputGroup.select(`#k-0`).attr("width")) * 0.5;

        outputGroup
          .append("text")
          .attr("x", outputLabelX)
          .attr("y", 500 * 0.05 + 80)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text("Pooled Output");

        outputGroup
          .append("text")
          .attr("x", outputLabelX)
          .attr("y", 720)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text(
            `${formatDimsFromTensorShape(poolingConv.output.shape as number[])}`
          );
      }
    }
  }, [modalSvgRef.current, poolingType]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 p-4 sm:p-6">
      <div
        className="
          bg-bg rounded-2xl 
          max-w-[80hh] 
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
            {(tensorLayers[layerIndex[0]] as dummyModelDownsample).type}
          </h1>

          {poolingType && !poolingType.includes("Global") && (
            <p className="text-base text-text-muted px-2 pb-5">
              Using a{" "}
              {(tensorLayers[layerIndex[0]] as dummyModelDownsample).filterSize}
              x
              {(tensorLayers[layerIndex[0]] as dummyModelDownsample).filterSize}{" "}
              filter and a stride of{" "}
              {(tensorLayers[layerIndex[0]] as dummyModelDownsample).stride} .
              This scales everything down by a factor of{" "}
              {(tensorLayers[layerIndex[0]] as dummyModelDownsample).stride}!
            </p>
          )}

          {poolingType && poolingType.includes("Global") && (
            <p className="text-base text-text-muted px-2 pb-5">
              The pooling function is applied to each channel to reduce each
              channel to a single value.
            </p>
          )}

          {poolingType && (
            <div
              className={`relative max-h-[${
                poolingType.includes("Global") ? "800px" : "650px"
              }] max-w-[900px] overflow-auto`}
            >
              <MathJax>
                {!poolingType.includes("Global") && (
                  <svg
                    ref={modalSvgRef}
                    className={`w-[900px] h-[650px]`}
                  ></svg>
                )}

                {poolingType.includes("Global") && (
                  <svg
                    ref={modalSvgRef}
                    className={`w-[700px] h-[650px]`}
                  ></svg>
                )}
              </MathJax>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownsampleAnimationModal;
