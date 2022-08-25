import { jumper, React, useEffect, useRef, useState } from "../../deps.ts";
import {
  getMenuMousePosition,
  getMenuPositionByEl,
  useUpdateDragPosition,
} from "../../util/mod.ts";
import { MenuPosition, updateMenuPosition, useMenu } from "../../state/mod.ts";
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
    translateFn?: (
      updateDragInfo: (x: number, y: number, menuPosition: MenuPosition) => void,
    ) => void;
    updateParentPosition?: (dragInfo: DragInfo) => void;
  },
) {
  const $$draggableRef = useRef<HTMLDivElement>(undefined!);
  const [dragInfo, setDragInfo] = useState<DragInfo>(
    {
      current: defaultPosition,
      start: { x: 0, y: 30 },
      // start: { x: 623, y: 326 },
      pressed: false,
      draggable: true,
    },
  );

  const { dispatch } = useMenu();

  useEffect(() => {
    const fetchPosition = async () => {
      const positionRes = await jumper?.call("storage.get", { key: "mogul-menu:position" });
      console.log("positionRes", positionRes);
      const position = JSON.parse(positionRes || "{}");
      const current = position?.current;
      const start = position?.start;
      console.log("position", position);
      console.log("$$draggableRef", $$draggableRef.current);
      console.log("$$draggableRef rect", $$draggableRef.current.getBoundingClientRect());

      const rect = getMenuPositionByEl($$draggableRef.current);
      console.log("rect", rect);
      if (position?.menuPosition) {
        dispatch(updateMenuPosition(position.menuPosition));
      } else {
        // get the position of the icon

        dispatch(updateMenuPosition("top-right"));
      }

      if (current && start) {
        console.log("has pos", current, start);
        setDragInfo((old: DragInfo) => ({
          ...old,
          current: {
            x: current.x,
            y: current.y,
          },
          start: {
            x: start.x,
            y: start.y,
          },
        }));
      }
    };
    fetchPosition();
  }, []);

  const updateDragPosition = (x: number, y: number) => {
    console.log("updateDragPosition");
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

  const updateDragInfo = (x: number, y: number, menuPosition: MenuPosition) => {
    setDragInfo((old: DragInfo) => {
      console.log("updateDragInfo", menuPosition, x, y, old.current, old.start);

      jumper.call("storage.set", {
        key: "mogul-menu:position",
        value: JSON.stringify({
          menuPosition,
          current: {
            x: dragInfo.current.x + x,
            y: dragInfo.current.y + y,
          },
          start: {
            x: old.start.x,
            y: old.start.y,
          },
        }),
      });
      return {
        ...old,
        current: {
          x: old.current.x + x,
          y: old.current.y + y,
          // x: old.start.x + x,
          // y: old.start.y + y,
        },
      };
    });
  };

  useUpdateDragPosition(updateDragPosition, dragInfo.pressed);
  translateFn?.(updateDragInfo);
  updateParentPosition?.(dragInfo);
  console.log("current", dragInfo.current, dragInfo.start);
  return (
    //outer div is the full screen div that is cropped with clip path
    <div
      className="draggable"
      draggable={true}
      ref={$$draggableRef}
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
          console.log("req classname");
          setDragInfo((old: DragInfo) => ({ ...old, draggable: false }));
        }
        //prevent dragging by links and prevent-drag tag
        if (
          target.tagName === "A" || classes?.includes("prevent-drag")
        ) {
          console.log("prevent drag");
          setDragInfo((old: DragInfo) => ({ ...old, draggable: false }));
        }
      }}
      onDragStart={(e) => {
        e.preventDefault();
        if (dragInfo.draggable) {
          onDragStart?.(e);
          console.log("drag start");
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

          const menuPosition = getMenuMousePosition(e);
          console.log("mouse up set", dragInfo.current, dragInfo.y);
          jumper.call("storage.set", {
            key: "mogul-menu:position",
            value: JSON.stringify({
              menuPosition,
              current: {
                x: dragInfo.current.x,
                y: dragInfo.current.y,
              },
              start: {
                x: dragInfo.start.x,
                y: dragInfo.start.y,
              },
            }),
          });
        }

        console.log("mouse up");
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
