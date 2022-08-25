import { React, useState } from "../../deps.ts";
import { useUpdateDragPosition } from "../../util/mod.ts";
import { DimensionModifiers, Dimensions, DragInfo, Vector } from "../../types/mod.ts";

export default function Draggable(
  {
    children,
    dimensions,
    defaultPosition,
    createClipPath,
    requiredClassName,
    ignoreClassName,
    onPressedMouseUp,
    onDragStart,
    translateFn,
    updateParentPosition,
  }: {
    children: React.ReactNode;
    createClipPath: (
      position: Vector,
      base: Vector,
      { top, right, bottom, left }: Pick<DimensionModifiers, "top" | "bottom" | "right" | "left">,
    ) => void;
    dimensions: Dimensions;
    defaultPosition: Vector;
    requiredClassName?: string;
    ignoreClassName?: string;
    onPressedMouseUp?: (e: React.MouseEvent) => void;
    onDragStart?: (e: React.MouseEvent) => void;
    translateFn?: (updateDragInfo: (x: number, y: number) => void) => void;
    updateParentPosition?: (dragInfo: DragInfo) => void;
  },
) {
  const [dragInfo, setDragInfo] = useState<DragInfo>(
    {
      current: defaultPosition,
      start: { x: 0, y: 0 },
      pressed: false,
      draggable: true,
    },
  );

  const updateDragPosition = (x: number, y: number) => {
    setDragInfo((old: DragInfo) => (
      {
        ...old,
        current: {
          x: x - old.start.x,
          y: y - old.start.y,
        },
      }
    ));
  };

  const updateDragInfo = (x: number, y: number) => {
    setDragInfo((old: DragInfo) => (
      {
        ...old,
        current: {
          x: old.start.x + x,
          y: old.start.y + y,
        },
      }
    ));
  };

  useUpdateDragPosition(updateDragPosition, dragInfo.pressed);
  translateFn?.(updateDragInfo);
  updateParentPosition?.(dragInfo);

  return (
    //outer div is the full screen div that is cropped with clip path
    <div
      className="draggable"
      draggable={true}
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        background: "none",
        width: "100%",
        height: "100%",
        "clip-path": createClipPath(
          dragInfo.current,
          dimensions.base,
          dimensions.modifiers,
        ),
        overflow: "hidden",
        cursor: dragInfo.pressed ? "grab" : "auto",
        // dragInfo.pressed disables the animation during drag
        transition: dragInfo.pressed ? "none" : dimensions.modifiers.transition,
      }}
      onMouseDown={(e) => {
        const target = e.target as HTMLDivElement;
        const classes = target.className;
        if (!classes || !classes?.includes) return;
        //multiple events are fired for some reason, this ignores all events triggered by a certain classname
        if (!classes || (ignoreClassName && classes?.includes(ignoreClassName))) return;
        // check if requireClassName is set and if it is, only drag if the event target has that name
        if (
          requiredClassName && !classes?.includes(requiredClassName)
        ) {
          setDragInfo((old: DragInfo) => ({ ...old, draggable: false }));
        }
        //prevent dragging by links and prevent-drag tag
        if (
          target.tagName === "A" || classes?.includes("prevent-drag")
        ) {
          setDragInfo((old: DragInfo) => ({ ...old, draggable: false }));
        }
      }}
      onDragStart={(e) => {
        e.preventDefault();
        if (dragInfo.draggable) {
          onDragStart?.(e);
          setDragInfo((old: DragInfo) => ({
            ...old,
            pressed: true,
            start: {
              x: (e.clientX) - old.current.x,
              y: (e.clientY) - old.current.y,
            },
          }));
        }
      }}
      onMouseUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dragInfo.pressed) {
          onPressedMouseUp?.(e);
        }
        setDragInfo((old: DragInfo) => ({
          ...old,
          pressed: false,
          draggable: true,
          start: {
            x: old.current.x,
            y: old.current.y,
          },
        }));
      }}
    >
      <div
        className="childr"
        style={{
          //set position of child container
          background: "none",
          width: "fit-content",
          position: "absolute",
          top: dragInfo.current.y + "px",
          left: dragInfo.current.x + "px",
          //disable text selection while dragging
          "user-select": dragInfo.pressed ? "none" : "inherit",
          "pointer-events": dragInfo.pressed ? "none" : "inherit",
        } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
