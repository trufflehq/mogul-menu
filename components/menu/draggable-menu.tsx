import { classKebab, jumper, React, useCallback } from "../../deps.ts";
import {
  getDimensions,
  getHasNotification,
  getIsOpen,
  getMenuPosition,
  getModifiersByPosition,
  updateDimensions as updateDimensionsAction,
  updateMenuPosition as updateMenuPositionAction,
  useMenu,
  useTabs,
} from "../../state/mod.ts";
import {
  createMenuClipPath,
  getMenuMousePosition,
  persistMenuPosition,
  useTranslate,
  useUpdateDraggableMenuPosition,
} from "../../util/mod.ts";
import { DimensionModifiers, DragInfo, Vector } from "../../types/dimensions.types.ts";
import Draggable from "../draggable/draggable.tsx";

export default function DraggableMenu({ children }: { children: React.ReactNode }) {
  const { state: tabsState } = useTabs();
  const { state: menuState, dispatch, updateMenuPosition, updateDimensions, setIsClosed } =
    useMenu();
  const hasNotification = getHasNotification(tabsState);
  const isOpen = getIsOpen(menuState);
  const menuPosition = getMenuPosition(menuState);
  const className = `c-browser-extension-menu position-${menuPosition} ${
    classKebab(
      { isOpen, hasNotification },
    )
  }`;

  const initializePosition = (setInitialPosition: (current: Vector, start: Vector) => void) => {
    const fetchPosition = async () => {
      const positionFromStorage = await jumper?.call("storage.get", { key: "mogul-menu:position" });
      console.log("positionFromStorage", positionFromStorage);
      const position = JSON.parse(positionFromStorage || "{}");
      const current = position?.current;
      const start = position?.start;

      if (position?.menuPosition) {
        dispatch(updateMenuPositionAction(position.menuPosition));
      } else {
        // initialize to the top left
        dispatch(updateMenuPositionAction("top-left"));
        dispatch(updateDimensionsAction(getModifiersByPosition("top-left")));
      }

      if (current && start) {
        console.log("has pos", current, start);
        setInitialPosition(current, start);
      }
    };
    fetchPosition();
  };

  const onPressedMouseUp = (e: React.MouseEvent, dragInfo: DragInfo) => {
    updateMenuPosition(getMenuMousePosition(e));
    updateDimensions();

    const menuPosition = getMenuMousePosition(e);
    console.log("mouse up set", dragInfo.current, dragInfo.y);

    persistMenuPosition(menuPosition, {
      x: dragInfo.current.x,
      y: dragInfo.current.y,
    }, {
      x: dragInfo.start.x,
      y: dragInfo.start.y,
    });

    // re-enable the transition
    setTimeout(() => {
      updateDimensions({
        transition: ".25s cubic-bezier(.4, .71, .18, .99)",
      });
    }, 100);
  };

  const onDragStart = () => {
    setIsClosed();
    updateDimensions({
      transition: "none",
    });
  };

  const createClipPath = (
    position: Vector,
    base: Vector,
    { top, right, bottom, left }: Pick<DimensionModifiers, "top" | "bottom" | "right" | "left">,
  ) => {
    return createMenuClipPath(position, base, { top, right, bottom, left }, menuPosition);
  };

  const dimensions = getDimensions(menuState);
  const defaultPosition = { x: 0, y: 0 };
  // const defaultPosition = { x: 623, y: 326 };

  return (
    <Draggable
      requiredClassName="extension-icon"
      ignoreClassName="c-browser-extension-menu"
      dimensions={dimensions}
      defaultPosition={defaultPosition}
      onPressedMouseUp={onPressedMouseUp}
      onDragStart={onDragStart}
      translateFn={useTranslate}
      updateParentPosition={useUpdateDraggableMenuPosition}
      createClipPath={createClipPath}
      initializePosition={initializePosition}
    >
      <div className={className}>
        <div className="menu">
          {children}
        </div>
      </div>
    </Draggable>
  );
}
