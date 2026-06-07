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
  UpsamplingParams,
} from "./types";

const DATAFORMAT = "channelsLast";

// These models are tiny and untrained, so WebGL buys nothing and makes every
// tensor read-back (arraySync) slow because of GPU texture upload + GPU→CPU sync.
// On the CPU backend the tensors live in JS memory, so read-backs are ~free —
// which matters because the animation hooks read tensors back to arrays heavily.
// Fire-and-forget at module load (client only); the switch resolves long before
// the user can build their first layer.
if (typeof window !== "undefined") {
  void tf.setBackend("cpu");
}

/** Creates a random input tensor with the given spatial dimensions. */
export function setInputLayer(params: convLayerDims): dummyModelInput {
  return {
    kind: "input",
    output: random3DTensor(params.height, params.width, params.depth),
    dims: { height: params.height, width: params.width, depth: params.depth },
  };
}

function random3DTensor(
  height: number,
  width: number,
  depth: number
): tf.Tensor {
  return tf.randomUniform([1, height, width, depth], -1.25, 1.25);
}

/**
 * Applies zero-padding (if any) then a conv2d layer with He-normal initialisation
 * to `prevTensor`, returning the padded input, kernel weights, bias, and output
 * all in one object so animation modals can read them without extra forward passes.
 */
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

  return {
    kind: "conv",
    stride: params.stride,
    filterSize: params.filterSize,
    output: output,
    padSize: params.padding,
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

/**
 * Flattens `prevLayer` if it is not already 1-D, then applies a dense layer.
 * The flatten tensor is stored so the animation modal can visualise the
 * flattening step separately from the fully-connected output.
 */
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
    kind: "dense",
    output: denseOutput,
    flatten: flatten,
    neurons: params,
    weights: dense.getWeights()[0],
    bias: dense.getWeights()[1],
  };

}

/**
 * Applies the chosen activation function element-wise to `prevLayer`.
 * `neurons` / `dims` are passed through so callers that need the original
 * layer shape (e.g. for label text) don't have to look it up separately.
 */
export function setActivationLayer(
  params: ActivationType,
  prevLayer: tf.Tensor,
  neurons?: number,
  dims?: { height: number; width: number; depth: number }
): dummyModelActivation {
  switch (params) {
    case "Sigmoid":
      return {
        kind: "activation",
        output: prevLayer.sigmoid(),
        type: params,
        neurons: neurons,
        dims: dims,
      };

    case "Tanh":
      return {
        kind: "activation",
        output: prevLayer.tanh(),
        type: params,
        neurons: neurons,
        dims: dims,
      };
    case "Leaky ReLU":
      return {
        kind: "activation",
        output: prevLayer.leakyRelu(0.1),
        type: params,
        neurons: neurons,
        dims: dims,
      };

    case "ReLU":
      return {
        kind: "activation",
        output: prevLayer.relu(),
        type: params,
        neurons: neurons,
        dims: dims,
      };
  }
}

/** Upsamples `prevLayer` by `params.scaleFactor` using the chosen interpolation method. */
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
    kind: "upsample",
    output: upsamplingLayerOutput,
    type: params.method,
    scaleFactor: params.scaleFactor,
    dims: params.outputDims,
  };
}

/** Applies the chosen pooling operation (max, average, global max, global average) to `prevLayer`. */
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
        kind: "downsample",
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
        kind: "downsample",
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
        kind: "downsample",
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
        kind: "downsample",
        output: globalMaxPoolOutput,
        type: params.type,
        dims: params.outputDims,
      };
  }
}
