import { createContext, React, useContext, useState } from "../../deps.ts";
import { PageStackContext } from './context.ts'
export function PageStackProvider({ children }: { children: React.ReactNode }) {
  const [pageStack, setPageStack] = useState<React.ReactNode[]>([]);

  const pushPage = (Component: React.ReactNode) => {
    setPageStack((pageStack) => pageStack.concat(Component));
  };

  const popPage = () => {
    setPageStack((pageStack) => pageStack.slice(0, -1));
  };

  const clearPageStack = () => {
    setPageStack([]);
  };

  return (
    <PageStackContext.Provider
      value={{
        pageStack,
        pushPage,
        popPage,
        clearPageStack,
      }}
    >
      {children}
    </PageStackContext.Provider>
  );
}
