import { MenuState } from "./types.ts";
import {
  BASE_MENU_HEIGHT,
  BASE_MENU_WIDTH,
  DEFAULT_MENU_ICON_HEIGHT,
  DEFAULT_MENU_ICON_WIDTH,
} from "./menu-state.tsx";
export function getDimensions(store: MenuState) {
  return store.dimensions;
}

export function getMenuState(store: MenuState) {
  return store.menuState;
}

export function getIsOpen(store: MenuState) {
  return store.menuState === "open";
}

export function getIsClaimable(store: MenuState) {
  return store.isClaimable;
}

export function getAdditionalButtonsWidth(store: MenuState) {
  return store.$$additionalButtonRef?.current.offsetWidth;
}

export function getClosedWidth(store: MenuState) {
  const additionalButtonsWidth = getAdditionalButtonsWidth(store);
  if (additionalButtonsWidth) {
    return 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH + additionalButtonsWidth;
  }

  return 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH;
}

export function getClosedHeight(store: MenuState) {
  const snackBars = getSnackBars(store);

  // TODO fix predictions width
  if (snackBars?.length > 0) {
    return 0 - BASE_MENU_HEIGHT + DEFAULT_MENU_ICON_HEIGHT;
  }

  return 0 - BASE_MENU_HEIGHT + DEFAULT_MENU_ICON_HEIGHT;
}

export function getSnackBars(store: MenuState) {
  return store.snackBars;
}

export function getTopSnackbar(store: MenuState) {
  return store.snackBars?.[0];
}

export function getMenuIconImageObj(store: MenuState) {
  return store.iconImageObj
}