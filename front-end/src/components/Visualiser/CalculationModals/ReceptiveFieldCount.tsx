import { ConvParams, dummyModelOutputs, Layer } from "@/utils/types";
import { MathJax } from "better-react-mathjax";
import React, { useEffect, useState } from "react";
import { ordinal } from "@/utils/ordinal";
import Modal from "@/components/Modal";

interface Props {
  layers: Layer[];
  tensorLayers: dummyModelOutputs[];
}

/**
 * Displays a live receptive-field size for the current model and,
 * on click, opens a modal with the derivation formula and per-layer breakdown.
 *
 * Only rendered when every non-input layer is a conv or activation layer —
 * pooling or dense layers invalidate the standard RF formula, so the counter
 * is hidden entirely rather than showing a misleading value.
 */
export const ReceptiveFieldCount: React.FC<Props> = ({
  layers,
  tensorLayers,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalParams, setTotalParams] = useState<number>(0);
  const [valid, setValid] = useState<boolean>(true);

  const [showExample, setShowExample] = useState(false);

  const [strides, setStrides] = useState<number[]>([]);
  const [kernelSize, setKernelSize] = useState<number[]>([]);

  useEffect(() => {
    const s = [];
    const k = [];
    setStrides([]);
    setKernelSize([]);

    for (let l = 1; l < layers.length; l++) {
      const layerType = layers[l].type;
      if (!(layerType == "add-conv-layer" || layerType == "add-activation")) {
        setValid(false);
        break;
      } else if (layerType == "add-conv-layer") {
        const convParams = layers[l].params as ConvParams;
        const filterSize = convParams.filterSize;
        const stride = convParams.stride;

        s.push(stride);
        k.push(filterSize);
      }
    }

    if (valid) {
      setTotalParams(0);
      let totalR = 0;
      for (let l = 0; l < k.length; l++) {
        let totalS = 1;
        for (let i = 0; i < l; i++) {
          totalS *= s[i];
        }
        totalR += (k[l] - 1) * totalS;
      }
      totalR += 1;
      setTotalParams(totalR);
      setStrides(s);
      setKernelSize(k);
    }
  }, [layers, tensorLayers]);

  return (
    <>
      {/* Live counter */}
      {valid && (
        <p className="pl-4">
          <span
            className="cursor-pointer text-text hover:text-accent"
            // style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
            onClick={() => setIsModalOpen(true)}
          >
            Receptive field: {totalParams}
          </span>
        </p>
      )}

      {/* Explaination Modal */}
      {isModalOpen && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          className="p-7 w-full max-w-[80vh] md:max-w-7/12 max-h-3/4 text-text overflow-auto"
        >
            <h1 className="text-text text-2xl font-bold pb-3 ">
              The receptive field of a hidden unit
            </h1>
            <MathJax dynamic>
              <p className="pb-2 text-text-muted">
                The receptive field of a convolutional neural network (CNN) is
                the region of the input space that influences a particular
                feature (or hidden unit) in the network. In other words, it is
                the part of the input vector that creates the feature after a
                convolution operation. The receptive field helps us understand
                which parts of the input image affect a given feature at
                different layers of the network.
              </p>

              <p className="pb-2 text-text-muted">
                Understanding the receptive field is important for diagnosing a
                network&apos;s performance. A deep network should be designed so
                that its receptive field covers the entire relevant region of
                the input image, since the network is blind to areas outside of
                it.
              </p>

              <p className="pb-4 text-text-muted">
                As more convolutional layers are added, the receptive field
                grows, allowing deeper layers to capture more global information
                from the input.
              </p>

              <div
                onClick={() => setShowExample((prev) => !prev)}
                className="pb-2 text-sm text-accent hover:underline"
              >
                {showExample ? "Hide example" : "Show example"}
              </div>

              {showExample && (
                <p className="pb-2 text-stroke pl-5 pr-8">
                  For example, consider a first convolutional layer that applies
                  a kernel of size 3 with a stride of 1. Each output feature is
                  computed as a weighted sum of three neighboring input values,
                  so the receptive field has size 3. Now, suppose we add a
                  second convolutional layer with a kernel size of 2 and a
                  stride of 1. Each feature in the second layer depends on two
                  adjacent features from the first layer. Since each of those
                  first-layer features already depends on three input values,
                  and because the stride is 1, their receptive fields overlap.
                  As a result, the receptive field of the second layer becomes
                  size 4 rather than 6, which would occur if there were no
                  overlap (for example, with a stride of 3).
                </p>
              )}

              <p className="font-semibold text-xl pb-1  pt-5">Formula</p>

              <p className="pb-2 text-text-muted">
                To compute the receptive field of a hidden unit, we account for
                the kernel size and stride at each convolutional layer in the
                network. This can be done using a simple recursive formula:
              </p>

              <p className="pl-2 pt-4 text-text-muted ">
                Let <span>{"\\( L \\)"}</span> denote the number of layers
              </p>
              <p className="pl-2 text-text-muted ">
                Let <span>{"\\( s_i \\)"}</span> denote the stride at the{" "}
                <span>{"\\( i^{th} \\)"}</span> layer
              </p>
              <p className="pl-2 text-text-muted ">
                Let <span>{"\\( k_i \\)"}</span> denote the kernel size at the{" "}
                <span>{"\\( i^{th} \\)"}</span> layer
              </p>
              <p className="pl-2 text-text-muted ">
                <span>{"\\( S = (s_1, s_2, ..., s_i) \\)"}</span>
              </p>
              <p className="pl-2 text-text-muted ">
                <span>{"\\( K = (k_1, k_2, ..., k_i) \\)"}</span>
              </p>
              <p className="text-text-muted text-center pt-3 pb-3">
                <span>
                  {
                    "\\( r_0 = \\sum\\limits_{l=1}^L \\left((k_{l} - 1) \\prod\\limits_{i=1}^{l-1} s_i \\right) + 1 \\)"
                  }
                </span>
              </p>

              <p className="pl-2 pt-4 text-text-muted ">
                When{" "}
                <span>{`\\( K = (${
                  kernelSize.length > 0 ? kernelSize : "\\emptyset"
                }) \\)`}</span>{" "}
                and{" "}
                <span>{`\\( S = (${
                  kernelSize.length > 0 ? strides : "\\emptyset"
                }) \\)`}</span>
                , the receptive field is{" "}
                <span>{`\\( r_0 = ${totalParams}\\)`}</span>. This means the{" "}
                {ordinal(kernelSize.length)} convolutional layer uses a   {" "}
                <span>{`\\( ${totalParams}\\times${totalParams}\\)`}</span>  area of the input vector.
              </p>

              <p className="pl-2 pt-4 italic text-sm text-text-muted ">
                Formula the work of{" "}
                <span className="text-stroke">
                  <a href="https://distill.pub/2019/computing-receptive-fields/#solving-receptive-field-region">
                    Araujo et. al.
                  </a>
                </span>
              </p>
            </MathJax>
            <br />

            <div className="flex justify-end mt-8">
              <br />
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-400 text-text-muted hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
        </Modal>
      )}
    </>
  );
};
