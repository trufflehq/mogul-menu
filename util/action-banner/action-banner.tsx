import { React, createContext, useContext } from "../../deps.ts"
import { useActionBannerManager, ActionBannerObj } from './manager.ts'

interface ActionBannerContext {
  actionBannerObj: ActionBannerObj
  displayActionBanner: (actionBanner: React.ReactNode, key?: string) => string | undefined
  removeActionBanner: (id: string) => void
}

export const ActionBannerContext = createContext<ActionBannerContext>(undefined!);

export function useActionBanner() {
  return useContext(ActionBannerContext);
}

export function ActionBannerProvider({ children }: { children: React.ReactNode}) {
  const { actionBannerObj, displayActionBanner, removeActionBanner } = useActionBannerManager();    

  return  <ActionBannerContext.Provider
    value={{ actionBannerObj, displayActionBanner, removeActionBanner }}
  >
    { children }
  </ActionBannerContext.Provider>
}