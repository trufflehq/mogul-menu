import { React, useStyleSheet, Ripple, getSrcByImageObj } from "../../deps.ts"
import { useMenu } from '../menu/menu-provider.tsx'
import stylesheet from './extension-icon.scss.js'

export default function ExtensionIcon({ $$extensionIconRef, onClick }: { $$extensionIconRef: React.MutableRefObject<HTMLDivElement | null>, onClick: () => void}) {
  const menuContext = useMenu()
  // useStyleSheet(stylesheet)
  const iconImageObj = menuContext?.iconImageObj
  return <div
  className="extension-icon"
  style={{
    backgroundImage: iconImageObj ? `url(${getSrcByImageObj(iconImageObj)})` : undefined,
  }}
  ref={$$extensionIconRef}
  onClick={onClick}
>
  <Ripple color="var(--mm-color-text-bg-primary)" />
</div>
}
