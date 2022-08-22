import { JumperInstance } from "../../deps.ts";
import { ExtensionInfo } from "../../types/mogul-tv.types.ts";

export type MenuStyleStates =
  | "open"
  | "closed-with-claim"
  | "closed-with-snackbar"
  | "closed-with-tooltip"
  | "closed";

const BASE_IFRAME_STYLES = {
  height: "600px",
  width: "640px",
  background: "transparent",
  "z-index": 2000,
  position: "absolute",
  overflow: "hidden",
  transition: "clip-path .5s cubic-bezier(.4,.71,.18,.99)",
};

const BASE_IFRAME_STYLES_IN_VIDEO = {
  ...BASE_IFRAME_STYLES,
  right: "20px",
  top: "50px",
  "max-height": "calc(100% - 50px)",
};

export function setMenuStyles({
  state,
  jumper,
}: {
  jumper: JumperInstance;
  state: MenuStyleStates;
  extensionInfo: ExtensionInfo;
}) {
  const style = getIframeStyles({
    state,
  });

  jumper.call("layout.applyLayoutConfigSteps", {
    layoutConfigSteps: [
      { action: "useSubject" }, // start with our iframe
      { action: "setStyle", value: style },
    ],
  });
  // DEPRECATED: applyLayoutConfigSteps replaces in 3.1.0. can rm in late 2022
  jumper.call("dom.setStyle", {
    querySelector: "#spore-chrome-extension-menu",
    style: Object.entries(style)
      .map(([k, v]) => `${k}:${v}`)
      .join(";"),
  });
}

export function getIframeStyles({
  state = "open",
}: {
  state: MenuStyleStates;
}) {
  const baseStyles = BASE_IFRAME_STYLES_IN_VIDEO;
  if (state === "open") {
    const stateStyles = { "clip-path": "inset(0% 0% 0% 0%)" };
    return { ...baseStyles, ...stateStyles };
  }

  const closedStates = {
    "closed-with-claim": { width: "calc(100% - 88px)", heightPx: 55 },
    "closed-with-snackbar": { width: "calc(0% + 120px", heightPx: 100 },
    "closed-with-tooltip": { width: "calc(0% + 100px", heightPx: 200 },
    closed: { width: "calc(100% - 50px)", heightPx: 55 },
  };

  const { width, heightPx } = closedStates[state] || closedStates.closed;

  const stateStyles = { "clip-path": `inset(0% 0% calc(100% - ${heightPx}px) ${width})` };

  return {
    ...baseStyles,
    ...stateStyles,
  };
}

/**
 * Get the position state of the menu
 */
// export function getMenuState({
//   isOpen,
//   isClaimable,
//   snackBarQueue,
//   shouldShowOnboardTooltip,
// }: {
//   isOpen: boolean;
//   isClaimable: boolean;
//   snackBarQueue?: React.ReactNode[];
//   shouldShowOnboardTooltip: boolean;
// }) {
//   if (isOpen) {
//     return "open";
//   } else if (shouldShowOnboardTooltip) {
//     return "closed-with-tooltip";
//   } else if (snackBarQueue && snackBarQueue?.length > 0) {
//     return "closed-with-snackbar";
//   } else if (isClaimable) {
//     return "closed-with-claim";
//   } else {
//     return "closed";
//   }
// }
