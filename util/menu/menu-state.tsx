import { createContext, React, useContext, useMemo, useReducer } from "../../deps.ts";
import { File } from '../../types/mod.ts'
import { DimensionModifiers, MenuActions, MenuState } from "./types.ts";
import { getClosedHeight, getClosedWidth, getIsOpen, getMenuState } from "./menu-state-getter.ts";
import {
  enqueueSnackBar,
  popSnackBar,
  setAdditionalButtonRef,
  setClosed,
  setIsClaimable,
  setOpen,
  updateDimensions,
} from "./menu-state-actions.ts";
export type MenuStateContext = ReturnType<typeof useMenuReducer>;
export const MenuContext = createContext<MenuStateContext>(undefined!);

export const BASE_MENU_WIDTH = 640;
export const BASE_MENU_HEIGHT = 600;
export const DEFAULT_MENU_ICON_HEIGHT = 40;
export const DEFAULT_MENU_ICON_WIDTH = 40;

const INITIAL_MENU_STATE: MenuState = {
  isClaimable: false,
  $$additionalButtonRef: null,
  menuState: "closed",
  snackBars: [],
  dimensions: {
    base: { x: BASE_MENU_WIDTH, y: BASE_MENU_HEIGHT },
    modifiers: {
      top: 0,
      right: 0,
      bottom: 0 - BASE_MENU_HEIGHT + DEFAULT_MENU_ICON_HEIGHT,
      left: 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH,
      "transition": ".5s cubic-bezier(.4, .71, .18, .99)",
    },
  },
};

export function useMenuReducer(initialState: MenuState) {
  const menuStateReducer = (state: MenuState, { type, payload }: MenuActions) => {
    switch (type) {
      case "@@MENU_DEMENSION_OPEN": {
        return {
          ...state,
          menuState: "open",
          dimensions: {
            ...state.dimensions,
            modifiers: {
              ...state.dimensions.modifiers,
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
          },
        };
      }
      case "@@MENU_DIMENSION_CLOSE": {
        const width = getClosedWidth(state);
        const height = getClosedHeight(state);
        return {
          ...state,
          menuState: "closed",
          dimensions: {
            ...state.dimensions,
            modifiers: {
              ...state.dimensions.modifiers,
              ...{
                left: width,
                bottom: height,
              },
            },
          },
        };
      }
      case "@@MENU_UPDATE_CLAIMABLE": {
        return {
          ...state,
          isClaimable: payload.isClaimable,
        };
      }
      case "@@MENU_ADDITIONAL_BUTTON_REF": {
        return {
          ...state,
          $$additionalButtonRef: payload.ref,
        };
      }
      case "@@MENU_UPDATE_DIMENSIONS": {
        const isOpen = getIsOpen(state);
        return {
          ...state,
          dimensions: {
            ...state.dimensions,
            modifiers: {
              ...state.dimensions.modifiers,
              // expand if the menu is closed and there are additional buttons
              left: isOpen ? state.dimensions.modifiers.left : getClosedWidth(state),
              bottom: isOpen ? state.dimensions.modifiers.bottom : getClosedHeight(state),
              ...payload,
            },
          },
        };
      }
      case "@@MENU_ENQUEUE_SNACKBAR": {
        const updatedSnackBars = state.snackBars.concat(payload.snackbar);
        return {
          ...state,
          snackBars: updatedSnackBars,
        };
      }
      case "@@MENU_POP_SNACKBAR": {
        const slicedSnackBars = state.snackBars.slice(1);
        return {
          ...state,
          snackBars: slicedSnackBars,
        };
      }

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(menuStateReducer, initialState);

  const memoizedStore = useMemo<[MenuState, React.Dispatch<MenuActions>]>(() => [state, dispatch], [
    state,
  ]);
  return { store: memoizedStore[0], dispatch: memoizedStore[1] };
}

export function useMenu() {
  const { store, dispatch } = useContext(MenuContext);

  return {
    store,
    dispatch,
    toggleOpen: () => {
      const menuState = getMenuState(store);
      return menuState === "open" ? dispatch(setClosed()) : dispatch(setOpen());
    },
    setIsClaimable: (isClaimable: boolean) => dispatch(setIsClaimable(isClaimable)),
    setAdditionalButtonRef: (ref: React.MutableRefObject<HTMLDivElement>) =>
      dispatch(setAdditionalButtonRef(ref)),
    updateDimensions: (mods?: Partial<DimensionModifiers>) => dispatch(updateDimensions(mods)),
    enqueueSnackBar: (snackbar: React.ReactNode) => dispatch(enqueueSnackBar(snackbar)),
    popSnackBar: () => dispatch(popSnackBar()),
  };
}

export function MenuProvider({ children, iconImageObj }: { children: React.ReactNode, iconImageObj?: File }) {
  const menuState = useMenuReducer({ ...INITIAL_MENU_STATE, iconImageObj });
  return (
    <MenuContext.Provider value={menuState}>
      {children}
    </MenuContext.Provider>
  );
}
