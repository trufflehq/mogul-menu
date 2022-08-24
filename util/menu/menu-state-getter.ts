import { MenuState } from "./types.ts";
import {
  BASE_MENU_HEIGHT,
  BASE_MENU_WIDTH,
  DEFAULT_MENU_ICON_HEIGHT,
  DEFAULT_MENU_ICON_WIDTH,
} from "./menu-state.tsx";
import { MenuPosition } from "./types.ts";
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
  return store.$$additionalButtonRef?.current.offsetWidth || 0;
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
  const position = getMenuPosition(store);

  if (position === "top-right") {
    // TODO fix predictions width
    if (snackBars?.length > 0) {
      return 0 - BASE_MENU_HEIGHT + DEFAULT_MENU_ICON_HEIGHT;
    }

    return 0 - BASE_MENU_HEIGHT + DEFAULT_MENU_ICON_HEIGHT;
  } else {
    return 0;
  }
}

export function getSnackBars(store: MenuState) {
  return store.snackBars;
}

export function getTopSnackbar(store: MenuState) {
  return store.snackBars?.[0];
}

export function getMenuIconImageObj(store: MenuState) {
  return store.iconImageObj;
}

export function getMenuPosition(store: MenuState) {
  return store.menuPosition;
}

export function getClosedModifiers(store: MenuState) {
  const position = getMenuPosition(store);
  const prefix = getPositionPrefix(position);
  const additionalButtonsWidth = getAdditionalButtonsWidth(store);
  return prefix === "bottom"
    ? {
      top: 0 - DEFAULT_MENU_ICON_HEIGHT,
      right: 0,
      bottom: 0 - BASE_MENU_HEIGHT,
      left: 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH + additionalButtonsWidth,
    }
    : {
      top: 0 - BASE_MENU_HEIGHT,
      right: 0,
      bottom: 0 - BASE_MENU_HEIGHT + DEFAULT_MENU_ICON_HEIGHT,
      left: 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH + additionalButtonsWidth,
    };
}

export function getOpenModifiers(store: MenuState) {
  const position = getMenuPosition(store);
  const prefix = getPositionPrefix(position);
  return prefix === "bottom"
    ? {
      top: 0 - DEFAULT_MENU_ICON_HEIGHT - BASE_MENU_HEIGHT,
      right: 0,
      bottom: 0 - BASE_MENU_HEIGHT * 2,
      left: 0,
    }
    : {
      top: 0 - DEFAULT_MENU_ICON_HEIGHT - BASE_MENU_HEIGHT,
      right: 0,
      bottom: 0 + DEFAULT_MENU_ICON_HEIGHT,
      left: 0,
    };
}

export function getPositionPrefix(position?: MenuPosition) {
  return position?.slice(0, position?.indexOf("-"));
}
