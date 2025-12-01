import * as tf from "@tensorflow/tfjs";
import {
  ActivationType,
  convLayerDims,
  ConvParams,
  DownsamplingParams,
  dummyModelActivation,
  dummyModelConv,
  dummyModelDense,
  dummyModelDownsample,
  dummyModelInput,
  dummyModelUpsample,
  MAX_HEIGHT,
  MAX_WIDTH,
  UpsamplingParams,
} from "./types";

const DATAFORMAT = "channelsLast";

export function setInputLayer(params: convLayerDims): dummyModelInput {
  return {
    output: random3DTensor(params.height, params.width, params.depth),
    dims: { height: params.height, width: params.width, depth: params.depth },
  };
}

function random3DTensor(
  height: number,
  width: number,
  depth: number
): tf.Tensor {
  return tf.randomUniform([1, height, width, depth], -100, 100);
}

function random2DTensor(neurons: number): tf.Tensor {
  return tf.randomUniform([1, neurons], -100, 100);
}

export function setConvLayer(
  params: ConvParams,
  prevTensor: tf.Tensor
): dummyModelConv {
  let padded = prevTensor;

  if (params.padding && params.padding > 0) {
    const paddingLayer = tf.layers.zeroPadding2d({
      padding: params.padding,
    });
    padded = paddingLayer.apply(prevTensor) as tf.Tensor;
  }

  const conv = tf.layers.conv2d({
    filters: params.numFilters,
    kernelSize: params.filterSize,
    strides: params.stride,
    padding: "valid",
    dataFormat: DATAFORMAT,
    biasInitializer: "heNormal",
    kernelInitializer: "heNormal",
  });

  const output = conv.apply(padded) as tf.Tensor;
  //   // get conv layer Shape/Dimensions WRITE ASSERTION THIS IS SAME AS PARAMS
  // console.log(JSON.stringify(output.shape));
  //   // this.layers.push(output)
  //   // print output conv layer values
  //   // console.log(this.layers)
  //   // output.print();

  //   // // print and show kernel values
  console.log(conv.getWeights()[0].print());

  //   // // print and show bias value
  console.log(conv.getWeights()[1].print());
  // }
  //     }

  return {
    output: output,
    padded: padded,
    kernel: conv.getWeights()[0],
    bias: conv.getWeights()[1],
    dims: {
      height: params.height,
      width: params.width,
      depth: params.depth,
    },
  };

  // return output instanceof tf.Tensor ? output : random3DTensor(params.height, params.width, params.depth);
}

export function setDenseLayer(
  params: number,
  prevLayer: tf.Tensor
): dummyModelDense {
  const flatten =
    prevLayer.shape.length == 2
      ? prevLayer
      : (tf.layers.flatten().apply(prevLayer) as tf.Tensor);
  const dense = tf.layers.dense({
    units: params,
    biasInitializer: "heNormal",
    kernelInitializer: "heNormal",
  });
  const denseOutput = dense.apply(flatten) as tf.Tensor;

  return {
    output: denseOutput,
    flatten: flatten,
    neurons: params,
    weights: dense.getWeights()[0],
    bias: dense.getWeights()[1],
  };

  // return denseOutput instanceof tf.Tensor? denseOutput: random2DTensor(params);
  // if (denseOutput instanceof tf.Tensor) {
  //   // console.log(denseOutput.arraySync())
  //   // console.log(dense.getWeights()[0].print());
  //   return denseOutput;
  // }
}

export function setActivationLayer(
  params: ActivationType,
  prevLayer: tf.Tensor,
  neurons?: number,
  dims?: { height: number; width: number; depth: number }
): dummyModelActivation {
  switch (params) {
    case "Sigmoid":
      return {
        output: prevLayer.logSigmoid(),
        type: params,
        neurons: neurons,
        dims: dims,
      };

    case "Tanh":
      return {
        output: prevLayer.tanh(),
        type: params,
        neurons: neurons,
        dims: dims,
      };
    case "Leaky ReLU":
      return {
        output: prevLayer.leakyRelu(0.1),
        type: params,
        neurons: neurons,
        dims: dims,
      };

    case "ReLU":
      return {
        output: prevLayer.relu(),
        type: params,
        neurons: neurons,
        dims: dims,
      };
  }
}

export function setUpsamplingLayer(
  params: UpsamplingParams,
  prevLayer: tf.Tensor
): dummyModelUpsample {
  const upsamplingLayer = tf.layers.upSampling2d({
    dataFormat: DATAFORMAT,
    size: [params.scaleFactor, params.scaleFactor],
    interpolation: params.method == "Nearest Neighbor" ? "nearest" : "bilinear",
  });
  const upsamplingLayerOutput = upsamplingLayer.apply(prevLayer) as tf.Tensor;

  return {
    output: upsamplingLayerOutput,
    type: params.method,
    scaleFactor: params.scaleFactor,
    dims: params.outputDims,
  };
}

export function setDownsamplingLayer(
  params: DownsamplingParams,
  prevLayer: tf.Tensor
): dummyModelDownsample {
  switch (params.type) {
    case "Average Pooling":
      const averagePooling2DLayer = tf.layers.averagePooling2d({
        dataFormat: DATAFORMAT,
        strides: params.stride,
        poolSize: params.filterSize,
      });

      const avgPoolOutput = averagePooling2DLayer.apply(prevLayer) as tf.Tensor;

      return {
        output: avgPoolOutput,
        type: params.type,
        stride: params.stride,
        filterSize: params.filterSize,
        dims: params.outputDims,
      };

    case "Max Pooling":
      const maxPooling2DLayer = tf.layers.maxPooling2d({
        dataFormat: DATAFORMAT,
        strides: params.stride,
        poolSize: params.filterSize,
      });

      const maxPoolOutput = maxPooling2DLayer.apply(prevLayer) as tf.Tensor;

      return {
        output: maxPoolOutput,
        type: params.type,
        stride: params.stride,
        filterSize: params.filterSize,
        dims: params.outputDims,
      };

    case "Global Average Pooling":
      const globalAvgPoolLayer = tf.layers.globalAveragePooling2d({
        dataFormat: DATAFORMAT,
      });

      const globalAvgPoolOutput = globalAvgPoolLayer.apply(
        prevLayer
      ) as tf.Tensor;

      return {
        output: globalAvgPoolOutput,
        type: params.type,
        dims: params.outputDims,
      };

    case "Global Max Pooling":
      const globalMaxPoolLayer = tf.layers.globalMaxPool2d({
        dataFormat: DATAFORMAT,
      });

      const globalMaxPoolOutput = globalMaxPoolLayer.apply(
        prevLayer
      ) as tf.Tensor;

      return {
        output: globalMaxPoolOutput,
        type: params.type,
        dims: params.outputDims,
      };
  }
}
