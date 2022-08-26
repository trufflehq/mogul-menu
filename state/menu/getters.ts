import { MenuState } from "./types.ts";
import {
  BASE_MENU_HEIGHT,
  BASE_MENU_WIDTH,
  DEFAULT_MENU_ICON_HEIGHT,
  DEFAULT_MENU_ICON_WIDTH,
} from "./constants.ts";

import { MenuPosition } from "./types.ts";

export function getDimensions(state: MenuState) {
  return state.dimensions;
}

export function getMenuState(state: MenuState) {
  return state.menuState;
}

export function getIsOpen(state: MenuState) {
  return state.menuState === "open";
}

export function getIsClaimable(state: MenuState) {
  return state.isClaimable;
}

export function getAdditionalButtonsWidth(state: MenuState) {
  return state.$$additionalButtonRef?.current.offsetWidth || 0;
}

export function getSnackBars(state: MenuState) {
  return state.snackBars;
}

export function getTopSnackbar(state: MenuState) {
  return state.snackBars?.[0];
}

export function getMenuIconImageObj(state: MenuState) {
  return state.iconImageObj;
}

export function getMenuPosition(state: MenuState) {
  return state.menuPosition;
}

export function getModifiersByPosition(position?: MenuPosition, additionalButtonsWidth = 0) {
  const modifier = position === "bottom-right"
    ? {
      top: 0 - DEFAULT_MENU_ICON_HEIGHT,
      right: 0,
      bottom: 0 - BASE_MENU_HEIGHT,
      left: 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH + additionalButtonsWidth,
    }
    : position === "bottom-left"
    ? {
      top: 0 - DEFAULT_MENU_ICON_HEIGHT,
      right: 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH + additionalButtonsWidth,
      bottom: 0 - BASE_MENU_HEIGHT,
      left: 0,
    }
    : position === "top-right"
    ? {
      top: 0 - BASE_MENU_HEIGHT,
      right: 0,
      bottom: 0 - BASE_MENU_HEIGHT + DEFAULT_MENU_ICON_HEIGHT,
      left: 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH + additionalButtonsWidth,
    }
    : position === "top-left"
    ? {
      top: 0 - BASE_MENU_HEIGHT,
      right: 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH + additionalButtonsWidth,
      bottom: 0 - BASE_MENU_HEIGHT + DEFAULT_MENU_ICON_HEIGHT,
      left: 0,
    }
    : { // default to not show the closed menu if a menuPosition isn't set, this allows us to initialize anywhere without the icon
      // jumping across the screen
      top: 0 - BASE_MENU_HEIGHT,
      right: 0 - BASE_MENU_WIDTH,
      bottom: 0 - BASE_MENU_HEIGHT,
      left: 0,
    };

  return modifier;
}
export function getClosedModifiers(state: MenuState) {
  const position = getMenuPosition(state);
  const additionalButtonsWidth = getAdditionalButtonsWidth(state);
  return getModifiersByPosition(position, additionalButtonsWidth);
}

export function getOpenModifiers(state: MenuState) {
  const position = getMenuPosition(state);
  const prefix = getPositionPrefix(position);
  return prefix === "bottom"
    ? {
      top: 0 - BASE_MENU_HEIGHT,
      right: 0,
      bottom: 0 - BASE_MENU_HEIGHT,
      left: 0,
    }
    : {
      top: 0 - BASE_MENU_HEIGHT,
      right: 0,
      bottom: 0,
      left: 0,
    };
}

export function getPositionPrefix(position?: MenuPosition) {
  return position?.slice(0, position?.indexOf("-"));
}

export function getPositionSuffix(position?: MenuPosition) {
  return position?.slice(position?.indexOf("-") + 1);
}
