import { React } from "../../deps.ts"
import MenuBody from './menu-body.tsx'
import MenuProvider from './menu-provider.tsx'


export default function Menu() {

  return <MenuProvider>
    <MenuBody />
  </MenuProvider>
}
