import {
  React,
  useObservables,
  useRef,
  classKebab,
  getSrcByImageObj,
  hexOpacity,
  rgb2rgba,
  useStyleSheet,
} from "../../deps.ts";
import { UnlockedIcon } from "../unlocked-icon/unlocked-icon.tsx";
import { LockedIcon } from "../locked-icon/locked-icon.tsx";

import styleSheet from "./season-pass-reward.scss.js";

export default function Reward({
  selectedRewardStream,
  premiumAccentColor,
  premiumBgColor,
  onClick,
  isUnlocked,
  reward,
  level,
  tierNum,
}) {
  useStyleSheet(styleSheet);
  const { selectedReward } = useObservables(() => ({
    selectedReward: selectedRewardStream.obs,
  }));

  const $$ref = useRef();

  let isRewardSelected;

  if (selectedReward?.level) {
    isRewardSelected =
      reward &&
      selectedReward?.sourceId === reward.sourceId &&
      selectedReward?.level === level;
  } else {
    isRewardSelected = reward && selectedReward?.sourceId === reward.sourceId;
  }

  const isFreeReward = tierNum === 0;
  const isPaidReward = tierNum === 1;
  const isFreeUnlocked = isUnlocked && isFreeReward;
  const isPaidUnlocked = isUnlocked && isPaidReward;
  const rewardAmountValue = reward?.amountValue;

  const rewardClassname = isPaidReward ? "paid" : "free";

  return (
    <div
      className={`c-reward ${rewardClassname} ${classKebab({
        isSelected: isRewardSelected,
        isFreeUnlocked,
        isPaidUnlocked,
        hasTooltip: Boolean(reward),
      })}`}
      ref={$$ref}
      onClick={(e) => {
        onClick(reward, $$ref, tierNum);
      }}
    >
      <style>
        {`
      .c-reward.is-paid-unlocked {
        background: ${premiumAccentColor};
      }

      .c-reward.paid {
        background: ${premiumBgColor};
        border-color: ${premiumAccentColor};
      }

      .c-reward.paid.has-tooltip:not(.is-selected):hover {
        background-color: ${
          premiumBgColor.indexOf("#") !== -1
            ? hexOpacity(premiumBgColor, 0.7)
            : rgb2rgba(premiumBgColor, 0.7)
        }!important;
      }
  `}
      </style>
      <div className="status-icon">
        {reward && (isUnlocked ? <UnlockedIcon /> : <LockedIcon />)}
      </div>
      <div className="inner">
        {reward?.source?.fileRel?.fileObj && (
          <div className="image">
            <img src={getSrcByImageObj(reward?.source.fileRel.fileObj)} />
          </div>
        )}
        <div className="name">
          {rewardAmountValue
            ? `x${rewardAmountValue} ${reward?.source?.name}`
            : reward?.source?.name}
        </div>
      </div>
    </div>
  );
}
