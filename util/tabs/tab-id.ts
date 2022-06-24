import { createContext, useContext } from "https://npm.tfl.dev/react";

export const TabIdContext = createContext();

export function useTabId() {
  return useContext(TabIdContext);
}
