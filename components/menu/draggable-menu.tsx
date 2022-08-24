import { classKebab, React } from "../../deps.ts";
import {
  getDimensions,
  getHasNotification,
  getIsOpen,
  getMenuPosition,
  useMenu,
  useTabs,
} from "../../state/mod.ts";
import {
  createMenuClipPath,
  getMenuMousePosition,
  useTranslate,
  useUpdateDraggableMenuPosition,
} from "../../util/mod.ts";
import { DimensionModifiers, Vector } from "../../types/dimensions.types.ts";
import Draggable from "../draggable/draggable.tsx";

export default function DraggableMenu({ children }: { children: React.ReactNode }) {
  const { state: tabsState } = useTabs();
  const { state: menuState, updateMenuPosition, updateDimensions, setIsClosed } = useMenu();
  const hasNotification = getHasNotification(tabsState);
  const isOpen = getIsOpen(menuState);
  const menuPosition = getMenuPosition(menuState);
  const className = `c-browser-extension-menu position-${menuPosition} ${
    classKebab(
      { isOpen, hasNotification },
    )
  }`;

  const onPressedMouseUp = (e: React.MouseEvent) => {
    updateMenuPosition(getMenuMousePosition(e));
    updateDimensions();

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
    >
      <div className={className}>
        <div className="menu">
          {children}
        </div>
      </div>
    </Draggable>
  );
}
