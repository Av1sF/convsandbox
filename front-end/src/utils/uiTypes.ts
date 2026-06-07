import { LayerActionType, validLayerTypes } from "./layerTypes";

export interface LayerSelectionBtnProps {
  onClick: (e: React.MouseEvent) => void;
  x: number;
  y: number;
}

export interface ConvLayerSelectionBtnProps extends LayerSelectionBtnProps {
  /** When `true` the button shows "add input layer" (first layer); otherwise "convolution layer". */
  showLabel: boolean;
}

export interface VisualiserMenuBtnProps {
  // start point
  x: number;
  y: number;
  // max width and height
  height: number;
  width: number;
  onAction: (action: LayerActionType) => void;
  showLabel: boolean;
  validLayerTypes: validLayerTypes;
  annotation?: string;
}
