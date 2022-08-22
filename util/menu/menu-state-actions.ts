import { React } from "../../deps.ts";
import {
  CloseMenuAction,
  DimensionModifiers,
  OpenMenuAction,
  UpdateAdditionalButtonRef,
  UpdateClaimableState,
  UpdateDimensions,
} from "./types.ts";

export const setOpen = (): OpenMenuAction => ({
  type: "@@MENU_DEMENSION_OPEN",
  payload: {},
});

export const setClosed = (): CloseMenuAction => ({
  type: "@@MENU_DIMENSION_CLOSE",
  payload: {},
});

export const setIsClaimable = (isClaimable: boolean): UpdateClaimableState => ({
  type: "@@MENU_UPDATE_CLAIMABLE",
  payload: {
    isClaimable,
  },
});

export const setAdditionalButtonRef = (
  ref: React.MutableRefObject<HTMLDivElement>,
): UpdateAdditionalButtonRef => ({
  type: "@@MENU_ADDITIONAL_BUTTON_REF",
  payload: {
    ref,
  },
});

export const updateDimensions = (mods?: Partial<DimensionModifiers>): UpdateDimensions => ({
  type: "@@MENU_UPDATE_DIMENSIONS",
  payload: mods,
});
