import { createContext, useContext } from "https://npm.tfl.dev/react";

export const ActionBannerContext = createContext();

export function useActionBanner() {
  return useContext(ActionBannerContext);
}
