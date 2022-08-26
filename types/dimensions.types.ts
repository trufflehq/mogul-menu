export interface Vector {
  x: number;
  y: number;
}

export interface DragInfo {
  current: Vector;
  start: Vector;
  pressed: boolean;
  draggable: boolean;
}

export interface DimensionModifiers {
  top: number;
  right: number;
  bottom: number;
  left: number;
  transition: string;
}

export interface DimensionsBase extends Vector {
  width: number;
  height: number;
}

export interface Dimensions {
  base: DimensionsBase;
  modifiers: DimensionModifiers;
}

export interface TranslationMods {
  xMod: number;
  yMod: number;
}
