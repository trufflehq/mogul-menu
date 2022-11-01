import { jumper } from "../../deps.ts";

import {
  BASE_MENU_STYLES,
  EXPANDED_LANDSCAPE_MENU_STYLES,
  COLLAPSED_PORTRAIT_MENU_STYLES,
  EXPANDED_PORTRAIT_MENU_STYLES,
  MENU_ORIENTATION_STYLESHEET,
} from "./styles.ts";

export function changeFrameOrientation(
  { orientation, isCollapsed }: {
    orientation: "landscape" | "portrait" | undefined;
    isCollapsed: boolean;
  },
) {
  if (!orientation) return;
  jumper.call("platform.log", `changeFrameOrientation ${orientation} ${isCollapsed}`);

  jumper.call("layout.applyLayoutConfigSteps", {
    layoutConfigSteps: orientation === "landscape"
      ? isCollapsed ? COLLAPSED_LANDSCAPE_LAYOUT_CONFIG_STEPS : LANDSCAPE_LAYOUT_CONFIG_STEPS
      : isCollapsed
      ? COLLAPSED_PORTRAIT_LAYOUT_CONFIG_STEPS
      : PORTRAIT_LAYOUT_CONFIG_STEPS,
  });
}

function getMenuStyleSteps(orientation: "landscape" | "portrait", isCollapsed: boolean) {
  return [
    { action: "useSubject" }, // start with our iframe
    {
      action: "setStyle",
      value: orientation === "portrait"
        ? isCollapsed ? COLLAPSED_PORTRAIT_MENU_STYLES : EXPANDED_PORTRAIT_MENU_STYLES
        : isCollapsed
        ? BASE_MENU_STYLES
        : EXPANDED_LANDSCAPE_MENU_STYLES,
    },
    { action: "useDocument", value: "null" },
  ];
}
// need to add collapsed styles and steps

export const PORTRAIT_LAYOUT_CONFIG_STEPS = [
  { action: "scrollToTop", value: null },

  ...getMenuStyleSteps("portrait", false), // add collapsed styles

  { action: "querySelector", value: "body" },
  { action: "addClassNames", value: ["truffle-portrait", "truffle-portrait-open"] },
  {
    action: "removeClassNames",
    value: [
      "truffle-portrait-closed",
      "truffle-landscape-open",
      "truffle-landscape-collapsed",
      "truffle-landscape",
    ],
  },
  {
    action: "setStyleSheet",
    value: {
      id: "menu-orientation-styles",
      css: MENU_ORIENTATION_STYLESHEET,
    },
  },
];

export const COLLAPSED_PORTRAIT_LAYOUT_CONFIG_STEPS = [
  ...getMenuStyleSteps("portrait", true), // add collapsed styles

  { action: "querySelector", value: "body" },
  { action: "addClassNames", value: ["truffle-portrait", "truffle-portrait-closed"] },
  {
    action: "removeClassNames",
    value: [
      "truffle-portrait-open",
      "truffle-landscape-open",
      "truffle-landscape-collapsed",
      "truffle-landscape",
    ],
  },
  {
    action: "setStyleSheet",
    value: {
      id: "menu-orientation-styles",
      css: MENU_ORIENTATION_STYLESHEET,
    },
  },
];

export const COLLAPSED_LANDSCAPE_LAYOUT_CONFIG_STEPS = [
  ...getMenuStyleSteps("landscape", true), // add collapsed styles

  { action: "querySelector", value: "body" },
  { action: "addClassNames", value: ["truffle-landscape", "truffle-landscape-collapsed"] },
  {
    action: "removeClassNames",
    value: [
      "truffle-portrait",
      "truffle-portrait-open",
      "truffle-portrait-closed",
      "truffle-landscape-open",
    ],
  },
  {
    action: "setStyleSheet",
    value: {
      id: "menu-orientation-styles",
      css: MENU_ORIENTATION_STYLESHEET,
    },
  },
];

export const LANDSCAPE_LAYOUT_CONFIG_STEPS = [
  ...getMenuStyleSteps("landscape", false), // add collapsed styles

  { action: "querySelector", value: "body" },
  // TODO cleanup these class names
  { action: "addClassNames", value: ["truffle-landscape", "truffle-landscape-open"] },
  {
    action: "removeClassNames",
    value: [
      "truffle-portrait",
      "truffle-portrait-open",
      "truffle-portrait-closed",
      "truffle-landscape-collapsed",
    ],
  },
  {
    action: "setStyleSheet",
    value: {
      id: "menu-orientation-styles",
      css: MENU_ORIENTATION_STYLESHEET,
    },
  },
];
