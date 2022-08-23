import {
  React,
  classKebab,
  useStyleSheet,
  _,
  getSrcByImageObj,
} from "../../deps.ts";
import { CollapsibleTabButton } from '../tab-bar/tab-bar.tsx'
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
    <CollapsibleTabButton onClick={onClick} collapsedIcon={<CollapsedChannelPointsButton highlightButtonBg={highlightButtonBg} />}>
      <div className={`c-channel-points`} title={fullTitle}>
        {
          <div
            className={`claim ${classKebab({
              hasText,
              isVisible: isClaimButtonVisible,
            })}`}
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
    </CollapsibleTabButton>
  );
}

function CollapsedChannelPointsButton({ highlightButtonBg }: { highlightButtonBg?: string}) {
  const darkChannelPointsSrc = "https://cdn.bio/assets/images/features/browser_extension/channel-points-default-dark.svg";
  return <div className="c-collapsed-channel-points"
    style={{
      background: highlightButtonBg,
    }}
  >
     <div className="icon">
        <img src={darkChannelPointsSrc} width="16" />
      </div>
  </div>
}
