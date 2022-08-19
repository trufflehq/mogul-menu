import { useState } from "../../deps.ts";
import { uniqueId } from "../general.ts";

export type ActionBanner = {
  key?: string;
  Component: React.ReactNode;
};

export type ActionBannerObj = Record<string, ActionBanner>;

export function useActionBannerManager() {
  const [actionBannerObj, setActionBannerObj] = useState<ActionBannerObj>({});

  const displayActionBanner = (actionBanner: React.ReactNode, key?: string) => {
    const id = uniqueId();

    const actionBanners = Object.keys(actionBannerObj).reduce<ActionBanner[]>((acc, id) => {
      const act = actionBannerObj[id];
      acc.push(act);

      return acc;
    }, []);

    if (actionBanners?.find((obj) => obj?.key === key)) {
      return;
    }

    const newObject = {
      ...actionBannerObj,
      [id]: {
        key,
        Component: actionBanner,
      },
    };

    setActionBannerObj(newObject);
    return id;
  };

  const removeActionBanner = (id: string) => {
    setActionBannerObj((oldObj: ActionBannerObj) => {
      const newObject: ActionBannerObj = { ...oldObj };
      delete newObject[id];
      return newObject;
    });
  };

  return {
    actionBannerObj,
    displayActionBanner,
    removeActionBanner,
  };
}
