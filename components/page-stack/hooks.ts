import { useContext } from "../../deps.ts";
import { PageStackContext } from './context.ts'

export function usePageStack() {
  return useContext(PageStackContext);
}
