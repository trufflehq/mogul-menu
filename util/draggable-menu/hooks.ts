import { jumper, useEffect, useRef } from "../../deps.ts";
import { getDimensions, getMenuPosition, MenuPosition, useMenu } from "../../state/mod.ts";
import { DragInfo } from "../../types/mod.ts";
import { getTranslationMods } from "./translation.ts";
import { createMenuIframeStyle } from "./iframe-styles.ts";

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
