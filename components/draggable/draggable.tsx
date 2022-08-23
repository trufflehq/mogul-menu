import { useEffect, useState, React, jumper } from "../../deps.ts";
import { useMenu, getDimensions } from '../../util/mod.ts'
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
  { top, right, bottom, left }: Pick<Modifiers, 'top' | 'right' | 'bottom' | 'left' >
) {
  return `inset(
				${position.y - top}px
				calc(100% - ${position.x + base.x + right}px) 
				calc(100% - ${position.y + base.y + bottom}px) 
				${position.x - left}px round 4px)`;
}
function createIframeStyle(dimensions: Dimensions, dragInfo: DragInfo) {
  //creates an element that spans the entire screen
  //a clip path is used to crop to only the actual component
  const style = {
    width: "100vw",
    height: "100vh",
    "clip-path": createClipPath(
      dragInfo.current,
      dimensions.base,
      dimensions.modifiers,
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
  const { store: menuStore } = useMenu()
    const dimensions = getDimensions(menuStore)
  // console.log('dimensions', dimensions)
  // const dragProps = {
  //   dimensions,
  // };
  const defaultPosition = { x: 0, y: 0 }


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

  // use jumper to update the clip path based on the dimensions and drag info
  useEffect(() => {
    const style = createIframeStyle(dimensions, dragInfo);
    jumper.call("layout.applyLayoutConfigSteps", {
      layoutConfigSteps: [
        { action: "useSubject" }, // start with our iframe
        { action: "setStyle", value: style },
      ],
    });
  }, [dimensions, dragInfo]);

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
        "clip-path":  createClipPath(
          dragInfo.current,
          dimensions.base,
          dimensions.modifiers,
        ),
        // dragInfo.pressed disables the animation during drag
        transition: dragInfo.pressed ? "none" : dimensions.modifiers.transition,
      }}
      onMouseDown={(e) => {
        const target = e.target as HTMLDivElement;
        const classes = target.className;
        if(!classes || !classes?.includes) return
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
      onMouseUp={() => {
        setDragInfo((old: DragInfo) => ({
          ...old,
          pressed: false,
          draggable: true,
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
