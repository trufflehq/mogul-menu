import { useContext, createContext, useReducer } from 'react'
import _ from 'https://npm.tfl.dev/lodash?no-check'
import { TabDefinition } from './tab-definition.ts'
import { uniqueId } from '../general.ts'

export interface TabState {
  hasBadge: boolean;
  text: string;
  icon: string;
  isActive: boolean;
}

export type TabStateMap = Record<string, TabState>
export type TabStateManager = ReturnType<typeof useTabStateManager>

export const TabContext = createContext<TabStateManager>()

export function useTabStateManager (tabs: TabDefinition[]) {

  const updateTabState = (state, { type, payload }) => {
    const newState = {...state}
    newState[payload.tabId][type] = payload.value
    return newState
  }

  const initTabStates = (tabs: TabDefinition[]) => {
    const tabStates = {}
    for (const tab of tabs) {
      tabStates[uniqueId()] = {
        text: tab.text,
        icon: tab.imgUrl,
        hasBadge: false
      }
    }

    return tabStates
  }

  interface DispatchArgs<T extends keyof TabState> {
    type: T,
    payload: {
      tabId: string;
      value: TabState[T]
    }
  }

  const [tabStates, dispatch]: 
    [TabStateMap, <T extends keyof TabState>(args: DispatchArgs<T>) => void]
    = useReducer(updateTabState, tabs, initTabStates)

  return { tabStates, dispatch }
}

export function useTabState (tabId: string) {
  const {tabStates, dispatch}: TabStateManager = useContext(TabContext)
  const currentTabState = tabStates[tabId]

  return {
    text: currentTabState?.text,
    icon: currentTabState?.icon,
    hasBadge: currentTabState?.hasBadge,
    setTabText: (value: string) => dispatch({ type: 'text', payload: { tabId, value } }),
    setTabIcon: (value: string) => dispatch({ type: 'icon', payload: { tabId, value } }),
    setTabBadge: (value: boolean) => dispatch({ type: 'hasBadge', payload: { tabId, value } })
  }
}