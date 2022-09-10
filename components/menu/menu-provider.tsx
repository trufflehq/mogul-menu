import { _, React } from "../../deps.ts";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";

import { ActionBannerProvider } from "../action-banner/mod.ts";
import { TabButtonProvider, TabDefinition, TabsProvider } from "../tabs/mod.ts";
import { PageStackProvider } from "../page-stack/mod.ts";
import { MenuProvider } from "./provider.tsx";
import { File } from "../../types/mod.ts";

interface MenuProviderProps {
  tabs: TabDefinition[];
  children: React.ReactNode;
  iconImageObj?: File;
  [x: string]: unknown;
}

export default function MenuWrapper(props: MenuProviderProps) {
  const { children, iconImageObj } = props;
  return (
    <>
      <MenuProvider iconImageObj={iconImageObj}>
        <PageStackProvider>
          <ThemeComponent />
          <TabButtonProvider>
            <TabsProvider tabs={props.tabs}>
              <ActionBannerProvider>
                {children}
              </ActionBannerProvider>
            </TabsProvider>
          </TabButtonProvider>
        </PageStackProvider>
      </MenuProvider>
    </>
  );
}
