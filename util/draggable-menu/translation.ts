import { getPositionPrefix, getPositionSuffix, MenuPosition } from "../../state/mod.ts";
import { Dimensions } from "../../types/mod.ts";

export function isVerticalTranslation(lastPosition?: MenuPosition, newPosition?: MenuPosition) {
  const lastPositionPrefix = getPositionPrefix(lastPosition);
  const newPositionPrefix = getPositionPrefix(newPosition);
  const hasPositions = lastPosition && newPosition;
  return hasPositions && lastPositionPrefix !== newPositionPrefix;
}

export function isHorizontalTranslation(lastPosition?: MenuPosition, newPosition?: MenuPosition) {
  const lastPositionSuffix = getPositionSuffix(lastPosition);
  const newPositionSuffix = getPositionSuffix(newPosition);

  const hasPositions = lastPosition && newPosition;
  return hasPositions && lastPositionSuffix !== newPositionSuffix;
}

export function getTranslationMods(
  lastPosition: MenuPosition,
  menuPosition: MenuPosition,
  dimensions: Dimensions,
) {
  let xMod = 0, yMod = 0;
  if (isVerticalTranslation(lastPosition, menuPosition)) {
    if (getPositionPrefix(lastPosition) === "bottom") {
      yMod = dimensions.base.y - 40;
    } else {
      yMod = 0 - dimensions.base.y + 40;
    }
  }
  if (isHorizontalTranslation(lastPosition, menuPosition)) {
    if (getPositionSuffix(lastPosition) === "left") {
      xMod = 0 - dimensions.base.x + 40;
    } else {
      xMod = dimensions.base.x - 40;
    }
  }

  return { xMod, yMod };
}
