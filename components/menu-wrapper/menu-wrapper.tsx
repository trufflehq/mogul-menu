import { React } from '../../deps.ts'
import { PageStackProvider } from '../../util/mod.ts'
import BrowserExtensionMenu from '../menu/menu.tsx'
export default function MenuWrapper() {

  return <PageStackProvider>
    <BrowserExtensionMenu />
  </PageStackProvider>
}