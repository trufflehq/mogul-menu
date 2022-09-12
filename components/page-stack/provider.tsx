import { React, useState } from "../../deps.ts";
import { PageStackContext } from "./context.ts";

export interface PageState {
  Component: React.ReactNode;
  isEscapeDisabled: boolean;
}
export function PageStackProvider({ children }: { children: React.ReactNode }) {
  const [pageStack, setPageStack] = useState<PageState[]>([]);

  const pushPage = (PageComponent: React.ReactNode, isEscapeDisabled = false) => {
    setPageStack((pageStack) => pageStack.concat([{ Component: PageComponent, isEscapeDisabled }]));
  };

  const peekPage = () => {
    const page = pageStack[0];
    return page;
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
        peekPage,
      }}
    >
      {children}
    </PageStackContext.Provider>
  );
}
