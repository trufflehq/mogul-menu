import { React, useState, useStyleSheet } from "../../../deps.ts";
import styleSheet from "./button.scss.js";

const buttonStyles = {
  primary: {
    "--background": "var(--mm-color-primary)",
    "--text-color": "var(--mm-color-text-primary)",
    "--border-color": "transparent",
  },
  secondary: {
    "--background": "var(--mm-color-secondary)",
    "--text-color": "var(--mm-color-text-secondary)",
    "--border-color": "transparent",
  },
  gradient: {
    "--background": "var(--mm-gradient)",
    "--text-color": "var(--mm-color-text-gradient)",
    "--border-color": "transparent",
  },
  error: {
    "--background": "var(--mm-color-error)",
    "--text-color": "var(--mm-color-text-error)",
    "--border-color": "transparent",
  },
  positive: {
    "--background": "var(--mm-color-positive)",
    "--text-color": "var(--mm-color-text-positive)",
    "--border-color": "transparent",
  },
  "bg-primary": {
    "--background": "var(--mm-color-bg-primary)",
    "--text-color": "var(--mm-color-text-bg-primary)",
    "--border-color": "transparent",
  },
  "bg-secondary": {
    "--background": "var(--mm-color-bg-secondary)",
    "--text-color": "var(--mm-color-text-bg-secondary)",
    "--border-color": "transparent",
  },
  "bg-tertiary": {
    "--background": "var(--mm-color-bg-tertiary)",
    "--text-color": "var(--mm-color-text-bg-tertiary)",
    "--border-color": "transparent",
  },
};

const sizeStyles = {
  small: {
    "--padding": "8px 16px",
    "--font-size": "12px",
    "--font-weight": "500",
  },
  normal: {
    "--padding": "10px 20px",
    "--font-size": "14px",
    "--font-weight": "600",
  },
};

export default function Button({
  children = "Click me",
  shouldHandleLoading = false,
  style = "bg-secondary",
  border = false,
  isDisabled = false,
  onClick = () => null,
  size = "normal",
}: {
  children?: any;
  shouldHandleLoading?: boolean;
  style?: keyof typeof buttonStyles;
  border?: boolean;
  isDisabled?: boolean;
  onClick?: () => any;
  size?: keyof typeof sizeStyles;
}) {
  useStyleSheet(styleSheet);
  const [isLoading, setIsLoading] = useState(false);
  const _isDisabled = isDisabled || (shouldHandleLoading && isLoading);

  const clickHandler = async () => {
    if (_isDisabled) return;

    if (shouldHandleLoading) {
      setIsLoading(true);
    }

    await onClick();

    if (shouldHandleLoading) {
      setIsLoading(false);
    }
  };

  const styles = {
    ...buttonStyles[style],
    ...sizeStyles[size],
  };

  if (border) styles["--border-color"] = "rgb(255, 255, 255, 0.16)";

  return (
    <button
      disabled={_isDisabled}
      className="c-button"
      onClick={clickHandler}
      style={styles}
    >
      {isLoading ? "Loading" : children}
    </button>
  );
}
