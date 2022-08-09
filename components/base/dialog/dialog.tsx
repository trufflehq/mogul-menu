import { React, Icon, useStyleSheet } from "../../../deps.ts";
import { useDialog } from "../dialog-container/dialog-service.ts";
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
  useStyleSheet(styleSheet);
  const { popDialog } = useDialog();

  const defaultCloseHandler = () => popDialog();
  const defaultBackHandler = () => popDialog();

  const hasTopActions = showClose || showBack;

  const selectedStyles = HEADER_STYLES[headerStyle];

  return (
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
                <Icon
                  icon="close"
                  color={selectedStyles["--text-color"]}
                  onclick={onClose ?? defaultCloseHandler}
                />
              )}
            </div>
          </div>
        )}
        <div className="content">{children}</div>
        {actions && (
          <div className={`bottom-actions ${alignActions}`}>{...actions}</div>
        )}
      </div>
    </div>
  );
}
