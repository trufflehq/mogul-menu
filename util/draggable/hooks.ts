import { useEffect } from "../../deps.ts";

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
