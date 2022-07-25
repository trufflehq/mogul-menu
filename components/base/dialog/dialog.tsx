import { React, Icon } from "../../../deps.ts";
import { useDialog } from "../../dialog-container/dialog-service.ts";
import StyleSheet from "../stylesheet/stylesheet.tsx";

export default function Dialog({
  showClose = true,
  showBack = false,
  actions,
  alignActions = "fill",
  children,
  onClose,
  onBack,
}: {
  showClose?: boolean;
  showBack?: boolean;
  actions?: any[];
  alignActions?: "fill" | "left" | "right";
  children?: any;
  onClose?: () => any;
  onBack?: () => any;
}) {
  const { popDialog } = useDialog();

  const defaultCloseHandler = () => popDialog();
  const defaultBackHandler = () => popDialog();

  const hasTopActions = showClose || showBack;

  return (
    <StyleSheet url={new URL("dialog.css", import.meta.url)}>
      <div className="c-dialog">
        <div className="flex">
          {hasTopActions && (
            <div className="top-actions">
              <div className="back-icon">
                {showBack && (
                  <Icon icon="back" onclick={onBack ?? defaultBackHandler} />
                )}
              </div>
              <div className="close-icon">
                {showClose && (
                  <Icon icon="close" onclick={onClose ?? defaultCloseHandler} />
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
    </StyleSheet>
  );
}
