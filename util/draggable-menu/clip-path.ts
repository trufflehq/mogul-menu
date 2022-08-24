import { getPositionPrefix, MenuPosition } from "../../state/mod.ts";
import { Vector } from "../../types/mod.ts";
import { PositionModifiers } from "./types.ts";

export function getTopClipPath(
  position: Vector,
  base: Vector,
  { top, right, bottom, left }: PositionModifiers,
) {
  return `inset(
      ${position.y + base.y + top}px
      calc(100% - ${position.x + base.x + right}px) 
      calc(100% - ${position.y + base.y + bottom}px) 
      ${position.x - left}px round 4px)`;
}

function getBottomClipPath(
  position: Vector,
  base: Vector,
  { top, right, bottom, left }: PositionModifiers,
) {
  return `inset(
    ${position.y + base.y + top}px
    calc(100% - ${position.x + base.x + right}px) 
    calc(100% - ${position.y - bottom}px)
    ${position.x - left}px round 4px)`;
}

export function createMenuClipPath(
  position: Vector,
  base: Vector,
  { top, right, bottom, left }: PositionModifiers,
  menuPosition: MenuPosition = "top-right",
) {
  const verticalPosition = getPositionPrefix(menuPosition);

  return verticalPosition === "top"
    ? getTopClipPath(position, base, { top, right, bottom, left })
    : getBottomClipPath(position, base, { top, right, bottom, left });
}
