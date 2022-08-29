import { _, React } from "../../deps.ts";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";

import { ActionBannerProvider } from "../action-banner/mod.ts";
import { TabButtonProvider, TabsProvider } from "../tabs/mod.ts";
import { PageStackProvider } from "../page-stack/mod.ts";
import { MenuProvider } from "./provider.tsx";
import { File } from "../../types/mod.ts";

interface MenuProviderProps {
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
            <TabsProvider>
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
