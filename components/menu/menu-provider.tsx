import { _, React } from "../../deps.ts";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";
import {
  ActionBannerProvider,
  MenuProvider,
  PageStackProvider,
  TabButtonProvider,
  TabStateProvider,
} from "../../util/mod.ts";
interface MenuProviderProps {
  children: React.ReactNode;
  iconImageObj?: any;
  [x: string]: unknown;
}

export default function MenuWrapper({ children }: MenuProviderProps) {
  return (
    <>
      <MenuProvider>
        <PageStackProvider>
          <ThemeComponent />
          <TabButtonProvider>
            <TabStateProvider>
              <ActionBannerProvider>
                {children}
              </ActionBannerProvider>
            </TabStateProvider>
          </TabButtonProvider>
        </PageStackProvider>
      </MenuProvider>
    </>
  );
}
