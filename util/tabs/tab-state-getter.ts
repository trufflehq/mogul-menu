import { TabStore } from "./types.ts";

export function getActiveTab(store: TabStore) {
  return store.activeTab;
}

export function getHasNotification(store: TabStore) {
  return Object.values(store.tabs).reduce(
    (acc, tabState) => acc || tabState.hasBadge,
    false,
  );
}
