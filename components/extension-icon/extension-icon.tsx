import { React, useStyleSheet, Ripple, getSrcByImageObj } from "../../deps.ts"
import { useMenu, getMenuIconImageObj } from '../../util/mod.ts'
import stylesheet from './extension-icon.scss.js'

export default function ExtensionIcon({ $$extensionIconRef }: { $$extensionIconRef: React.MutableRefObject<HTMLDivElement | null>}) {
  const { store, toggleOpen }  = useMenu()

  const onExtensionIconClick = () => {
    toggleOpen()
  }

  useStyleSheet(stylesheet)
  const iconImageObj = getMenuIconImageObj(store)
  return <div
  className="c-extension-icon"
  style={{
    backgroundImage: iconImageObj ? `url(${getSrcByImageObj(iconImageObj)})` : undefined,
  }}
  ref={$$extensionIconRef}
  onClick={onExtensionIconClick}
>
  <Ripple color="var(--mm-color-text-bg-primary)" />
</div>
}
