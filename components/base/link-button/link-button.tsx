import { React, useStyleSheet } from "../../../deps.ts";
import styleSheet from "./link-button.scss.js";

export default function LinkButton({
  children,
  onClick,
  className,
}: {
  children?: any;
  onClick?: () => void;
  className?: string;
}) {
  useStyleSheet(styleSheet);
  return (
    <div className={`c-link-button ${className}`} onClick={() => onClick?.()}>
      {children}
    </div>
  );
}
