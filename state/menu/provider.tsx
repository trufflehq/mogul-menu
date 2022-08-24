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

const INITIAL_MENU_STATE: MenuState = {
  isClaimable: false,
  $$additionalButtonRef: null,
  menuState: "closed",
  menuPosition: "top-right",
  snackBars: [],
  dimensions: {
    base: { x: BASE_MENU_WIDTH, y: BASE_MENU_HEIGHT },
    modifiers: {
      top: 0 - DEFAULT_MENU_ICON_HEIGHT,
      right: 0,
      bottom: 0,
      left: 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH,
      "transition": ".25s cubic-bezier(.4, .71, .18, .99)",
    },
  },
};

export function MenuProvider(
  { children, iconImageObj }: { children: React.ReactNode; iconImageObj?: File },
) {
  const menuState = useMenuReducer({ ...INITIAL_MENU_STATE, iconImageObj });
  return (
    <MenuContext.Provider value={menuState}>
      {children}
    </MenuContext.Provider>
  );
}
