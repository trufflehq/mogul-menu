import { MenuStore } from "./types.ts";
import { BASE_MENU_WIDTH, DEFAULT_MENU_ICON_WIDTH } from "./menu-state.tsx";
export function getDimensions(store: MenuStore) {
  return store.dimensions;
}

export function getMenuState(store: MenuStore) {
  return store.menuState;
}

export function getIsOpen(store: MenuStore) {
  return store.menuState === "open";
}

export function getIsClaimable(store: MenuStore) {
  return store.isClaimable;
}

export function getAdditionalButtonsWidth(store: MenuStore) {
  return store.$$additionalButtonRef?.current.offsetWidth;
}

export function getClosedWidth(store: MenuStore) {
  const additionalButtonsWidth = getAdditionalButtonsWidth(store);
  if (additionalButtonsWidth) {
    return 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH + additionalButtonsWidth;
  } else {
    return 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH;
  }
}
