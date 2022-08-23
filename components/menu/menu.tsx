import { React } from "../../deps.ts"
import MenuBody from './menu-body.tsx'
import MenuProvider from './menu-provider.tsx'
import { File } from '../../types/mod.ts'

interface MogulMenuProps {
  iconImageObj: File
}
export default function Menu(props: MogulMenuProps) {
  return <MenuProvider {...props}>
    <MenuBody />
  </MenuProvider>
}
