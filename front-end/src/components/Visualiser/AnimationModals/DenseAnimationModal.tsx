import {
  dummyModelDense,
  dummyModelDownsample,
  dummyModelOutputs,
  LayerConnections,
  MAXLAYERS,
} from "@/utils/types";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { MathJax } from "better-react-mathjax";
import { drawConvLayer } from "@/utils/drawConvLayer";
import { formatDimsFromTensorShape } from "@/utils/formatDimsFromTensorShape";
import { drawNeurons } from "@/utils/drawNeurons";
import drawLayerConnections from "@/utils/drawLayerConnection";
import { drawFlattenedVector } from "@/utils/drawFlattenVector";

interface Props {
  onClose: () => void;
  layerIndex: number[];
  tensorLayers: dummyModelOutputs[];
}

type VectorType = "1D" | "3D";

function getVectorType(values: number[]): VectorType {
  if (values.length == 2) {
    return "1D"
  }

  if (values.length == 4 && 
    values[0] == 1 &&
    values[1] == 1 &&
    values[2] == 1
  ) {
    return "1D"
  }

  return "3D"
}


const DenseAnimationModal: React.FC<Props> = ({
  tensorLayers,
  layerIndex,
  onClose,
}) => {
  const initialRef = null;
  const modalSvgRef = useRef<SVGSVGElement | null>(initialRef);

  const convColourScheme = d3.schemeObservable10.slice(0, 5);
  // const outputColourScheme = d3.schemeObservable10.slice(5, 11);

  let didInit = false;
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      const root = d3.select(modalSvgRef.current);
      root.selectAll("*").remove();

      const denseTensor = tensorLayers[layerIndex[0]] as dummyModelDense;
      const inputConv = tensorLayers[layerIndex[1]];
      const denseTensorShape = inputConv.output.shape as [
        number, // batch = 1
        number, // neurons num 
      ];

      // Draw Input 
      const inputGroup = root
          .append("g")
          .attr("class", `padded-input`)
          .attr("transform", `translate(100, 0)`);

      console.log(inputConv.output.arraySync())
      
      const inputLines = drawConvLayer(
          550,
          650,
          MAXLAYERS,
          inputGroup,
          inputConv.output.arraySync()
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
          .attr("x", (+inputGroup.select(`#rect-0`).attr("x") + (0.5* +inputGroup.select(`#rect-0`).attr("width"))))
          .attr("y", 600 )
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text(`${formatDimsFromTensorShape(inputConv.output.shape)}`);
      
      // Draw Output (neurons)
        const outputGroup = root
          .append("g")
          .attr("class", `output`)
          .attr("transform", `translate(700, 0)`);

        const outputLines = drawNeurons(
          550,
          650,
          denseTensor.neurons,
          1,
          outputGroup,
          denseTensor.output.arraySync()
        )

        const outputLabelX =
          parseInt(outputGroup.select(`#neuron-0`).attr("cx")) ;

        outputGroup
          .append("text")
          .attr("x", outputLabelX)
          .attr("y", 500 * 0.05)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text("Fully-Connected Output");
        
        outputGroup
          .append("text")
          .attr("x", outputLabelX)
          .attr("y", 600 )
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text(`${denseTensor.neurons} ${denseTensor.neurons == 1 ? "neuron" : "neurons"}`);


      // figure out if input is 2d or 3d...
      // if 2d just draw nn lines between them (biezer curves)
      // if 3d flatten drawing 
      if (inputConv.output.shape.length == 2) {
        if(inputLines) {
          drawLayerConnections(root, [inputLines, outputLines])
          drawLayerConnections(root, [inputLines, outputLines])
        }

        outputGroup
          .append("text")
          .attr("x", -400)
          .attr("y", 500 * 0.25)
          .attr("text-anchor", "left")
          .attr("font-size", 14)
          .attr("opacity", 0.7)
          .attr("fill", "#333")
          .text("As it is already a 1D vector, we can directly use the input for our fully connected layer.");
      } else {
        // draw lines 
        // add that it flattens into a 1D vector 
        // draw one of the weights 

        const flattenGroup = root
          .append("g")
          .attr("class", `flatten`)
          .attr("transform", `translate(525, 0)`);

        const flattenLines = drawFlattenedVector(
          75,
          650,
          MAXLAYERS,
          flattenGroup,
          denseTensor.flatten.arraySync() as number[][]
        )

        const flattenLabelX =
          parseInt(flattenGroup.select(`#rect-0`).attr("x") + (+flattenGroup.select(`#rect-0`).attr("width") * 0.5) ) ;

        flattenGroup
          .append("text")
          .attr("x", flattenLabelX)
          .attr("y", 500 * 0.05)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text("Flatten");

        flattenGroup
          .append("text")
          .attr("x", flattenLabelX)
          .attr("y", 600 )
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text(`${formatDimsFromTensorShape(denseTensor.flatten.shape)}`);

        if (flattenLines && inputLines) {
          const shortFlattenedLines = [[flattenLines[0][0]], [flattenLines[1][0]]] as LayerConnections
  
          drawLayerConnections(root, [inputLines, shortFlattenedLines])
          drawLayerConnections(root, [inputLines, shortFlattenedLines])

          drawLayerConnections(root, [shortFlattenedLines, outputLines])
          drawLayerConnections(root, [shortFlattenedLines, outputLines])
        }

        outputGroup
          .append("text")
          .attr("x", -150)
          .attr("y", 500)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.7)
          .attr("fill", "#333")
          .text("The flatten operation converts and formats the multi-dimensional output from");
        
          outputGroup
          .append("text")
          .attr("x", -150)
          .attr("y", 500 + 16)
          .attr("text-anchor", "middle")
          .attr("font-size", 14)
          .attr("opacity", 0.7)
          .attr("fill", "#333")
          .text("pooling into a 1D vector to be used as an input for the fully connected (dense) layers.");
        
     

      }
      
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
          <h1 className="text-text">
            Transitioning from convolutional to fully-connected components with the flattening operation... 
          </h1>
          <div className="relative max-h-1/3 max-w-[2100px] overflow-auto border border-accent">
            <MathJax>
              <svg ref={modalSvgRef} className="w-[2100px] h-[650px] "></svg>
            </MathJax>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DenseAnimationModal;
