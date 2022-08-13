import { Icon, React, useStyleSheet } from "../../../deps.ts";
import { usePageStack } from "../../../util/page-stack/page-stack.ts";
import styleSheet from "./page.scss.js";

export default function Page({
  title,
  headerTopRight,
  onBack,
  children,
}: {
  title?: any;
  headerTopRight?: any;
  onBack?: () => void;
  children?: any;
}) {
  useStyleSheet(styleSheet);

  const { popPage } = usePageStack();

  return (
    <div className="c-page">
      <div className="header">
        <div className="left">
          <div className="back-icon">
            <Icon
              icon="back"
              color="var(--mm-color-text-bg-primary)"
              onclick={onBack ?? popPage}
            />
          </div>
          <div className="text">{title}</div>
        </div>
        {headerTopRight && <div className="right">{headerTopRight}</div>}
      </div>
      <div className="content">{children}</div>
    </div>
  );
}
