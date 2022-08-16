import { createSubject } from "https://tfl.dev/@truffle/utils@~0.0.2/obs/subject.ts";

export const activeTabSubject = createSubject();

export function setActiveTab(slug: string) {
  activeTabSubject.next(slug);
}
