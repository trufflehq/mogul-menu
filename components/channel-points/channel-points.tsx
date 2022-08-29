import { _, classKebab, getSrcByImageObj, React, useStyleSheet } from "../../deps.ts";
import { FileRel } from "../../types/mod.ts";
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
  darkChannelPointsImageObj?: FileRel;
  highlightButtonBg?: string;
  onClick?: () => void;
}) {
  useStyleSheet(styleSheet);

  const darkChannelPointsSrc = (darkChannelPointsImageObj &&
    getSrcByImageObj(darkChannelPointsImageObj)) ||
    "https://cdn.bio/assets/images/features/browser_extension/channel-points-default-dark.svg";
  const fullTitle = hasChannelPoints && hasBattlePass
    ? "Claim points & XP"
    : hasChannelPoints
    ? "Claim points"
    : hasBattlePass
    ? "Claim XP"
    : "Claim";

  const shortTitle = hasChannelPoints ? "Claim points" : hasBattlePass ? "Claim XP" : "Claim";

  return (
    <div className={`c-channel-points`} onClick={onClick} title={fullTitle}>
      {
        <div
          className={`claim ${
            classKebab({
              hasText,
            })
          }`}
          style={{
            background: highlightButtonBg,
          }}
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
