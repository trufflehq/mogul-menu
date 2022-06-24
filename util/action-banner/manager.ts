import { JSX, useMemo } from "https://npm.tfl.dev/react";
import { createSubject } from "https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js";
import { uniqueId } from "../general.ts";

export function useActionBannerManager() {
  const actionBannerObjSubject = useMemo(() => createSubject({}), []);

  const displayActionBanner = (actionBanner: JSX.Element) => {
    const id = uniqueId();
    const newObject = {
      ...actionBannerObjSubject.getValue(),
      [id]: actionBanner,
    };
    actionBannerObjSubject.next(newObject);
    return id;
  };

  const removeActionBanner = (id: string) => {
    const newObject = { ...actionBannerObjSubject.getValue() };
    delete newObject[id];
    actionBannerObjSubject.next(newObject);
  };

  return {
    actionBannerObjSubject,
    displayActionBanner,
    removeActionBanner,
  };
}
