import { MenuPosition } from '../../state/mod.ts'

/**
 * Returns (x,y) for the window
 */
function getWindowSize() {
  const win = window,
    doc = document,
    docElem = doc.documentElement,
    body = doc.getElementsByTagName("body")[0],
    x = win.innerWidth || docElem.clientWidth || body.clientWidth,
    y = win.innerHeight || docElem.clientHeight || body.clientHeight;

  return { x, y };
}

/**
 * Gets the MenuPosition based on where the mouse coordinates are. To be used
 * in conjunction with the Draggable component
 */
export function getMenuMousePosition(event: MouseEvent | React.MouseEvent) {
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