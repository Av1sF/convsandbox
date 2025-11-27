import * as tf from "@tensorflow/tfjs";
import {
  ActivationType,
  convLayerDims,
  ConvParams,
  DownsamplingParams,
  UpsamplingParams,
} from "./types";

const DATAFORMAT = "channelsLast";

export function setInputLayer(params: convLayerDims): tf.Tensor {
  const inputVector: tf.Tensor =
    params.depth == 0
      ? tf.randomUniform([params.height, params.width, 1, 1], 0, 1)
      : tf.randomUniform([1, params.height, params.width, params.depth], 0, 1);

  return inputVector;
}

export function setConvLayer(
  params: ConvParams,
  prevTensor: tf.Tensor
): tf.Tensor | undefined {
  let output;
  let layer;
  let padding = undefined;
  if (params.filterSize && params.numFilters && params.stride) {
    if (params.padding && params.padding > 0) {
      padding = tf.layers.zeroPadding2d({
        padding: params.padding,
      });

      output = padding.apply(prevTensor);
    }

    layer = tf.layers.conv2d({
      filters: params.numFilters,
      kernelSize: params.filterSize,
      strides: params.stride,
      padding: "valid",
      dataFormat: DATAFORMAT,
      biasInitializer: "randomNormal",
      kernelInitializer: "randomNormal",
    });
    output = layer.apply(padding ? padding.apply(prevTensor) : prevTensor);

    if (output instanceof tf.Tensor) {
      //   // get conv layer Shape/Dimensions WRITE ASSERTION THIS IS SAME AS PARAMS
      // console.log(JSON.stringify(output.shape));
      //   // this.layers.push(output)
      //   // print output conv layer values
      //   // console.log(this.layers)
      //   // output.print();

      //   // // print and show kernel values
      //   // console.log(layer.getWeights()[0].print());

      //   // // print and show bias value
      //   // console.log(layer.getWeights()[1].print());
      // }
      //     }
      return output;
    }
  }
}

export function setDenseLayer(
  params: number,
  prevLayer: tf.Tensor
): tf.Tensor | undefined {
  if (prevLayer as tf.Tensor) {
    const flatten =
      prevLayer.shape.length == 2
        ? prevLayer
        : tf.layers.flatten().apply(prevLayer);
    const dense = tf.layers.dense({
      units: params,
      biasInitializer: "randomNormal",
      kernelInitializer: "randomNormal",
    });

    const denseOutput = dense.apply(flatten);

    if (denseOutput instanceof tf.Tensor) {
      // console.log(denseOutput.arraySync())
      // console.log(dense.getWeights()[0].print());
      return denseOutput;
    }
  }

  // if prev is convLayerdims => flatten
  // else chain the dense layers
}

export function setActivationLayer(
  params: ActivationType,
  prevLayer: tf.Tensor
): tf.Tensor | undefined {
  // tanh sigmoid relu leakyrelu
  switch (params) {
    case "Sigmoid":
      return prevLayer.logSigmoid();

    case "Tanh":
      return prevLayer.tanh();

    case "Leaky ReLU":
      return prevLayer.leakyRelu(0.1);

    case "ReLU":
      return prevLayer.relu();
  }
}

export function setUpsamplingLayer(
  params: UpsamplingParams,
  prevLayer: tf.Tensor
): tf.Tensor | undefined {
  // param have upsampling and method
  const upsamplingLayer = tf.layers.upSampling2d({
    dataFormat: DATAFORMAT,
    size: [params.scaleFactor, params.scaleFactor],
    interpolation: params.method == "Nearest Neighbor" ? "nearest" : "bilinear",
  });

  const upsamplingLayerOutput = upsamplingLayer.apply(prevLayer);

  if (upsamplingLayerOutput instanceof tf.Tensor) {
    return upsamplingLayerOutput;
  }
}

export function setDownsamplingLayer(
  params: DownsamplingParams,
  prevLayer: tf.Tensor
): tf.Tensor | undefined {
  switch (params.type) {
    case "Average Pooling":
      const averagePooling2DLayer = tf.layers.averagePooling2d({
        dataFormat: DATAFORMAT,
        strides: params.stride,
        poolSize: params.filterSize,
      });

      const avgPoolOutput = averagePooling2DLayer.apply(prevLayer);

      if (avgPoolOutput instanceof tf.Tensor) {
        return avgPoolOutput;
      }

    case "Max Pooling":
      const maxPooling2DLayer = tf.layers.maxPooling2d({
        dataFormat: DATAFORMAT,
        strides: params.stride,
        poolSize: params.filterSize,
      });

      const maxPoolOutput = maxPooling2DLayer.apply(prevLayer);

      if (maxPoolOutput instanceof tf.Tensor) {
        return maxPoolOutput;
      }

    case "Global Average Pooling":
      const globalAvgPoolLayer = tf.layers.globalAveragePooling2d({
        dataFormat: DATAFORMAT,
      });

      const globalAvgPoolOutput = globalAvgPoolLayer.apply(prevLayer);

      if (globalAvgPoolOutput instanceof tf.Tensor) {
        return globalAvgPoolOutput;
      }

    case "Global Max Pooling":
      const globalMaxPoolLayer = tf.layers.globalMaxPool2d({
        dataFormat: DATAFORMAT,
      });

      const globalMaxPoolOutput = globalMaxPoolLayer.apply(prevLayer);

      if (globalMaxPoolOutput instanceof tf.Tensor) {
        return globalMaxPoolOutput;
      }
  }
}
