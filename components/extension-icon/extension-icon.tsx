import { React, useStyleSheet, Ripple, getSrcByImageObj } from "../../deps.ts"
import { useMenu } from '../../util/mod.ts'
import stylesheet from './extension-icon.scss.js'

export default function ExtensionIcon({ $$extensionIconRef }: { $$extensionIconRef: React.MutableRefObject<HTMLDivElement | null>}) {
  const { toggleOpen }  = useMenu()

  const onExtensionIconClick = () => {
    toggleOpen()
  }

  // useStyleSheet(stylesheet)
  const iconImageObj =  undefined // menuContext?.iconImageObj
  return <div
  className="extension-icon"
  style={{
    backgroundImage: iconImageObj ? `url(${getSrcByImageObj(iconImageObj)})` : undefined,
  }}
  ref={$$extensionIconRef}
  onClick={onExtensionIconClick}
>
  <Ripple color="var(--mm-color-text-bg-primary)" />
</div>
}
