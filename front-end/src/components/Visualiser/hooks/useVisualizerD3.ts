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

/** Fixed SVG viewport dimensions shared by every layer group. */
const W = 1183;
const H = 500;

/**
 * Core D3 rendering hook for the visualiser canvas.
 *
 * Runs once per layer addition (keyed on `action` and `layers`). For each new
 * layer it:
 * 1. Computes the x-offset for the new layer group based on its position.
 * 2. Calls the appropriate `draw*` utility to render the layer onto the SVG.
 * 3. Runs the corresponding dummy-model `set*Layer` function to produce the
 *    tensor output used by animation modals.
 * 4. Updates `allowedLayerTypes`, `menuAnnotation`, and `prevLayerDims` so the
 *    UI stays consistent with what can validly follow the layer just added.
 * 5. Registers an `AnimationTrigger` for layers that have an animation modal
 *    (conv+activation, downsample, dense).
 *
 * Activation layers are a special case: they don't create a new `<g>` group —
 * they re-use the existing group of the structural layer they follow and redraw
 * its content with the activated output values.
 *
 * @param layerState  - Full layer state and setters from `useLayerState`.
 * @param modalState  - Modal state from `useModalState`; the effect is gated on
 *                      `allLayerModalsClosed` so it never runs while a config
 *                      modal is open.
 * @param svgRef      - Ref to the root SVG element that contains `.d3-root`.
 */
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
    // Wait until the config modal has been dismissed so the user's choices are
    // committed to `layers` before we attempt to draw.
    if (!action || !allLayerModalsClosed || !started || layers.length === 0) return;

    const svg = d3.select(svgRef.current);
    const root = svg.select<SVGGElement>(".d3-root");

    const latestLayer = layers[layers.length - 1];
    // Each structural layer occupies an equal horizontal slice of the canvas.
    const layerxOffset = (W / MAXLAYERS) * (numLayers - 1);
    // Label x is centred within a single slice.
    const layerLabelx = W / (2 * MAXLAYERS);

    const existingGroup = root.select(`.layer-${Math.min(numLayers, MAXLAYERS) - 1}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let layerGroup: d3.Selection<any, unknown, null, undefined>;
    let layerConnections: LayerConnections | undefined;
    let newTensorLayer: dummyModelOutputs | undefined;

    if (!existingGroup.empty()) {
      // Activation layers don't create a new <g> — they overlay the existing
      // structural-layer group so the activated output replaces the pre-activation one.
      layerGroup = existingGroup;

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
            // Conv animation needs indices for [activation, conv, previous-conv/input].
            // Trigger x-bounds are the right edge of the incoming connection and the
            // left edge of the outgoing connection for this layer group.
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

        // Pooling/upsampling labels sit near the bottom of their group; all
        // other activation labels sit near the top to avoid overlapping the canvas.
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
          // The first conv layer is treated as the input layer — no kernel
          // operation is applied, just raw pixel values are rendered.
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

        // A 1×1 spatial output means global pooling collapsed all spatial info —
        // no further convolutions are meaningful, but a dense head still is.
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

        // First layer has no preceding group to connect to.
        if (newConnections.length > 1) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          drawLayerConnections(root as unknown as d3.Selection<d3.BaseType, unknown, null, undefined>, newConnections);
        }

        // Animation triggers that depend on the new connection's x-coords must
        // be registered here, after `newConnections` is finalised, rather than
        // inside the layer-type branches above where `layerConnections` is set.
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
          // Only register the dense animation trigger when the layer immediately
          // before the dense is a pooling layer, or two layers back is a conv —
          // those are the two topologies the dense animation modal supports.
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
