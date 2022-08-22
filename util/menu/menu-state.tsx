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
      // transition: "none",
      "transition": ".5s cubic-bezier(.4, .71, .18, .99)",
    }
  }
}

export function MenuState(initialState: MenuStore) {
  const menuStateReducer = (state: MenuStore, { type, payload }: MenuActions) => {
    switch (type) {
      case "@@MENU_DEMENSION_OPEN": {
        console.log('@@MENU_DEMENSION_OPEN')

        // need to check for whether the menu is claimable

        const newState = {
          ...state,
          menuState: 'open',
          dimensions: {
            ...state.dimensions,
            modifiers: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              "transition": ".5s cubic-bezier(.4, .71, .18, .99)",
              // transition: "none",
            }
          }
        }

        return newState
      }
      case "@@MENU_DIMENSION_CLOSE": {
        console.log('@@MENU_DIMENSION_CLOSE')
        // need to check for whether the menu is claimable
        const width = getClosedWidth(state)
        const newState = {
          ...state,
          menuState: 'closed',
          dimensions: {
            ...state.dimensions,
            modifiers: {
              ...state.dimensions.modifiers,
              ...{
                left: width,
                bottom: -560,
                transition: "clip-path .5s cubic-bezier(.4, .71, .18, .99)",
              }
            }
          }
        }

        return newState
      }
      case "@@MENU_UPDATE_CLAIMABLE": {
        console.log('@@MENU_UPDATE_CLAIMABLE')
        const isOpen = getIsOpen(state)
        console.log('payload.isClaimable', payload.isClaimable, isOpen)

        const newState = {
          ...state,
          isClaimable: payload.isClaimable,
        }

        return newState
      }
      case "@@MENU_ADDITIONAL_BUTTON_REF": {
        console.log('@@MENU_ADDITIONAL_BUTTON_REF')
        return {
          ...state,
          $$additionalButtonRef: payload.ref
        }
      }

      case "@@MENU_UPDATE_DIMENSIONS": {
        console.log('update dimensions')

        const isOpen = getIsOpen(state)
        const closedWidth = getClosedWidth(state)
        console.log('closedWidth', closedWidth)

        return {
          ...state,
          dimensions: {
            ...state.dimensions,
            modifiers: {
              ...state.dimensions.modifiers,
              // expand if the menu is closed and there are additional buttons
              left: isOpen ? state.dimensions.modifiers.left : getClosedWidth(state),
              ...payload,
              "transition": ".5s cubic-bezier(.4, .71, .18, .99)",
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