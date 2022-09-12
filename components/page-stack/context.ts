import { createContext, React } from "../../deps.ts";
import { PageState } from './provider.tsx'
interface PageStackContext {
  pageStack: PageState[];
  pushPage: (Component: React.ReactNode,  isEscapeDisabled?: boolean) => void;
  popPage: () => void;
  clearPageStack: () => void;
  peekPage: () => PageState
}

export const PageStackContext = createContext<PageStackContext>(undefined!);
