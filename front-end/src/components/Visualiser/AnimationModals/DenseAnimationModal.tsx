import {
  dummyModelDense,
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

const DenseAnimationModal: React.FC<Props> = ({
  tensorLayers,
  layerIndex,
  onClose,
}) => {
  const initialRef = null;
  const modalSvgRef = useRef<SVGSVGElement | null>(initialRef);

  let didInit = false;
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      const root = d3.select(modalSvgRef.current);
      root.selectAll("*").remove();

      const denseTensor = tensorLayers[layerIndex[0]] as dummyModelDense;
      const inputConv = tensorLayers[layerIndex[1]];
     
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
          .attr("y", 500 * 0.05 + 20)
          .attr("text-anchor", "middle")
          .attr("font-size", 12)
          .attr("opacity", 0.8)
          .attr("fill", "#333")
          .text("(before activation is applied)");
        
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
            Flattening: Transitioning from Convolutional to Fully-Connected Layers
          </h1>

          <p className="text-base text-text-muted px-2 pb-5">
            The curves display the weights connecting one neuron from the flattened layer to the dense layer.
          </p>
          <div className="relative max-h-[700px] max-w-[1100px] overflow-auto">
            <MathJax>
              <svg ref={modalSvgRef} className="w-[1100px] h-[650px] "></svg>
            </MathJax>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DenseAnimationModal;
