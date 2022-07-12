import { createSubject } from "https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js";

export const activeTabSubject = createSubject();

export function setActiveTab(slug: string) {
  activeTabSubject.next(slug);
}
