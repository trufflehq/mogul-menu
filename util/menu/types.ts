import { React } from "../../deps.ts";

export interface DimensionModifiers {
  top: number;
  right: number;
  bottom: number;
  left: number;
  transition: string;
}

export interface MenuStore {
  menuState: string;
  isClaimable: boolean;
  $$additionalButtonRef: React.MutableRefObject<HTMLDivElement> | null;
  dimensions: {
    base: {
      x: number;
      y: number;
    };
    modifiers: DimensionModifiers;
  };
}

export type OpenMenuAction = {
  type: "@@MENU_DEMENSION_OPEN";
  payload: Record<never, never>;
};

export type CloseMenuAction = {
  type: "@@MENU_DIMENSION_CLOSE";
  payload: Record<never, never>;
};

export type UpdateClaimableState = {
  type: "@@MENU_UPDATE_CLAIMABLE";
  payload: {
    isClaimable: boolean;
  };
};

export type UpdateAdditionalButtonRef = {
  type: "@@MENU_ADDITIONAL_BUTTON_REF";
  payload: {
    ref: React.MutableRefObject<HTMLDivElement>;
  };
};

export type UpdateDimensions = {
  type: "@@MENU_UPDATE_DIMENSIONS";
  payload: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    transition?: string;
  };
};
export type MenuDimensionActions = OpenMenuAction | CloseMenuAction;

export type MenuActions =
  | MenuDimensionActions
  | UpdateClaimableState
  | UpdateAdditionalButtonRef
  | UpdateDimensions;
