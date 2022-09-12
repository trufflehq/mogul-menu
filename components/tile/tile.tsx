import { React, useStyleSheet, Icon, Ripple, classKebab } from "../../deps.ts";
import styleSheet from "./tile.scss.js";

export default function Tile(props) {
  useStyleSheet(styleSheet);
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
  if (!textColor) textColor = "var(--mm-color-text-bg-primary)";

  return (
    <div
      className={`c-tile ${className} ${classKebab({
        clickable: !!onClick,
      })}`}
      onClick={onClick}
    >
      <TileHeader
        backgroundColor={color}
        textColor={textColor}
        borderColor={color}
        icon={icon}
        iconViewBox={iconViewBox}
        iconColor={color}
        text={headerText}
      />
      <Content />
      {onClick && <Ripple color={color} />}
    </div>
  );
}

function TileHeader({
  backgroundColor,
  textColor,
  borderColor,
  text,
  icon,
  iconViewBox,
  iconColor,
}: {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  text: string;
  icon: string;
  iconViewBox: number;
  iconColor: string;
}) {
  return (
    <div
      className="header"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div
        className="icon"
        style={{
          borderColor,
        }}
      >
        <Icon icon={icon} viewBox={iconViewBox} size="24px" color={iconColor} />
      </div>
      <div className="text">{text}</div>
    </div>
  );
}
