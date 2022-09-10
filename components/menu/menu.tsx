import { React, useEffect, useState } from "../../deps.ts";
import MenuBody from "./menu-body.tsx";
import MenuProvider from "./menu-provider.tsx";
import { File } from "../../types/mod.ts";
import { Vector } from "../draggable/draggable.tsx";
import { useSeasonPassData } from "../../shared/mod.ts";
import { DEFAULT_TABS, SEASON_PASS_TAB, TabDefinition } from "../tabs/mod.ts";

export interface MogulMenuProps {
  tabs: TabDefinition[];
  iconImageObj: File;
  defaultPositionElementQuerySelector?: string;
  defaultPositionOffset?: Vector;
}
export default function Menu(props: MogulMenuProps) {
  const tabs = useDynamicTabs();

  // wait until we have loaded the tabs
  if (!tabs) return <></>;

  const _props = { ...props, tabs };

  return (
    <MenuProvider {..._props}>
      <MenuBody
        {..._props}
      />
    </MenuProvider>
  );
}

// HACK: only display tabs if the org has the feature associated with it (eg season pass)
// rm when we make users provide their own tab array
function useDynamicTabs() {
  const [tabs, setTabs] = useState();
  const seasonPassRes = useSeasonPassData();
  useEffect(() => {
    const fetchingSeasonPass = seasonPassRes?.fetching;
    const readyToSet = !fetchingSeasonPass;

    // when all of the conditionals have loaded,
    // set the tabs
    if (readyToSet) {
      const tabs = [...DEFAULT_TABS];

      // check for the season pass
      const hasSeasonPass = Boolean(seasonPassRes?.data?.seasonPass?.id);
      if (hasSeasonPass) {
        tabs.push(SEASON_PASS_TAB);
      }

      setTabs(tabs);
    }
  }, [seasonPassRes]);

  return tabs;
}
