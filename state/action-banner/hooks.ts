import { useState } from "../../deps.ts";
import { uniqueId } from "../../util/general.ts";

import { ActionBannerMap, ActionBanner } from './types.ts'

export function useActionBanner() {
  const [actionBannerMap, setActionBannerMap] = useState<ActionBannerMap>({});

  const displayActionBanner = (actionBanner: React.ReactNode, key?: string) => {
    const id = uniqueId();

    const actionBanners = Object.keys(actionBannerMap).reduce<ActionBanner[]>((acc, id) => {
      const act = actionBannerMap[id];
      acc.push(act);

      return acc;
    }, []);

    if (actionBanners?.find((obj) => obj?.key === key)) {
      return;
    }

    const newObject = {
      ...actionBannerMap,
      [id]: {
        key,
        Component: actionBanner,
      },
    };

    setActionBannerMap(newObject);
    return id;
  };

  const removeActionBanner = (id: string) => {
    setActionBannerMap((oldObj: ActionBannerMap) => {
      const newObject: ActionBannerMap = { ...oldObj };
      delete newObject[id];
      return newObject;
    });
  };

  return {
    actionBannerMap,
    displayActionBanner,
    removeActionBanner,
  };
}
