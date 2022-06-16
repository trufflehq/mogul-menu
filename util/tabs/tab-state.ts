import { useContext, createContext, useReducer } from 'react'
import _ from 'https://npm.tfl.dev/lodash?no-check'
import { createSubject, op, Obs } from 'https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js'
import useObservables from 'https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js'
import { TabDefinition } from './tab-definition.ts'
import { uniqueId } from '../general.ts'

export interface TabState {
  hasBadge: boolean;
  text: string;
  icon: string;
}

export type TabStateMap = Record<string, TabState>
export type TabStateManager = ReturnType<typeof useTabStateManager>

export const TabContext = createContext<TabStateManager>()

export function useTabStateManager (tabs: TabDefinition[]) {

  const updateTabState = (state, { type, payload }) => {
    const newState = {...state}
    newState[payload.id][type] = payload.value
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

  interface DispatchArgs {
    type: keyof TabState,
    payload: {
      id: string;
      value: any
    }
  }

  const [tabStates, dispatch]: 
    [TabStateMap, (args: DispatchArgs) => void]
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
    setTabText: (value: string) => dispatch({ type: 'text', payload: { id: tabId, value } }),
    setTabIcon: (value: string) => dispatch({ type: 'icon', payload: { id: tabId, value } }),
    setTabBadge: (value: boolean) => dispatch({ type: 'hasBadge', payload: { id: tabId, value } })
  }
}