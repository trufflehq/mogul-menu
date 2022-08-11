import {
  React,
  classKebab,
  useStyleSheet,
  _,
  getSrcByImageObj,
} from "../../deps.ts";
import styleSheet from "./channel-points.scss.js";

// TODO: simplify this by using slug=timer component
// we could probably add something for timer to count up too?
export default function ChannelPointsClaim({
  hasText,
  hasChannelPoints,
  hasBattlePass,
  darkChannelPointsImageObj,
  highlightButtonBg,
  onClick,
}: {
  hasText?: boolean;
  hasChannelPoints?: boolean;
  hasBattlePass?: boolean;
  darkChannelPointsImageObj?: any;
  highlightButtonBg?: any;
  onClick?: () => void;
}) {
  useStyleSheet(styleSheet);

  const isClaimButtonVisible = true;

  // const channelPointsSrc = model.image.getSrcByImageObj(channelPointsImageObj) ?? 'https://cdn.bio/assets/images/features/chrome_extension/channel-points-default.svg'
  const darkChannelPointsSrc =
    (darkChannelPointsImageObj &&
      getSrcByImageObj(darkChannelPointsImageObj)) ||
    "https://cdn.bio/assets/images/features/browser_extension/channel-points-default-dark.svg";
  const fullTitle =
    hasChannelPoints && hasBattlePass
      ? "Claim points & XP"
      : hasChannelPoints
      ? "Claim points"
      : hasBattlePass
      ? "Claim XP"
      : "Claim";

  const shortTitle = hasChannelPoints
    ? "Claim points"
    : hasBattlePass
    ? "Claim XP"
    : "Claim";

  return (
    <div className="c-channel-points" title={fullTitle}>
      {
        <div
          className={`claim ${classKebab({
            hasText,
            isVisible: isClaimButtonVisible,
          })}`}
          style={{
            background: highlightButtonBg,
            // backgroundColor: cssVars.$tertiaryBase,
          }}
          onClick={onClick}
        >
          <div className="icon">
            <img src={darkChannelPointsSrc} width="16" />
          </div>
          {hasText && <div className="title">{shortTitle}</div>}
        </div>
      }
    </div>
  );
}
