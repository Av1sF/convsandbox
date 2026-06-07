# <img src="front-end/src/app/icon.svg" height="36" alt="ConvSandbox icon" style="vertical-align:middle"> ConvSandbox

**An interactive 2D Convolutional Neural Network builder and visualiser for higher-education students.**

Build your own mini CNN layer by layer, watch it rendered live on an SVG canvas, and click any layer to open a step-by-step animated walkthrough of the mathematics behind it.

[![Live Demo](https://img.shields.io/badge/Live_Demo-convsandbox.vercel.app-4A90D9?logo=vercel&logoColor=white)](https://convsandbox.vercel.app/)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4-FF6F00?logo=tensorflow&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-7-F9A03C?logo=d3.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

---

## Research context

ConvSandbox is a tool development research project from **King's College London (KCL)**, motivated by a well-documented gap between diagrammatic CNN theory and students' intuitive understanding of how CNN architectures function.

The tool was designed in direct response to challenges identified through KCL Informatics student surveys and lecturer input, and adopts a **play-based learning** approach - letting students construct, explore, and experiment rather than read. TensorFlow.js runs a real untrained model in the background so all animations reflect genuine weight and activation values.

> *Keywords: Convolutional Neural Networks · Deep Learning · Interactive Visualisation · Web-based Learning Tools*

---

## What is it?

ConvSandbox lets you construct a 2D CNN from scratch in the browser. Because the model is untrained, all weights and inputs are randomly initialised - the goal is not training but **understanding**: each layer type has an animation modal that walks through the underlying operation with live tensor values and MathJax-rendered formulas.

### Layer types

| Layer | What it does |
|---|---|
| **Convolutional** | Applies learnable filters with configurable kernel size, stride, and padding |
| **Activation** | Applies ReLU, Leaky ReLU, Sigmoid, or Tanh element-wise |
| **Pooling** | Max, Average, Global Max, or Global Average pooling |
| **Upsampling** | Nearest-neighbour or bilinear interpolation at a chosen scale factor |
| **Dense** | Fully-connected layer (with automatic flatten if the input is not 1-D) |

### Features

- **Live canvas** — each layer is drawn as a stacked depth-slice visualisation using D3; bezier curves animate in between layers
- **Animation modals** — click any conv, pooling, or dense layer region to open a modal that plays through the sliding-window operation with real weight and activation values
- **Parameter counter** — click to see a per-layer breakdown with the exact formula used
- **Receptive field counter** — live calculation shown whenever the model contains only conv/activation layers, with a full derivation on click
- **Reset** — clears the canvas and starts over with a new random seed

---

## Tech stack

| | |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4 |
| Tensor ops | [TensorFlow.js 4](https://www.tensorflow.org/js) — CPU backend (avoids GPU→CPU read-back overhead during animation) |
| Canvas | [D3 v7](https://d3js.org) |
| Math rendering | [better-react-mathjax](https://github.com/fast-reflexes/better-react-mathjax) |
| Language | TypeScript 5 |

---

## Getting started

```bash
cd front-end
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

---

## Project structure

```
front-end/src/
├── app/                        # Next.js App Router entry
├── components/
│   └── Visualiser/
│       ├── Visualiser.tsx          # Root component — composes all hooks and modals
│       ├── VisualiserCanvas.tsx
│       ├── AnimationModals/        # Step-by-step layer animation modals
│       ├── CalculationModals/      # Parameter count & receptive field modals
│       ├── LayerModals/            # Layer configuration forms
│       ├── LayersMenu/             # SVG pill buttons for the add-layer menu
│       └── hooks/
│           ├── useLayerState.ts    # Layer state orcastrator 
│           ├── useModalState.ts    # Open/closed state for all modals
│           ├── useLayerHandlers.ts # Event callbacks
│           └── useVisualizerD3.ts  # Imperative D3 rendering (side-effect)
├── hooks/
│   └── useElementSize.ts
└── utils/
    ├── DummyModel.ts           # TensorFlow.js layer constructors
    ├── draw*.ts                # D3 drawing utilities (one per visual element)
    ├── types.ts                # Barrel re-export
    ├── constants.ts, layerTypes.ts, tensorTypes.ts, uiTypes.ts
    └── ...
```

---

## Contact

Questions or feedback? Reach out at **avis.cl.fung@kcl.ac.uk**
