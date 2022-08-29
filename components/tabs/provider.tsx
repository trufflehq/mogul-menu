import { React } from "../../deps.ts";
import { useTabsReducer } from "./hooks.ts";
import { TabsContext, TabSlugContext } from "./context.ts";
import { DEFAULT_TABS } from "./constants.ts";

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const tabStateManager = useTabsReducer(DEFAULT_TABS);
  return (
    <TabsContext.Provider value={tabStateManager}>
      {children}
    </TabsContext.Provider>
  );
}

export function TabSlugProvider(
  { children, tabSlug }: { children: React.ReactNode; tabSlug: string },
) {
  return (
    <TabSlugContext.Provider value={tabSlug}>
      {children}
    </TabSlugContext.Provider>
  );
}
