import { React } from "../../deps.ts";
import { ActionBannerContext } from './context.ts'
import { useActionBanner } from './hooks.ts'

export function ActionBannerProvider({ children }: { children: React.ReactNode}) {
  const { actionBannerMap, displayActionBanner, removeActionBanner } = useActionBanner();    

  return  <ActionBannerContext.Provider
    value={{ actionBannerMap, displayActionBanner, removeActionBanner }}
  >
    { children }
  </ActionBannerContext.Provider>
}