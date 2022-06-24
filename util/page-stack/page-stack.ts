import { createContext, useContext } from "https://npm.tfl.dev/react";

export const PageStackContext = createContext();

export function usePageStack() {
  return useContext(PageStackContext);
}
