import { _, React } from "../../deps.ts";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";
import {
  ActionBannerProvider,
  MenuProvider,
  PageStackProvider,
  TabButtonProvider,
  TabStateProvider,
} from "../../util/mod.ts";
import { File } from '../../types/mod.ts'
interface MenuProviderProps {
  children: React.ReactNode;
  iconImageObj?: File;
  [x: string]: unknown;
}

export default function MenuWrapper(props: MenuProviderProps) {
  const { children, iconImageObj  } = props
  return (
    <>
      <MenuProvider iconImageObj={iconImageObj}>
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
