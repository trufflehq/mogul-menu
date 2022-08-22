import { Icon, React, useEffect, useRef, useStyleSheet } from "../../../deps.ts";
import { usePageStack } from "../../../util/mod.ts";
import FocusTrap from '../../focus-trap/focus-trap.tsx'
import styleSheet from "./page.scss.js";

export default function Page({
  title,
  headerTopRight,
  onBack,
  children,
}: {
  title?: React.ReactNode;
  headerTopRight?: React.ReactNode;
  onBack?: () => void;
  children?: React.ReactNode;
}) {
  const $$backIconRef = useRef<HTMLDivElement>(null)
  useStyleSheet(styleSheet);

  const { popPage } = usePageStack();
  const handleKeyPress = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    if((ev.key === 'Escape' || ev.key === 'Enter' || ev.key === 'ArrowLeft')) {
      onBack?.() ?? popPage();
    }
  }
  useEffect(() => {
    if($$backIconRef?.current) {
      $$backIconRef?.current.focus()
    }
  }, [])

  const handleOnClick = () => {
    onBack?.() ?? popPage()
  }

  return (
  <FocusTrap>
    <div className="c-page">
      <div className="header">
        <div className="left">
          <div className="back-icon" onClick={handleOnClick} onKeyDown={handleKeyPress} tabIndex={0} ref={$$backIconRef}>
            <Icon
              icon="back"
              color="var(--mm-color-text-bg-primary)"
              onclick={handleOnClick}
            />
          </div>
          <div className="text">{title}</div>
        </div>
        {headerTopRight && <div className="right">{headerTopRight}</div>}
      </div>
      <div className="content">{children}</div>
    </div>
  </FocusTrap>
  );
}
