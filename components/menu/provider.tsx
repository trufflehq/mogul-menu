import { React } from "../../deps.ts";
import { File } from "../../types/mod.ts";
import { MenuState } from "./types.ts";
import { useMenuReducer } from "./hooks.ts";
import { MenuContext } from "./context.ts";
import {
  BASE_MENU_HEIGHT,
  BASE_MENU_WIDTH,
  DEFAULT_MENU_ICON_HEIGHT,
  DEFAULT_MENU_ICON_WIDTH,
} from "./constants.ts";

export const INITIAL_MENU_STATE: MenuState = {
  menuState: "closed",
  menuPosition: undefined,
  snackBars: [],
  dimensions: {
    base: {
      x: BASE_MENU_WIDTH,
      y: BASE_MENU_HEIGHT,
      width: DEFAULT_MENU_ICON_WIDTH,
      height: DEFAULT_MENU_ICON_HEIGHT,
    },
    modifiers: {
      transition: "none",
    },
  },
};

export function MenuProvider({
  children,
  iconImageObj,
}: {
  children: React.ReactNode;
  iconImageObj?: File;
}) {
  const menuState = useMenuReducer({ ...INITIAL_MENU_STATE, iconImageObj });
  return <MenuContext.Provider value={menuState}>{children}</MenuContext.Provider>;
}
