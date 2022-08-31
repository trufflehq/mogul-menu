import { classKebab, Icon, React, useEffect, useRef, useStyleSheet } from "../../deps.ts";
import { usePageStack } from "./mod.ts";
import FocusTrap from "../focus-trap/focus-trap.tsx";
import styleSheet from "./page.scss.js";

interface PageProps {
  title?: React.ReactNode;
  headerTopRight?: React.ReactNode;
  onBack?: () => void;
  children?: React.ReactNode;
  shouldShowHeader?: boolean;
  shouldDisableEscape?: boolean;
  isFull?: boolean;
}
export default function Page(props: PageProps) {
  useStyleSheet(styleSheet);
  const { shouldShowHeader } = props;
  return (
    shouldShowHeader ? <FocusedTrappedPage {...props} /> : <RawPage {...props} />
  );
}

function RawPage(props: PageProps) {
  const {
    title,
    headerTopRight,
    onBack,
    children,
    shouldShowHeader = true,
    shouldDisableEscape = false,
    isFull = false,
  } = props;

  const $$backIconRef = useRef<HTMLDivElement>(null);

  const { popPage } = usePageStack();
  const handleKeyPress = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    console.log('shouldDisableEscape', shouldDisableEscape)
    if (!shouldDisableEscape) {
      if ((ev.key === "Escape" || ev.key === "Enter" || ev.key === "ArrowLeft")) {
        onBack?.() ?? popPage();
      }
    }
  };
  useEffect(() => {
    if ($$backIconRef?.current) {
      $$backIconRef?.current.focus();
    }
  }, []);

  const handleOnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onBack?.() ?? popPage();
  };

  return (
    <div
      className={`c-page ${
        classKebab({
          isFull,
        })
      }`}
    >
      {shouldShowHeader && (
        <div className="header">
          <div className="left">
            <div
              className="back-icon"
              onClick={handleOnClick}
              onKeyDown={handleKeyPress}
              tabIndex={0}
              ref={$$backIconRef}
            >
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
      )}
      <div className="content">{children}</div>
    </div>
  );
}

export function FocusedTrappedPage(props: PageProps) {
  const { children } = props;
  return (
    <FocusTrap>
      <RawPage {...props}>
        {children}
      </RawPage>
    </FocusTrap>
  );
}
