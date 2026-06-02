import { RefObject, useEffect } from "react";
import * as d3 from "d3";
import {
  ActivationType,
  ConvParams,
  convLayerDims,
  denseLayerDims,
  DownsamplingParams,
  dummyModelOutputs,
  LayerConnections,
  MAXLAYERS,
  UpsamplingParams,
} from "@/utils/types";
import {
  isActivationType,
  isConvLayerDims,
  isConvParams,
  isDenseLayerDims,
  isDownsamplingParams,
  isNumberParam,
  isUpsamplingParams,
} from "@/utils/typeGuards";
import { drawStackedConvLayer } from "@/utils/drawStackedConvLayer";
import { drawNeurons } from "@/utils/drawNeurons";
import { addLayerLabel } from "@/utils/addLayerLabel";
import drawLayerConnections from "@/utils/drawLayerConnection";
import { drawClickMe } from "@/utils/drawClickMe";
import {
  setActivationLayer,
  setConvLayer,
  setDenseLayer,
  setDownsamplingLayer,
  setInputLayer,
  setUpsamplingLayer,
} from "@/utils/DummyModel";
import { LayerStateReturn } from "./useLayerState";
import { ModalStateReturn } from "./useModalState";

const W = 1183;
const H = 500;

export function useVisualizerD3(
  layerState: LayerStateReturn,
  modalState: ModalStateReturn,
  svgRef: RefObject<SVGSVGElement>
): void {
  const {
    action,
    setAction,
    started,
    numLayers,
    layers,
    tensorLayers,
    setTensorLayers,
    allLayerConnections,
    setAllLayerConnections,
    prevLayerDims,
    setPrevLayerDims,
    allowedLayerTypes,
    setAllowedLayerTypes,
    setMenuAnnotation,
    activationType,
    upsamplingType,
    downsamplingType,
    setAnimationTriggers,
  } = layerState;

  const { allLayerModalsClosed } = modalState;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!action || !allLayerModalsClosed || !started || layers.length === 0) return;

    const svg = d3.select(svgRef.current);
    const root = svg.select<SVGGElement>(".d3-root");

    const latestLayer = layers[layers.length - 1];
    const layerxOffset = (W / MAXLAYERS) * (numLayers - 1);
    const layerLabelx = W / (2 * MAXLAYERS);

    const existingGroup = root.select(`.layer-${Math.min(numLayers, MAXLAYERS) - 1}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let layerGroup: d3.Selection<any, unknown, null, undefined>;
    let layerConnections: LayerConnections | undefined;
    let newTensorLayer: dummyModelOutputs | undefined;

    if (!existingGroup.empty()) {
      layerGroup = existingGroup;

      // Activation applied to an existing group
      if (
        latestLayer.type === "add-activation" &&
        isActivationType(latestLayer.params) &&
        existingGroup
          .select(`#${(activationType as string).replaceAll(" ", "-")}`)
          .empty()
      ) {
        if (prevLayerDims && isConvLayerDims(prevLayerDims)) {
          newTensorLayer = setActivationLayer(
            latestLayer.params as ActivationType,
            tensorLayers[tensorLayers.length - 1].output,
            undefined,
            { height: prevLayerDims.height, width: prevLayerDims.width, depth: prevLayerDims.depth }
          );

          const updatedTensorLayers = [...tensorLayers, newTensorLayer];

          drawStackedConvLayer(
            W, H,
            prevLayerDims.depth, prevLayerDims.width, prevLayerDims.height,
            MAXLAYERS, layerGroup,
            newTensorLayer.output.arraySync()
          );

          if (layers[layers.length - 2].type === "add-conv-layer") {
            setAnimationTriggers((prev) => [
              ...prev,
              {
                layerNumber: [layers.length - 1, layers.length - 2, layers.length - 3],
                triggerArea: [
                  allLayerConnections[allLayerConnections.length - 2][1][0].x,
                  allLayerConnections[allLayerConnections.length - 1][0][0].x,
                ],
                animationType: "conv",
              },
            ]);

            drawClickMe(
              0.5 * (
                allLayerConnections[allLayerConnections.length - 2][1][0].x +
                allLayerConnections[allLayerConnections.length - 1][0][0].x
              ),
              H / 2,
              svg
            );
          }

          setTensorLayers(updatedTensorLayers);
        } else if (prevLayerDims && isDenseLayerDims(prevLayerDims)) {
          newTensorLayer = setActivationLayer(
            latestLayer.params as ActivationType,
            tensorLayers[tensorLayers.length - 1].output,
            prevLayerDims.neurons
          );

          const updatedTensorLayers = [...tensorLayers, newTensorLayer];

          drawNeurons(
            W, H,
            prevLayerDims.neurons,
            MAXLAYERS, layerGroup,
            newTensorLayer.output.arraySync()
          );

          setTensorLayers(updatedTensorLayers);
        }

        const yText =
          layers[layers.length - 2].type === "add-downsampling" ||
          layers[layers.length - 2].type === "add-upsampling"
            ? 0.81
            : 0.19;

        addLayerLabel(layerLabelx, H * yText, layerGroup, `${activationType}`, 12);

        if (isConvLayerDims(prevLayerDims)) {
          setAllowedLayerTypes({
            ...allowedLayerTypes,
            conv: true,
            activation: false,
            upsample: true,
            downsample: true,
            dense: true,
          });
          setMenuAnnotation(
            "Upsampling restores resolution, pooling downsamples for features, dense layers classify/regress."
          );
        } else if (isDenseLayerDims(prevLayerDims)) {
          setAllowedLayerTypes({
            ...allowedLayerTypes,
            activation: false,
            upsample: false,
            downsample: false,
            dense: true,
            conv: false,
          });
          setMenuAnnotation("");
        }
      }
    } else {
      layerGroup = root
        .append("g")
        .attr("class", `layer-${numLayers - 1}`)
        .attr("transform", `translate(${layerxOffset}, 0)`);

      if (latestLayer.type === "add-conv-layer" && isConvParams(latestLayer.params)) {
        const p = latestLayer.params as ConvParams;

        addLayerLabel(
          layerLabelx, H * 0.15, layerGroup,
          `${layers.length === 1 ? "Input" : "Convolutional Layer"}`
        );
        addLayerLabel(
          layerLabelx, H * 0.85, layerGroup,
          `${p.height} x ${p.width} x ${p.depth}`
        );

        setPrevLayerDims({ width: p.width, height: p.height, depth: p.depth });

        if (numLayers === 1) {
          setAllowedLayerTypes({
            ...allowedLayerTypes,
            conv: true,
            activation: false,
            upsample: true,
            downsample: true,
            dense: false,
          });
          setMenuAnnotation(
            "After input, a convolution is normally applied to extract features from raw pixels. But feel free to experiment!"
          );
          newTensorLayer = setInputLayer(p as convLayerDims);
        } else {
          setAllowedLayerTypes({
            ...allowedLayerTypes,
            conv: false,
            activation: true,
            upsample: false,
            downsample: false,
            dense: false,
          });
          setMenuAnnotation(
            "Applying activations introduces non-linearity; otherwise, the CNN collapses to linear regression."
          );
          newTensorLayer = setConvLayer(p, tensorLayers[tensorLayers.length - 1].output);
        }

        const updatedTensorLayers = [...tensorLayers, newTensorLayer];
        layerConnections = drawStackedConvLayer(
          W, H,
          p.depth, p.width, p.height,
          MAXLAYERS, layerGroup,
          newTensorLayer.output.arraySync()
        );
        setTensorLayers(updatedTensorLayers);

      } else if (
        latestLayer.type === "add-upsampling" &&
        isUpsamplingParams(latestLayer.params) &&
        isConvLayerDims(prevLayerDims)
      ) {
        const p = latestLayer.params as UpsamplingParams;
        newTensorLayer = setUpsamplingLayer(p, tensorLayers[tensorLayers.length - 1].output);
        const updatedTensorLayers = [...tensorLayers, newTensorLayer];

        layerConnections = drawStackedConvLayer(
          W, H,
          p.outputDims.depth, p.outputDims.width, p.outputDims.height,
          MAXLAYERS, layerGroup,
          newTensorLayer.output.arraySync()
        );

        addLayerLabel(layerLabelx, H * 0.15, layerGroup, "Upsampling Layer");
        addLayerLabel(layerLabelx, H * 0.15 + 16, layerGroup, `${upsamplingType}`, 10);
        addLayerLabel(layerLabelx, H * 0.85, layerGroup, `${p.outputDims.height} x ${p.outputDims.width} x ${p.outputDims.depth}`, 14);

        setPrevLayerDims(p.outputDims);
        setAllowedLayerTypes({ conv: true, activation: false, upsample: false, downsample: false, dense: true });
        setMenuAnnotation(
          "Convolution immediately after upsampling fixes blurry or weird pixelated patterns, adjusts channel dimensions for the next layer, and refinement for better feature extraction."
        );
        setTensorLayers(updatedTensorLayers);

      } else if (
        latestLayer.type === "add-downsampling" &&
        isDownsamplingParams(latestLayer.params) &&
        prevLayerDims
      ) {
        const p = latestLayer.params as DownsamplingParams;
        newTensorLayer = setDownsamplingLayer(p, tensorLayers[tensorLayers.length - 1].output);
        const updatedTensorLayers = [...tensorLayers, newTensorLayer];

        layerConnections = drawStackedConvLayer(
          W, H,
          p.outputDims.depth, p.outputDims.width, p.outputDims.height,
          MAXLAYERS, layerGroup,
          newTensorLayer.output.arraySync()
        );

        addLayerLabel(layerLabelx, H * 0.15, layerGroup, "Pooling Layer");
        addLayerLabel(layerLabelx, H * 0.15 + 16, layerGroup, `${downsamplingType}`, 10);
        addLayerLabel(layerLabelx, H * 0.85, layerGroup, `${p.outputDims.height} x ${p.outputDims.width} x ${p.outputDims.depth}`);

        setPrevLayerDims({ width: p.outputDims.width, height: p.outputDims.height, depth: p.outputDims.depth });

        const isGlobal = p.outputDims.width === 1 && p.outputDims.height === 1;
        setAllowedLayerTypes({
          conv: !isGlobal,
          activation: false,
          upsample: false,
          downsample: false,
          dense: true,
        });
        setMenuAnnotation(
          isGlobal
            ? "No further spatial features can be extracted via convolutions at 1×1×n, but a fully connected (dense) layer can still be applied. This is useful for classifcation and regression."
            : "We can add more convolutions for further feature extraction, use dense layers for classification/regression, or output convolutions directly for segmentation, super-resolution, or style transfer."
        );

        setTensorLayers(updatedTensorLayers);

        // Register animation trigger after layerConnections is set below
        // (deferred to after setAllLayerConnections at bottom of effect)

      } else if (
        latestLayer.type === "add-dense-layer" &&
        isNumberParam(latestLayer.params)
      ) {
        const n = latestLayer.params as number;
        newTensorLayer = setDenseLayer(n, tensorLayers[tensorLayers.length - 1].output);
        const updatedTensorLayers = [...tensorLayers, newTensorLayer];

        layerConnections = drawNeurons(
          W, H, n, MAXLAYERS, layerGroup,
          newTensorLayer.output.arraySync()
        );

        const str = n === 1 ? "neuron" : "neurons";
        addLayerLabel(layerLabelx, H * 0.15, layerGroup, "Dense Layer");
        addLayerLabel(layerLabelx, H * 0.85, layerGroup, `${n} ${str}`);

        setAllowedLayerTypes({ conv: false, activation: true, upsample: false, downsample: false, dense: false });
        setMenuAnnotation(
          "Applying activations introduces non-linearity; otherwise, the CNN collapses to linear regression."
        );
        setPrevLayerDims({ neurons: n } as denseLayerDims);

        setTensorLayers(updatedTensorLayers);
      }

      if (layerConnections) {
        const newConnections = [...allLayerConnections, layerConnections];
        setAllLayerConnections(newConnections);

        if (newConnections.length > 1) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          drawLayerConnections(root as unknown as d3.Selection<d3.BaseType, unknown, null, undefined>, newConnections);
        }

        // Register animation triggers that need the final connection x-coords
        if (latestLayer.type === "add-downsampling") {
          const triggerX1 = newConnections[newConnections.length - 2][1][0].x;
          const triggerX2 = layerConnections[0][0].x;
          setAnimationTriggers((prev) => [
            ...prev,
            {
              layerNumber: [layers.length - 1, layers.length - 2],
              triggerArea: [triggerX1, triggerX2],
              animationType: "downsample",
            },
          ]);
          try {
            drawClickMe(((numLayers - 1) / MAXLAYERS) * W, H / 2, svg);
          } catch (_) { /* ignore */ }
        }

        if (latestLayer.type === "add-dense-layer") {
          const prevType = layers[layers.length - 2]?.type;
          const prevPrevType = layers[layers.length - 3]?.type;
          if (prevType === "add-downsampling" || prevPrevType === "add-conv-layer") {
            const triggerX1 = newConnections[newConnections.length - 2][1][0].x;
            const triggerX2 = layerConnections[0][0].x;
            setAnimationTriggers((prev) => [
              ...prev,
              {
                layerNumber:
                  prevType === "add-downsampling"
                    ? [layers.length - 1, layers.length - 2]
                    : [layers.length - 1, layers.length - 3],
                triggerArea: [triggerX1, triggerX2],
                animationType: "dense",
              },
            ]);
            drawClickMe(((numLayers - 1) / MAXLAYERS) * W, H / 2, svg);
          }
        }
      }
    }

    setAction("");
  }, [action, layers, started, allLayerModalsClosed]);
}
