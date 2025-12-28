import { ConvParams, dummyModelOutputs, Layer } from "@/utils/types";
import { MathJax } from "better-react-mathjax";
import React, { useEffect, useState } from "react";
import { dummyModelDense } from "../../../../utils/types";

interface Props {
  layers: Layer[];
  tensorLayers: dummyModelOutputs[];
}

export const ParameterCount: React.FC<Props> = ({ layers, tensorLayers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalParams, setTotalParams] = useState<number>(0);
  const [paramCalculation, setParamCalculation] = useState<
    {
      type: string;
      variables: string;
      calculation: string; // Maxjax?
    }[]
  >([
    {
      type: "Input",
      variables: "",
      calculation: "0",
    },
  ]);

  useEffect(() => {
    setTotalParams(0);
    setParamCalculation([
      {
        type: "Input",
        variables: "",
        calculation: "=0",
      },
    ]);

    var totalp = 0;
    for (let i = 1; i < layers.length; i++) {
      var layerType = layers[i].type;

      if (layerType == "add-conv-layer") {
        var convParams = layers[i].params as ConvParams;

        const filterSize = convParams.filterSize;
        const numFilters = convParams.numFilters;
        const inChannels = convParams.inChannels;

        const convNumParams =
          (filterSize * filterSize * inChannels + 1) * numFilters;
        setParamCalculation((prev) => [
          ...prev,
          {
            type: `Convolutional Layer`,
            variables: `${numFilters} Filters, ${filterSize}×${filterSize} Filter Size and ${inChannels} input channels`,
            calculation: `\\( (${filterSize}\\times ${filterSize} \\times ${inChannels} + 1) \\times ${numFilters} = ${convNumParams}\\)`,
          },
        ]);
        // setTotalParams(totalParams + convNumParams);
        totalp += convNumParams;
      } else if (layerType == "add-dense-layer") {
        // number of output units
        const outputNeurons = layers[i].params as number;

        // number of input units
        var denseTensorLayer = tensorLayers[i] as dummyModelDense;
        const inputNeurons = denseTensorLayer.flatten.shape[1];

        if (inputNeurons) {
          const denseNumParams = outputNeurons * inputNeurons + outputNeurons;
          setParamCalculation((prev) => [
            ...prev,
            {
              type: `Fully-Connected Dense Layer`,
              variables: `${inputNeurons} Inputs and ${outputNeurons} Output Neurons`,
              calculation: `\\( (${inputNeurons} \\times ${outputNeurons}) + ${outputNeurons} = ${denseNumParams}\\)`,
            },
          ]);

          totalp += denseNumParams;
          //   setTotalParams(totalParams + denseNumParams);
        }
      } else if (layerType == "add-downsampling") {
        setParamCalculation((prev) => [
          ...prev,
          {
            type: `Pooling`,
            variables: `No trainable parameters`,
            calculation: `\\( = 0 \\)`,
          },
        ]);
      } else if (layerType == "add-upsampling") {
        setParamCalculation((prev) => [
          ...prev,
          {
            type: `Upsampling`,
            variables: `No trainable parameters`,
            calculation: `\\( = 0 \\)`,
          },
        ]);
      }

      setTotalParams(totalp);
    }
  }, [layers, tensorLayers]);

  return (
    <>
      <span
        className="cursor-pointer text-text hover:text-accent"
        // style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
        onClick={() => setIsModalOpen(true)}
      >
        number of parameters: {totalParams}
      </span>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="bg-bg rounded-2xl p-6 w-full max-w-md">
            <h1 className="text-text">
              Counting the number of trainable Parameters...
            </h1>
            {/* <p> add the shit where it lists the formulas </p> */}
            <MathJax>
              <div>
                {paramCalculation.map((p, i) => (
                  <div key={i} style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "1.1em",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {i + 1}. {p.type}
                    </div>
                    <p>{p.variables}</p>
                    <p>
                      <span>{p.calculation}</span>
                    </p>
                  </div>
                ))}
              </div>
            </MathJax>
            <div className="flex items-end justify-end">
              <button onClick={() => setIsModalOpen(false)} className=" p-3">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
