import { React, useState } from "../../../deps.ts";
import StyleSheet from "../stylesheet/stylesheet.tsx";

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
  gray: {
    "--background": "var(--mm-color-bg-secondary)",
    "--text-color": "var(--mm-color-text-bg-secondary)",
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
  shouldHandleLoading = true,
  style = "gray",
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
  onClick?: (...args: any) => any;
  size?: keyof typeof sizeStyles;
}) {
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
    <StyleSheet url={new URL("./button.css", import.meta.url)}>
      <button
        disabled={_isDisabled}
        className="c-button"
        onClick={clickHandler}
        style={styles}
      >
        {isLoading ? "Loading" : children}
      </button>
    </StyleSheet>
  );
}
