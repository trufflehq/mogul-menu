import { useContext, useMemo, useReducer } from "../../deps.ts";
import { tabsReducer } from "./reducer.ts";
import { TabDefinition, TabState, TabsState, TabsActions } from "./types.ts";
import { TabsContext, TabSlugContext} from "./context.ts";

const initializeTabs = (tabs: TabDefinition[]) => {
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

export function useTabSlug() {
  return useContext(TabSlugContext);
}

export function useTabsReducer(tabs: TabDefinition[]) {
  const initialTabs = initializeTabs(tabs);

  const [state, dispatch] = useReducer(tabsReducer, initialTabs);

  const memoizedStore = useMemo<[TabsState, React.Dispatch<TabsActions>]>(() => [state, dispatch], [
    state,
  ])

  return { state: memoizedStore[0], dispatch: memoizedStore[1] };
}

export function useTabs() {
  const { state, dispatch } = useContext(TabsContext);

  return { state, dispatch };
}

export function useCurrentTab() {
  const tabSlug = useTabSlug() as string;
  const { state, dispatch } = useContext(TabsContext);

  const tabStates = state.tabs;

  const currentTabState = tabStates[tabSlug];
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
      dispatch({ type: "@@UPDATE_TAB", payload: { tabSlug, key: "text", value } }),
    setTabIcon: (value: string) =>
      dispatch({ type: "@@UPDATE_TAB", payload: { tabSlug, key: "icon", value } }),
    setTabBadge: (value: boolean) =>
      dispatch({ type: "@@UPDATE_TAB", payload: { tabSlug, key: "hasBadge", value } }),
    setActiveTab: (tabSlug: string) =>
      dispatch({ type: "@@UPDATE_ACTIVE_TAB", payload: { tabSlug } }),
  };
}

