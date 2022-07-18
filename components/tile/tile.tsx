import React from "https://npm.tfl.dev/react";
import root from "https://npm.tfl.dev/react-shadow@19";
import Icon from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/icon/icon.tsx";
import classKebab from "https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js";
import Ripple from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/ripple/ripple.tsx";

export default function Tile(props) {
  const {
    icon,
    iconViewBox,
    headerText,
    content: Content,
    className,
    color,
    onClick,
  } = props;

  let { textColor } = props;
  if (!textColor) textColor = "var(--tfl-color-on-bg-fill)";

  const Header = () => {
    return (
      <div
        className="header"
        style={{
          backgroundColor: color,
          color: textColor,
        }}
      >
        <div
          className="icon"
          style={{
            borderColor: color,
          }}
        >
          <Icon icon={icon} viewBox={iconViewBox} size="24px" color={color} />
        </div>
        <div className="text">{headerText}</div>
      </div>
    );
  };
  return (
    <root.div>
      <link
        rel="stylesheet"
        href={new URL("tile.css", import.meta.url).toString()}
      />
      <div
        className={`c-tile ${className} ${
          classKebab({
            clickable: !!onClick,
          })
        }`}
        onClick={onClick}
      >
        <Header />
        <Content />
        {onClick && <Ripple color={color} />}
      </div>
    </root.div>
  );
}
