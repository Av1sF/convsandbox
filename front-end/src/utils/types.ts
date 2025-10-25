export type validLayerTypes = {
  conv: boolean;
  activation: boolean;
  upsample : boolean;
};

export type LayerDims = {
  width: number;
  height: number;
  depth: number;
  type?: string;
};

export interface LayerSelectionBtnProps {
  onClick: (e: React.MouseEvent) => void;
  x: number;
  y: number;
}

export interface ConvLayerSelectionBtnProps extends LayerSelectionBtnProps {
  showLabel: boolean;
}

export interface VisualiserMenuBtnProps {
  // start point
    x: number;
    y: number;
    // max width and height
    height: number;
    width: number;
    onAction: (action: layerActionType) => void;
    showLabel: boolean;
    validLayerTypes: validLayerTypes;
}

export interface ConvParams {
  width: number;
  height: number;
  depth: number;
  stride?: number;
  numFilters?: number;
  padding?: number;
  filterSize?: number;
}

export type ActivationType = "Tanh" | "Sigmoid" | "ReLU" | "Leaky ReLU";

export type layerActionType = "add-conv-layer"  | "add-activation" | "add-upsampling" | "";
