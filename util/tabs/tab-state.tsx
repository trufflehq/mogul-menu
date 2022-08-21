import { createContext, useContext, useReducer, React } from "../../deps.ts";
import { TabDefinition, TabState, TabStateActions, TabStore } from "./types.ts";
import { DEFAULT_TABS } from './default-tabs.tsx'
import { useTabId } from "./tab-id.tsx";

export type TabStateManager = ReturnType<typeof initializeTabStateManager>;
export const TabStateContext = createContext<TabStateManager>(undefined!);

export function initializeTabStateManager(tabs: TabDefinition[]) {
  const tabStateReducer = (state: TabStore, { type, payload }: TabStateActions) => {
    switch (type) {
      case "@@UPDATE_TAB_STATE": {
        const newState = {
          ...state,
          tabs: {
            ...state.tabs,
            [payload.tabId]: {
              ...state.tabs[payload.tabId],
              [payload.key]: payload.value,
            },
          },
        };

        return newState;
      }

      case "@@UPDATE_ACTIVE_TAB": {
        return {
          ...state,
          activeTab: payload.tabSlug,
        };
      }

      default:
        return state;
    }
  };

  const initTabStates = (tabs: TabDefinition[]) => {
    const tabStates: Record<string, TabState> = {};
    for (const tab of tabs) {
      tabStates[tab.slug] = {
        text: tab.text,
        icon: tab.imgUrl,
        hasBadge: false,
        isActive: false,
      };
    }

    return { activeTab: "home", tabs: tabStates };
  };

  const initialTabs = initTabStates(tabs);

  const [store, dispatch] = useReducer(tabStateReducer, initialTabs);

  return { store, dispatch };
}

export function useTabStateManager() {
  const tabStateManager = useContext(TabStateContext)

  const { store, dispatch } = tabStateManager

  return { store, dispatch }
}

export function useTabState() {
  const tabId = useTabId() as string;
  const { store, dispatch } = useContext(TabStateContext);

  const tabStates = store.tabs;

  const currentTabState = tabStates[tabId];
  const hasTabNotification = Object.values(tabStates).reduce(
    (acc, tabState) => acc || tabState.hasBadge,
    false,
  );

  return {
    text: currentTabState?.text,
    icon: currentTabState?.icon,
    hasBadge: currentTabState?.hasBadge,
    isActive: currentTabState?.isActive,
    hasTabNotification,
    setTabText: (value: string) =>
      dispatch({ type: "@@UPDATE_TAB_STATE", payload: { tabId, key: "text", value } }),
    setTabIcon: (value: string) =>
      dispatch({ type: "@@UPDATE_TAB_STATE", payload: { tabId, key: "icon", value } }),
    setTabBadge: (value: boolean) =>
      dispatch({ type: "@@UPDATE_TAB_STATE", payload: { tabId, key: "hasBadge", value } }),
    setActiveTab: (tabSlug: string) =>
      dispatch({ type: "@@UPDATE_ACTIVE_TAB", payload: { tabSlug } }),
  };
}



export function TabStateProvider({ children }: { children: React.ReactNode }) {
  const tabStateManager = initializeTabStateManager(DEFAULT_TABS)
  return <TabStateContext.Provider value={tabStateManager}>
    {
      children
    }
  </TabStateContext.Provider>
}