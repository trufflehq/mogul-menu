import { jumper, React, useEffect, useRef, useState } from "../../deps.ts";
import { getDimensions, getMenuPosition, MenuPosition, useMenu } from "../../state/mod.ts";
export interface Vector {
  x: number;
  y: number;
}

export interface DragInfo {
  current: Vector;
  start: Vector;
  pressed: boolean;
  draggable: boolean;
}

export interface Modifiers {
  top: number;
  right: number;
  bottom: number;
  left: number;
  transition: string; //css value for the transition property
}

export interface Dimensions {
  base: Vector;
  modifiers: Modifiers;
}

function createClipPath(
  position: Vector,
  base: Vector,
  { top, right, bottom, left }: Pick<Modifiers, "top" | "right" | "bottom" | "left">,
  menuPosition: MenuPosition = "top-right",
) {
  // console.log(JSON.stringify({ positionX: position.x, positionY: position.y, top, right, bottom, left }))

  return menuPosition === "top-right" || menuPosition === "top-left"
    ? `inset(
    ${position.y + base.y + top}px
    calc(100% - ${position.x + base.x + right}px) 
    calc(100% - ${position.y + base.y + bottom}px) 
    ${position.x - left}px round 4px)`
    : `inset(
      ${position.y + base.y + top}px
      calc(100% - ${position.x + base.x + right}px) 
      calc(100% - ${position.y - bottom}px)
      ${position.x - left}px round 4px)`;
}
function createIframeStyle(
  dimensions: Dimensions,
  dragInfo: DragInfo,
  menuPosition: MenuPosition = "top-right",
) {
  //creates an element that spans the entire screen
  //a clip path is used to crop to only the actual component
  const style = {
    width: "100vw",
    height: "100vh",
    "clip-path": createClipPath(
      dragInfo.current,
      dimensions.base,
      dimensions.modifiers,
      menuPosition,
    ),
    transition: dimensions.modifiers.transition,
    background: "none",
    position: "fixed",
    top: "0",
    left: "0",
    "z-index": "9999",
  };
  //remove clip path if mouse is pressed so we get mouse events across the entire page
  if (dragInfo.pressed) style["clip-path"] = "none";
  return style;
}

function getWindowSize() {
  const win = window,
    doc = document,
    docElem = doc.documentElement,
    body = doc.getElementsByTagName("body")[0],
    x = win.innerWidth || docElem.clientWidth || body.clientWidth,
    y = win.innerHeight || docElem.clientHeight || body.clientHeight;

  return { x, y };
}

function getPosition(event: MouseEvent | React.MouseEvent) {
  let vertical = "top";
  let horizontal = "right";
  const { x, y } = getWindowSize();
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  if (mouseY < Math.floor(y / 2)) {
    vertical = "top";
  } else {
    vertical = "bottom";
  }

  if (mouseX < Math.floor(x / 2)) {
    horizontal = "left";
  } else {
    horizontal = "right";
  }

  return `${vertical}-${horizontal}` as MenuPosition;
}

export function getPositionPrefix(position?: MenuPosition) {
  return position?.slice(0, position?.indexOf("-"));
}

export function isVerticalTranslation(lastPosition?: MenuPosition, newPosition?: MenuPosition) {
  const lastPositionPrefix = getPositionPrefix(lastPosition);
  const newPositionPrefix = getPositionPrefix(newPosition);
  const hasPositions = lastPosition && newPosition;
  return hasPositions && lastPositionPrefix !== newPositionPrefix;
}

export default function Draggable(
  // { children, dimensions, defaultPosition, requiredClassName, ignoreClassName }: {
  { children, requiredClassName, ignoreClassName }: {
    children: React.ReactNode;
    // dimensions: Dimensions;
    // defaultPosition: Vector;
    requiredClassName?: string;
    ignoreClassName?: string;
  },
) {
  const lastPositionRef = useRef<MenuPosition>(undefined!);
  const { state: menuState, updateMenuPosition, setIsClosed, updateDimensions } = useMenu();
  // const { state: menuState, dispatch } = useMenuReducer()
  const dimensions = getDimensions(menuState);
  const menuPosition = getMenuPosition(menuState);

  const defaultPosition = { x: 0, y: 0 };

  const [dragInfo, setDragInfo] = useState<DragInfo>(
    {
      current: defaultPosition,
      start: { x: 0, y: 0 },
      pressed: false,
      draggable: true,
    },
  );

  useEffect(() => {
    const handleWindowMouseMove = (event: MouseEvent) => {
      setDragInfo((old: DragInfo) => (
        {
          ...old,
          current: {
            x: (event.clientX) - old.start.x,
            y: (event.clientY) - old.start.y,
          },
        }
      ));
    };
    if (dragInfo.pressed) {
      window.addEventListener("mousemove", handleWindowMouseMove);
    } else {
      window.removeEventListener("mousemove", handleWindowMouseMove);
    }
    return () => (window.removeEventListener(
      "mousemove",
      handleWindowMouseMove,
    ));
  }, [dragInfo.pressed]);

  useEffect(() => {
    const lastPosition = lastPositionRef.current;
    if (menuPosition) {
      lastPositionRef.current = menuPosition;

      if (isVerticalTranslation(lastPosition, menuPosition)) {
        if (getPositionPrefix(lastPosition) === "bottom") {
          // TODO clean this up
          // update the position from bottom to top
          setDragInfo((old: DragInfo) => (
            {
              ...old,
              current: {
                x: old.start.x,
                y: old.start.y + dimensions.base.y - 40,
              },
            }
          ));
          updateDimensions();
        } else {
          // TODO clean this up
          // update the position from top to bottom
          setDragInfo((old: DragInfo) => (
            {
              ...old,
              current: {
                x: old.start.x,
                y: old.start.y - dimensions.base.y + 40,
              },
            }
          ));
          updateDimensions();
        }
      }
    }
  }, [menuPosition]);

  // use jumper to update the clip path based on the dimensions and drag info
  useEffect(() => {
    const style = createIframeStyle(dimensions, dragInfo, menuPosition);
    jumper.call("layout.applyLayoutConfigSteps", {
      layoutConfigSteps: [
        { action: "useSubject" }, // start with our iframe
        { action: "setStyle", value: style },
      ],
    });
  }, [dimensions, dragInfo, menuPosition]);

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
          menuPosition,
        ),
        cursor: dragInfo.pressed ? "grab" : "pointer",
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
          setIsClosed();
          updateDimensions({
            transition: "none",
          });
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
        if (dragInfo.draggable) {
          updateMenuPosition(getPosition(e));
          updateDimensions();

          // re-enable the transition
          setTimeout(() => {
            updateDimensions({
              transition: ".25s cubic-bezier(.4, .71, .18, .99)",
            });
          }, 100);
        }
        setDragInfo((old: DragInfo) => ({
          ...old,
          pressed: false,
          draggable: true,

          // NEW
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
          background: "red",
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
