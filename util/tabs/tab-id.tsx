import { React, createContext, useContext } from "../../deps.ts"

type TabIdContext = string
export const TabIdContext = createContext<TabIdContext>(undefined!);

export function useTabId() {
  return useContext(TabIdContext);
}

export function TabIdProvider({ children, tabId }: { children: React.ReactNode, tabId: string}) {

  return <TabIdContext.Provider value={tabId}>
    {children}
  </TabIdContext.Provider>
}