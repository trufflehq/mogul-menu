import { TabStateKey, TabStateValue, UpdateTabStateAction, UpdateActiveTabAction } from "./types.ts";

export const updateTabState = (tabId: string, key: TabStateKey, value: TabStateValue): UpdateTabStateAction => ({
  type: "@@UPDATE_TAB_STATE",
  payload: {
    tabId: tabId,
    key,
    value,
  },
});

export const setActiveTab = (tabSlug: string): UpdateActiveTabAction => ({
  type: "@@UPDATE_ACTIVE_TAB",
  payload: {
    tabSlug
  },
});
