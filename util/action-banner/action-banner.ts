import { createContext, useContext } from "react";

export const ActionBannerContext = createContext();

export function useActionBanner() {
  return useContext(ActionBannerContext);
}
