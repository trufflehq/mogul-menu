import { _, createContext, useContext, React } from "../../deps.ts";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";
import {
  ActionBannerProvider,
  PageStackProvider,
  TabButtonProvider,
  TabStateProvider,
} from "../../util/mod.ts";
interface MenuProviderProps {
  children: React.ReactNode;
  iconImageObj?: any
  [x: string]: unknown
}

type MenuContext = Omit<MenuProviderProps, 'children'>

export const MenuContext = createContext<MenuContext>(undefined!);
export function MenuProvider({ children }: { children: React.ReactNode }) {

  return <MenuContext.Provider value={{}}>
    {
      children
    }
  </MenuContext.Provider>
}

export function useMenu() {
  const context = useContext(MenuContext)

  return context
}

export default function MenuWrapper({ children }: MenuProviderProps) {
  return (
    <>
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
    </>
  );
}
