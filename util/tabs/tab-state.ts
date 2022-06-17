import { useContext, createContext, useReducer } from 'react'
import _ from 'https://npm.tfl.dev/lodash?no-check'
import { TabDefinition, TabState, TabStateMap } from './types.ts'
import { uniqueId } from '../general.ts'
import { useTabId } from "./tab-id.ts";

export type TabStateManager = ReturnType<typeof useTabStateManager>

export const TabStateContext = createContext<TabStateManager>()

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
        hasBadge: false,
        isActive: false
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

export function useTabState () {
  const tabId = useTabId()
  const {tabStates, dispatch}: TabStateManager = useContext(TabStateContext)
  const currentTabState = tabStates[tabId]

  return {
    text: currentTabState?.text,
    icon: currentTabState?.icon,
    hasBadge: currentTabState?.hasBadge,
    isActive: currentTabState?.isActive,
    setTabText: (value: string) => dispatch({ type: 'text', payload: { tabId, value } }),
    setTabIcon: (value: string) => dispatch({ type: 'icon', payload: { tabId, value } }),
    setTabBadge: (value: boolean) => dispatch({ type: 'hasBadge', payload: { tabId, value } })
  }
}