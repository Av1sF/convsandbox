import { ConvParams, dummyModelOutputs, Layer } from "@/utils/types";
import { MathJax } from "better-react-mathjax";
import React, { useEffect, useState } from "react";
import { dummyModelDense } from "../../../utils/types";

interface Props {
  layers: Layer[];
  tensorLayers: dummyModelOutputs[];
}

export const ReceptiveFieldCount: React.FC<Props> = ({
  layers,
  tensorLayers,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalParams, setTotalParams] = useState<number>(0);
  const [paramCalculation, setParamCalculation] = useState<
    {
      type: string;
      variables: string;
      calculation: string;
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
        variables: "No trainable parameters.",
        calculation: "\\( = 0 \\)",
      },
    ]);

    let valid = true;
    let strides = [];
    let kernelSize = [];

    for (let l = 1; l < layers.length; l++) {
      const layerType = layers[l].type;
      if (layerType != "add-conv-layer" && layerType != "add-activation") {
        valid = false;
        break;
      } else if (layerType == "add-conv-layer") {
        const convParams = layers[l].params as ConvParams;
        const filterSize = convParams.filterSize;
        const stride = convParams.stride;

        strides.push(stride);
        kernelSize.push(filterSize);
      }
    }

    if (valid) {
      let totalR = 0; 
      // let totalS = 0;
      console.log("kernelsizes", kernelSize)
      console.log("strides", strides)
      for (let l = 0; l < kernelSize.length; l++) {
        let totalS = 1;
        for (let i = 0; i < l; i++) {
          totalS *= strides[i]
          console.log("meow", i)
        }
        totalR += (kernelSize[l]-1)*totalS 
      }
      totalR += 1 

      console.log("receptive field = " , totalR)
    }
    //  let totalr = 1;
    //  let totals = 1;
    // for (let l = 1; l < layers.length; l++) {
    //    const layerType = layers[l].type;

    //   if (layerType == "add-conv-layer") {
    //      const convParams = layers[l].params as ConvParams;

    //     const filterSize = convParams.filterSize;
    //     const stride = convParams.stride;

    //     for (let i = 1; i < l; i++) {
    //       totals = totals *
    //     }

    //     break;
    //   }
    //   setTotalParams(totalr);
    // }
  }, [layers, tensorLayers]);

  return (
    <>
      <p className="pl-4">
        <span
          className="cursor-pointer text-text hover:text-accent"
          // style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
          onClick={() => setIsModalOpen(true)}
        >
          Receptive Field: {totalParams}
        </span>
      </p>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-text-muted/40 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="bg-bg rounded-2xl p-7 w-full max-w-[80vh] md:max-w-7/12 max-h-3/4 text-text overflow-auto">
            <h1 className="text-text text-2xl font-bold pb-3 ">
              Calculating the number of trainable Parameters...
            </h1>
            <MathJax>
              <p className="pb-2 text-text-muted">
                To calculate the total number of trainable parameters in a 2D
                Convolutional Neural Network, only the convolutional and
                fully-connected dense layers need to be considered, as they are
                the only operations containing trainable weights and parameters.
              </p>
              <p className="font-semibold text-xl pb-1">Parameter formulas:</p>

              <div className="indent-2 pb-3">
                <span className="font-semibold">
                  Fully-connected (Dense) Layer
                </span>
                <ul className="list-inside indent-6 pb-1 text-text-muted">
                  <li>• Number of Input neurons ({`\\(I\\)`})</li>
                  <li>• Number of Output neurons ({`\\(C_{in} \\)`})</li>
                  <li>• Number of Filters (Output Channels) ({`\\(O \\)`})</li>
                </ul>
                <p className=" indent-4 pb-2 text-text-muted">
                  If the previous layer is a 3D layer, then a flatten operation
                  is applied. Hence, the number of input neurons will be{" "}
                  <span>{`\\(H \\times W \\times D\\)`}</span>.
                </p>
                <p className=" indent-4 text-black">
                  <span>{`\\( Parameters = (I \\times O) + O\\)`}</span>
                </p>
              </div>

              <div className="indent-2 pb-2 ">
                <span className="font-semibold">Convolutional Layer</span>
                <ul className="list-inside indent-6 pb-2 text-text-muted">
                  <li>• Filter Size ({`\\(k \\)`})</li>
                  <li>
                    • Number of Input Channels (Depth of previous layer) (
                    {`\\(C_{in} \\)`})
                  </li>
                  <li>
                    • Number of Filters (Output Channels) ({`\\(C_{out} \\)`})
                  </li>
                  <li>• Bias (1 Bias per Filter)</li>
                </ul>

                <p className=" indent-4 text-black">
                  <span>{`\\( Parameters = (k \\times k \\times C_{in} + 1) \\times C_{out}\\)`}</span>
                </p>
              </div>
            </MathJax>
            <br />

            <p className="font-semibold text-xl pb-1">
              Traininable parameters for each layer...
            </p>
            <MathJax>
              <div>
                {paramCalculation.map((p, i) => (
                  <div key={i} className="pb-2 indent-6">
                    <div className="font-bold">
                      {i + 1}. {p.type}
                    </div>

                    <div className="indent-11 text-text-muted">
                      <p>{p.variables}</p>
                      <p className="text-black">
                        <span>{p.calculation}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </MathJax>
            <div className="flex justify-end mt-8">
              <br />
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-400 text-text-muted hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
