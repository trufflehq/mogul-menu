import { React } from "../../deps.ts";
import { File } from "../../types/mod.ts";
export interface DimensionModifiers {
  top: number;
  right: number;
  bottom: number;
  left: number;
  transition: string;
}

interface SnackBar {
  $component: React.ReactNode;
}

export type MenuPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export interface MenuState {
  menuState: string;
  isClaimable: boolean;
  iconImageObj?: File;
  $$additionalButtonRef: React.MutableRefObject<HTMLDivElement> | null;
  dimensions: {
    base: {
      x: number;
      y: number;
    };
    modifiers: DimensionModifiers;
  };
  menuPosition: MenuPosition;
  snackBars: React.ReactNode[];
}

export type OpenMenuAction = {
  type: "@@MENU_DEMENSION_OPEN";
  payload: Record<never, never>;
};

export type CloseMenuAction = {
  type: "@@MENU_DIMENSION_CLOSE";
  payload: Record<never, never>;
};

export type UpdateClaimableStateAction = {
  type: "@@MENU_UPDATE_CLAIMABLE";
  payload: {
    isClaimable: boolean;
  };
};

export type UpdateAdditionalButtonRefAction = {
  type: "@@MENU_ADDITIONAL_BUTTON_REF";
  payload: {
    ref: React.MutableRefObject<HTMLDivElement>;
  };
};

export type EnqueueSnackbarAction = {
  type: "@@MENU_ENQUEUE_SNACKBAR";
  payload: {
    snackbar: React.ReactNode;
  };
};

export type PopSnackbarAction = {
  type: "@@MENU_POP_SNACKBAR";
  payload: Record<never, never>;
};

export type UpdateDimensionsAction = {
  type: "@@MENU_UPDATE_DIMENSIONS";
  payload?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    transition?: string;
  };
};

export type UpdateMenuPosition = {
  type: "@@MENU_UPDATE_POSITION";
  payload?: {
    position: MenuPosition;
  };
};

export type MenuDimensionActions = OpenMenuAction | CloseMenuAction;

export type MenuActions =
  | MenuDimensionActions
  | UpdateClaimableStateAction
  | UpdateAdditionalButtonRefAction
  | UpdateDimensionsAction
  | EnqueueSnackbarAction
  | PopSnackbarAction
  | UpdateMenuPosition;
