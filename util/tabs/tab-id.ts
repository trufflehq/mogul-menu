import { createContext, useContext } from "react";

export const TabIdContext = createContext();

export function useTabId() {
  return useContext(TabIdContext);
}
