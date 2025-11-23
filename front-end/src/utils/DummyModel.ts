import * as tf from "@tensorflow/tfjs";
import { convLayerDims, ConvParams, DownsamplingParams } from "./types";

const DATAFORMAT = "channelsLast";

export function setInputLayer(params: convLayerDims): tf.Tensor {
  const inputVector: tf.Tensor =
    params.depth == 0
      ? tf.randomUniform([params.height, params.width, 1, 1], -1, 1)
      : tf.randomUniform([1, params.height, params.width, params.depth], -1, 1);

  return inputVector;
}

export function setConvLayer(
  params: ConvParams,
  prevTensor: tf.Tensor
): tf.Tensor | undefined {
  // var padding: "valid" | "same" = "same"; // might be wrong check
  let output;
  console.log(params);
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
      biasInitializer: 'randomUniform', 
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

export function setDownsamplingLayer(
  params: DownsamplingParams,
  prevLayer: tf.Tensor
): tf.Tensor | undefined {
  console.log(params);

  switch (params.type) {
    case "Average Pooling":
      const averagePooling2DLayer = tf.layers.averagePooling2d({
        dataFormat: DATAFORMAT,
        strides: params.stride,
        poolSize: params.filterSize,
      });

      const avgPoolOutput = averagePooling2DLayer.apply(prevLayer);

      if (avgPoolOutput instanceof tf.Tensor) {
        console.log(prevLayer.shape);
        console.log(avgPoolOutput.shape);
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
        console.log(prevLayer.shape);
        console.log(maxPoolOutput.shape);
        return maxPoolOutput;
      }
    
    case "Global Average Pooling": 
      const globalAvgPoolLayer = tf.layers.globalAveragePooling2d({
        dataFormat: DATAFORMAT, 
      })

      const globalAvgPoolOutput = globalAvgPoolLayer.apply(prevLayer); 

      if (globalAvgPoolOutput instanceof tf.Tensor) {
        console.log(prevLayer.shape);
        console.log(globalAvgPoolOutput.shape);
        return globalAvgPoolOutput;
      }

    case "Global Max Pooling": 
      const globalMaxPoolLayer = tf.layers.globalMaxPool2d({
        dataFormat: DATAFORMAT, 
      })

      const globalMaxPoolOutput = globalMaxPoolLayer.apply(prevLayer); 

      if (globalMaxPoolOutput instanceof tf.Tensor) {
        console.log(prevLayer.shape);
        console.log(globalMaxPoolOutput.shape);
        return globalMaxPoolOutput;
      }

    // const Input = tf.input({ shape: [25,25,5] });
    // const averagePooling2DLayer =
    //     tf.layers.averagePooling2d(
    //         { dataFormat: 'channelsLast',
    //           strides: 1,
    //           poolSize: 2,

    //          }
    //     );
    // const Output = averagePooling2DLayer.apply(Input);

    // const Data = tf.ones([1,25,25,5]);
    // // console.log(prevLayer.arraySync())
    // // console.log(Data.arraySync())
    // // if( Output as tf.Tensor) {
    //   const model =
    //     tf.model({ inputs: Input, outputs: Output as tf.SymbolicTensor});
    //   const o = model.predict(Data) as tf.Tensor ;
    //   console.log(o.shape)
    // }

    //   layer = tf.layers.maxPooling2d({
    //     dataFormat: DATAFORMAT,
    //     strides: 1,
    //     poolSize: 1,
    //     padding: "same",
    //   });
    //   console.log("meow")
    // case "Average Pooling":
    //   layer = tf.layers.averagePooling2d({
    //     dataFormat: DATAFORMAT,
    //     strides: params.stride,
    //     poolSize: params.filterSize,
    //     padding: "valid",
    //   });
    // case "Global Max Pooling":
    //   layer = tf.layers.globalMaxPooling2d({
    //     dataFormat: DATAFORMAT,
    //   });
    // case "Global Average Pooling":
    //   layer = tf.layers.globalAveragePooling2d({
    //     dataFormat: DATAFORMAT,
    //   });
  }

  // output = layer.apply(prevLayer);

  // if (output instanceof tf.Tensor) {
  //   console.log(prevLayer.shape)
  //   console.log(output.shape)
  //   return output;
  // }
}

// export class DummyModel {
//   inputDims!: convLayerDims;
//   inputVector!: tf.Tensor;
//   layers: any[] = [];

//   setInputLayer(params: convLayerDims) {
//     this.inputDims = params;
//     this.inputVector =
//       this.inputDims.depth == 0
//         ? tf.randomUniform(
//             [this.inputDims.height, this.inputDims.width, 1, 1],
//             0,
//             1
//           )
//         : tf.randomUniform(
//             [
//               1,
//               this.inputDims.height,
//               this.inputDims.width,
//               this.inputDims.depth,
//             ],
//             0,
//             1
//           );
//     console.log(this.inputVector.shape);
//     this.layers.push(this.inputVector);
//     console.log(this.layers)
//   }

//   setConvLayer(params: ConvParams) {
//     var padding: "valid" | "same" = "same"; // might be wrong check
//     let output;
//     console.log(params)
//     let layer;
//     if (params.filterSize && params.numFilters && params.stride) {
//       layer = tf.layers.conv2d({
//         filters: params.numFilters,
//         kernelSize: params.filterSize,
//         strides: params.stride,
//         padding: padding,
//         dataFormat: "channelsLast",
//       });
//       console.log(layer);
//       console.log(this.layers)
//       // output = layer.apply(this.layers[0]);

//       // if (output instanceof tf.Tensor) {
//       //   // get conv layer Shape/Dimensions WRITE ASSERTION THIS IS SAME AS PARAMS
//       //   console.log(JSON.stringify(output.shape));
//       //   // this.layers.push(output)
//       //   // print output conv layer values
//       //   // console.log(this.layers)
//       //   // output.print();

//       //   // // print and show kernel values
//       //   // console.log(layer.getWeights()[0].print());

//       //   // // print and show bias value
//       //   // console.log(layer.getWeights()[1].print());
//       // }
//     }
//   }

//   setActivationLayer(params: ActivationType) {}

//   getTensorFromLayer(
//     index: number
//   ):
//     | number
//     | number[]
//     | number[][]
//     | number[][][]
//     | number[][][][]
//     | number[][][][][]
//     | number[][][][][][] {
//     try {
//       const result = this.layers[index].arraySync();
//       return result;
//     } catch (error) {
//       console.error("Error fetching array:", error);
//       throw error;
//     }
//   }

//   //   async getInputArray(): Promise<
//   //     | number
//   //     | number[]
//   //     | number[][]
//   //     | number[][][]
//   //     | number[][][][]
//   //     | number[][][][][]
//   //     | number[][][][][][]
//   //   > {
//   //     try {
//   //       const result = await this.inputVector.array();
//   //       return result;
//   //     } catch (error) {
//   //       console.error("Error fetching array:", error);
//   //       throw error;
//   //     }
//   //   }
// }
