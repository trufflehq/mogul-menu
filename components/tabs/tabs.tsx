import { _, classKebab, useEffect, React, useStyleSheet } from "../../deps.ts";
import {
  DEFAULT_TABS,
  getActiveTab,
  TabIdProvider,
  usePageStack,
  useTabStateManager,
  updateTabState,
} from "../../util/mod.ts";
import styleSheet from "./tabs.scss.js";

export default function Tabs() {
  useStyleSheet(styleSheet);
  const tabStateManager = useTabStateManager();
  const { store, dispatch } = tabStateManager;
  const tabSlugs = Object.keys(store.tabs);
  const activeTab = getActiveTab(tabStateManager.store);
  const { clearPageStack } = usePageStack();
  useEffect(() => {
    clearPageStack();
  }, [activeTab]);

  useEffect(() => {
    dispatch(updateTabState(activeTab, "isActive", true));

    const onNavigateAway = () => {
      dispatch(updateTabState(activeTab, "isActive", false));
    };

    return onNavigateAway;
  }, [activeTab]);

  return (
    <>
      {DEFAULT_TABS.map(({ $el: TabComponent }, idx) => {
        return (
          <TabIdProvider key={idx} tabId={tabSlugs[idx]}>
            <div
              className={`c-tab-component ${classKebab({
                isActive: tabSlugs[idx] === activeTab,
              })}`}
            >
              {TabComponent && <TabComponent />}
            </div>
          </TabIdProvider>
        );
      })}
    </>
  );
}
