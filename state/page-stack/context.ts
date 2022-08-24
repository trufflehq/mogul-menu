import { createContext, React } from "../../deps.ts";
interface PageStackContext {
  pageStack: React.ReactNode[];
  pushPage: (Component: React.ReactNode) => void;
  popPage: () => void;
  clearPageStack: () => void;
}

export const PageStackContext = createContext<PageStackContext>(undefined!);
