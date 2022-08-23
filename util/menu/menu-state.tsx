import { React, createContext, useContext, useReducer } from '../../deps.ts'
import { MenuStore, MenuActions, DimensionModifiers } from './types.ts'
import { getMenuState, getIsOpen, getClosedWidth } from './menu-state-getter.ts'
import { setClosed, setOpen, setIsClaimable, setAdditionalButtonRef, updateDimensions } from './menu-state-actions.ts'
export type MenuStateContext = ReturnType<typeof MenuState>;
export const MenuContext = createContext<MenuStateContext>(undefined!);

export const BASE_MENU_WIDTH = 640
export const BASE_MENU_HEIGHT = 600
export const DEFAULT_MENU_ICON_HEIGHT = 40
export const DEFAULT_MENU_ICON_WIDTH = 40

const INITIAL_MENU_STATE: MenuStore = {
  isClaimable: false,
  $$additionalButtonRef: null,
  menuState: 'closed',
  dimensions: { 
    base: { x: BASE_MENU_WIDTH, y: BASE_MENU_HEIGHT },
    modifiers: {
      top: 0,
      right: 0,
      bottom: 0 - BASE_MENU_HEIGHT + DEFAULT_MENU_ICON_HEIGHT,
      left: 0 - BASE_MENU_WIDTH + DEFAULT_MENU_ICON_WIDTH,
      "transition": ".5s cubic-bezier(.4, .71, .18, .99)",
    }
  }
}

export function MenuState(initialState: MenuStore) {
  const menuStateReducer = (state: MenuStore, { type, payload }: MenuActions) => {
    switch (type) {
      case "@@MENU_DEMENSION_OPEN": {
        return {
          ...state,
          menuState: 'open',
          dimensions: {
            ...state.dimensions,
            modifiers: {
              ...state.dimensions.modifiers,
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }
          }
        }
      }
      case "@@MENU_DIMENSION_CLOSE": {
        const width = getClosedWidth(state)
        return {
          ...state,
          menuState: 'closed',
          dimensions: {
            ...state.dimensions,
            modifiers: {
              ...state.dimensions.modifiers,
              ...{
                left: width,
                bottom: -560,
              }
            }
          }
        }
      }
      case "@@MENU_UPDATE_CLAIMABLE": {
        return {
          ...state,
          isClaimable: payload.isClaimable,
        }
      }
      case "@@MENU_ADDITIONAL_BUTTON_REF": {
        return {
          ...state,
          $$additionalButtonRef: payload.ref
        }
      }

      case "@@MENU_UPDATE_DIMENSIONS": {
        const isOpen = getIsOpen(state)

        return {
          ...state,
          dimensions: {
            ...state.dimensions,
            modifiers: {
              ...state.dimensions.modifiers,
              // expand if the menu is closed and there are additional buttons
              left: isOpen ? state.dimensions.modifiers.left : getClosedWidth(state),
              ...payload,
            }
          }
        }
      }

      default:
        return state;
    }
  };


  const [store, dispatch] = useReducer(menuStateReducer, initialState);

  return { store, dispatch };
}

export function useMenu() {
  const { store, dispatch } = useContext(MenuContext)
  
  return {
    store,
    dispatch,
    toggleOpen: () => {
      const menuState = getMenuState(store)
      return menuState === 'open' ? dispatch(setClosed()) : dispatch(setOpen())
    },
    setIsClaimable: (isClaimable: boolean) => dispatch(setIsClaimable(isClaimable)),
    setAdditionalButtonRef: (ref: React.MutableRefObject<HTMLDivElement>) => dispatch(setAdditionalButtonRef(ref)),
    updateDimensions: (mods?: Partial<DimensionModifiers>) => dispatch(updateDimensions(mods))
  }
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const menuState = MenuState(INITIAL_MENU_STATE)
  return <MenuContext.Provider value={menuState}>
    {
      children
    }
  </MenuContext.Provider>
}