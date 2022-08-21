import { createContext, React, useContext, useState } from "../../deps.ts";

interface PageStackContext {
  pageStack: React.ReactNode[];
  pushPage: (Component: React.ReactNode) => void;
  popPage: () => void;
  clearPageStack: () => void;
}

export const PageStackContext = createContext<PageStackContext>(undefined!);

export function usePageStack() {
  return useContext(PageStackContext);
}

export function PageStackProvider({ children }: { children: React.ReactNode}) {
  const [pageStack, setPageStack] = useState<React.ReactNode[]>([])

  const pushPage = (Component: React.ReactNode) => {
    setPageStack((pageStack) => pageStack.concat(Component));
  };

  const popPage = () => {
    setPageStack((pageStack) => pageStack.slice(0, -1));
  };

  const clearPageStack = () => {
    setPageStack([]);
  };

  return <PageStackContext.Provider value={{
    pageStack,
    pushPage,
    popPage,
    clearPageStack
  }}>
    {children}
  </PageStackContext.Provider>
}