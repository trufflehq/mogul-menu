import { Icon, React, useRef, useEffect, useStyleSheet } from "../../../deps.ts";
import { useDialog } from "../dialog-container/dialog-service.ts";
import FocusTrap from '../../focus-trap/focus-trap.tsx'
import styleSheet from "./dialog.scss.js";

const HEADER_STYLES = {
  default: {
    "--background": "transparent",
    "--text-color": "var(--mm-color-text-bg-secondary)",
  },
  primary: {
    "--background": "var(--mm-color-primary)",
    "--text-color": "var(--mm-color-text-primary)",
  },
  secondary: {
    "--background": "var(--mm-color-secondary)",
    "--text-color": "var(--mm-color-text-secondary)",
  },
};

export default function Dialog({
  showClose = true,
  showBack = false,
  actions,
  alignActions = "fill",
  children,
  onClose,
  onBack,
  headerStyle = "default",
  headerText,
}: {
  showClose?: boolean;
  showBack?: boolean;
  actions?: any[];
  alignActions?: "fill" | "left" | "right";
  children?: any;
  onClose?: () => any;
  onBack?: () => any;
  headerStyle?: "default" | "primary" | "secondary";
  headerText?: any;
}) {
  const $$closeIconRef = useRef<HTMLDivElement>(null)
  useStyleSheet(styleSheet);
  const { popDialog } = useDialog();

  const defaultCloseHandler = () => popDialog();
  const defaultBackHandler = () => popDialog();

  const hasTopActions = showClose || showBack;

  const selectedStyles = HEADER_STYLES[headerStyle];

  const handleKeyPress = (ev: KeyboardEvent) => {
    if(ev.key === 'Escape') {
      popDialog();
    } else if(ev.key === 'Enter') {
      popDialog();
    }
  }
  useEffect(() => {
    if($$closeIconRef?.current) {
      $$closeIconRef?.current.focus()
    }

    document.addEventListener('keydown', handleKeyPress, false)

    return () => {
      document.removeEventListener('keydown', handleKeyPress, false)
    }
  }, [])

  return (
    <FocusTrap>
      <div className="c-dialog">
        <div className="flex">
          {hasTopActions && (
            <div className="top-actions" style={selectedStyles}>
              <div className="left">
                {showBack && (
                  <Icon
                    icon="back"
                    color={selectedStyles["--text-color"]}
                    onclick={onBack ?? defaultBackHandler}
                  />
                )}
                <div className="mm-text-subtitle-1">{headerText}</div>
              </div>
              <div className="right">
                {showClose && (
                  <div className="close" tabIndex={0} ref={$$closeIconRef}>
                    <Icon
                      icon="close"
                      color={selectedStyles["--text-color"]}
                      onclick={onClose ?? defaultCloseHandler}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="content">{children}</div>
          {actions && <div className={`bottom-actions ${alignActions}`}>{actions}</div>}
        </div>
      </div>
    </FocusTrap>
  );
}
