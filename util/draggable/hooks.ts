import { useEffect } from "../../deps.ts";

/**
 * Updates the dragInfo when the mouse is pressed and being dragged
 * 
 * @param updateDragInfo function to update the dragInfo state in the Draggable component
 * @param isPressed whether the mouse is pressed or not
 */
export function useUpdateDragPosition(
  updateDragInfo: (x: number, y: number) => void,
  isPressed: boolean,
) {
  useEffect(() => {
    const handleWindowMouseMove = (event: MouseEvent) => {
      updateDragInfo(event.clientX, event.clientY);
    };
    if (isPressed) {
      window.addEventListener("mousemove", handleWindowMouseMove);
    } else {
      window.removeEventListener("mousemove", handleWindowMouseMove);
    }
    return () => (window.removeEventListener(
      "mousemove",
      handleWindowMouseMove,
    ));
  }, [isPressed]);
}
