import { jumper, useEffect, useRef } from "../../deps.ts";
import { getDimensions, getMenuPosition, MenuPosition, useMenu } from "../../state/mod.ts";
import { DragInfo } from "../../types/mod.ts";
import { getTranslationMods } from "./translation.ts";
import { createMenuIframeStyle } from "./iframe-styles.ts";

/**
 * This hook is used to translate the position of the child element inside
 * the draggable component based on the menu position. This allows us to reposition the child element
 * alongside the clip-path when the menu is dragged to a different quadrant with a different orientation.
 *
 * @param updateDragInfo fn to update the dragInfo position state inside the Draggable component
 */
export function useTranslate(updateDragInfo: (x: number, y: number) => void) {
  const lastPositionRef = useRef<MenuPosition>(undefined!);
  const { state: menuState, updateDimensions } = useMenu();
  const menuPosition = getMenuPosition(menuState);
  const dimensions = getDimensions(menuState);

  useEffect(() => {
    const lastPosition = lastPositionRef.current;
    if (menuPosition) {
      lastPositionRef.current = menuPosition;

      const { xMod, yMod } = getTranslationMods(lastPosition, menuPosition, dimensions);
      updateDragInfo(xMod, yMod);
      updateDimensions();
    }
  }, [menuPosition]);
}

/**
 * This hook is use to update the parent iframe with the updated coordinates/clip path
 * based on where the draggable component is dragged to.
 *
 * @param dragInfo draggable component state
 */
export function useUpdateDraggableMenuPosition(dragInfo: DragInfo) {
  const { state: menuState } = useMenu();
  const menuPosition = getMenuPosition(menuState);
  const dimensions = getDimensions(menuState);

  useEffect(() => {
    const style = createMenuIframeStyle(dimensions, dragInfo, menuPosition);
    jumper.call("layout.applyLayoutConfigSteps", {
      layoutConfigSteps: [
        { action: "useSubject" }, // start with our iframe
        { action: "setStyle", value: style },
      ],
    });
  }, [dimensions, dragInfo, menuPosition]);
}
