import { MenuPosition } from "../mod.ts";
import { Dimensions, DragInfo } from "../../draggable/draggable.tsx";
import { createMenuClipPath } from "./clip-path.ts";

/**
 * Returns an object with the CSS styles that will be applied as inline styles to the
 * parent iframe of the extension mapping (or embeddable or whatever)
 */
export function createMenuIframeStyle(
  dimensions: Dimensions,
  dragInfo: DragInfo,
  menuPosition: MenuPosition = "top-right",
) {
  // creates an element that spans the entire screen
  // a clip path is used to crop to only the actual component
  // web draggable
  // const style = {
  //   width: "100vw",
  //   height: "100vh",
  //   "clip-path": createMenuClipPath(
  //     dragInfo.current,
  //     dimensions.base,
  //     dimensions.modifiers,
  //     menuPosition,
  //   ),
  //   transition: dimensions.modifiers.transition,
  //   background: "none",
  //   position: "fixed",
  //   top: "0",
  //   left: "0",
  //   "z-index": "9999",
  // };
  const style = {
    width: "100%",
    height: "100%",
    transition: dimensions.modifiers.transition,
    background: "none",
    border: "none",
    position: "absolute",
    top: "0",
    left: "0",
    "z-index": "9999",
  };
  // remove clip path if mouse is pressed so we get mouse events across the entire page
  if (dragInfo.pressed) style["clip-path"] = "none";
  return style;
}
