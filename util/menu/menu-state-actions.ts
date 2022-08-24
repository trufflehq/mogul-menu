import { React } from "../../deps.ts";
import {
  CloseMenuAction,
  DimensionModifiers,
  EnqueueSnackbarAction,
  MenuPosition,
  OpenMenuAction,
  PopSnackbarAction,
  UpdateAdditionalButtonRefAction,
  UpdateClaimableStateAction,
  UpdateDimensionsAction,
  UpdateMenuPosition,
} from "./types.ts";

export const setOpen = (): OpenMenuAction => ({
  type: "@@MENU_DEMENSION_OPEN",
  payload: {},
});

export const setClosed = (): CloseMenuAction => ({
  type: "@@MENU_DIMENSION_CLOSE",
  payload: {},
});

export const setIsClaimable = (isClaimable: boolean): UpdateClaimableStateAction => ({
  type: "@@MENU_UPDATE_CLAIMABLE",
  payload: {
    isClaimable,
  },
});

export const setAdditionalButtonRef = (
  ref: React.MutableRefObject<HTMLDivElement>,
): UpdateAdditionalButtonRefAction => ({
  type: "@@MENU_ADDITIONAL_BUTTON_REF",
  payload: {
    ref,
  },
});

export const updateDimensions = (mods?: Partial<DimensionModifiers>): UpdateDimensionsAction => ({
  type: "@@MENU_UPDATE_DIMENSIONS",
  payload: mods,
});

export const enqueueSnackBar = (snackbar: React.ReactNode): EnqueueSnackbarAction => ({
  type: "@@MENU_ENQUEUE_SNACKBAR",
  payload: {
    snackbar,
  },
});

export const popSnackBar = (): PopSnackbarAction => ({
  type: "@@MENU_POP_SNACKBAR",
  payload: {},
});

export const updateMenuPosition = (position: MenuPosition): UpdateMenuPosition => ({
  type: "@@MENU_UPDATE_POSITION",
  payload: {
    position,
  },
});
