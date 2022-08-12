import React, { useMemo } from "https://npm.tfl.dev/react";
import { createSubject } from "https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js";
import { uniqueId } from "../general.ts";

export type ActionBanner = {
  key: string;
  Component: React.ReactNode;
};

export type ActionBannerObj = Record<string, ActionBanner>;

export function useActionBannerManager() {
  const actionBannerObjSubject = useMemo(() => createSubject({}), []);

  const displayActionBanner = (actionBanner: React.ReactNode, key?: string) => {
    const id = uniqueId();

    const actionBannerObj: ActionBannerObj = actionBannerObjSubject.getValue();
    const actionBanners = Object.keys(actionBannerObj).reduce<ActionBanner[]>((acc, id) => {
      const act = actionBannerObj[id];
      acc.push(act);

      return acc;
    }, []);

    if (actionBanners?.find((obj) => obj?.key === key)) {
      return;
    }

    const newObject = {
      ...actionBannerObjSubject.getValue(),
      [id]: {
        key,
        Component: actionBanner,
      },
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
