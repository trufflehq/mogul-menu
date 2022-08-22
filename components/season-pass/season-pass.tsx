import {
  getSrcByImageObj,
  gql,
  React,
  useQuery,
  useStyleSheet,
} from "../../deps.ts";

import _ from "https://npm.tfl.dev/lodash?no-check";
import { useEffect, useMemo, useRef } from "https://npm.tfl.dev/react";

import { createSubject } from "https://tfl.dev/@truffle/utils@~0.0.2/obs/subject.ts";
import useObservables from "https://tfl.dev/@truffle/utils@~0.0.2/obs/use-observables-react.ts";
import { zeroPrefix } from "https://tfl.dev/@truffle/utils@~0.0.2/legacy/format/format.ts";
import classKebab from "https://tfl.dev/@truffle/utils@~0.0.2/legacy/class-kebab.ts";

import {
  getLevelBySeasonPassAndXp,
  getXPBarBySeasonPassAndXp,
} from "../../util/season-pass/season-pass.js";
import { useDialog } from "../base/dialog-container/dialog-service.ts";

import UnlockedEmoteDialog from "../dialogs/unlocked-emote-dialog/unlocked-emote-dialog.tsx";
import RedeemableDialog from "../dialogs/redeemable-dialog/redeemable-dialog.tsx";
import ItemDialog from "../dialogs/item-dialog/item-dialog.tsx";

import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/image-by-aspect-ratio/image-by-aspect-ratio.tsx";
import Icon from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/icon/icon.tsx";
import AccountAvatar from "../account-avatar/account-avatar.tsx";
// import { setActiveTab, useTabStateManager } from "../../util/mod.ts";
import { useTabState } from "../../util/mod.ts";
import Dialog from "../base/dialog/dialog.tsx";
import Button from "../base/button/button.tsx";

import styleSheet from "./season-pass.scss.js";
import DefaultDialogContentFragment from "../dialogs/content-fragments/default/default-dialog-content-fragment.tsx";
import { useSeasonPassData } from "./season-pass-data.ts";
import { useTestSeasonPassData } from "./season-pass-data-test.ts";
import Reward from "../season-pass-reward/season-pass-reward.tsx";
import { LockedIcon } from "../locked-icon/locked-icon.tsx";

const GREEN = "#75DB9E";
const YELLOW = "#EBC564";

const ME_QUERY = gql`
  query MeQuery {
    me {
      id
      name
      email
      phone
    }
  }
`;

export default function SeasonPass(props) {
  useStyleSheet(styleSheet);
  const {
    shouldUseCurrentLevelZeroPrefix,
    shouldUseLevelsZeroPrefix,
    premiumAccentColor,
    premiumBgColor = "",
    freeTierText,
    premiumTierText,
    numTiles = 4,
    xpImageObj,
    highlightButtonBg,
    // onViewCollection,
    enqueueSnackBar,
  } = props;

  const [{ data: meData }] = useQuery({ query: ME_QUERY });
  const me = meData?.me;

  const $$levelsRef = useRef(null);
  const $$levelRef = useRef(null);
  const { focalIndexStream, selectedRewardStream } = useMemo(() => {
    return {
      focalIndexStream: createSubject(0),
      selectedRewardStream: createSubject(),
    };
  }, []);

  const { meOrgUserWithKv, focalIndex } = useObservables(() => ({
    // org: getModel().org.getMe(),
    focalIndex: focalIndexStream.obs,
    // meOrgUserWithKv: getModel().orgUser.getMeWithKV(),
  }));

  // const seasonPass = {
  //   daysRemaining: 30,
  //   levels: [{ minXp: 5 }, { minXp: 15 }],
  //   xp: 10,
  // };

  const {
    data: seasonPassData,
    fetching: isFetchingSeasonPass,
    error: seasonPassFetchError,
  } = useTestSeasonPassData();

  const seasonPass = seasonPassData?.seasonPass;

  // if (!seasonPass) {
  //   return (
  //     <div className="c-season-pass">
  //       <Spinner />
  //     </div>
  //   );
  // }

  const currentLevelNum = seasonPass
    ? getLevelBySeasonPassAndXp(seasonPass, seasonPass?.xp)?.levelNum || 0
    : 0;

  const { range, progress } = seasonPass
    ? getXPBarBySeasonPassAndXp(seasonPass, seasonPass?.xp)
    : { range: 0, progress: 0 };

  // console.log({ range, progress, xp: seasonPass?.xp });

  const tiers = seasonPass?.data?.tiers;

  const levels = seasonPass?.levels;

  // const { range, progress } = { range: 0, progress: 0 };

  const groupedLevels = _.keyBy(seasonPass?.levels, "levelNum");

  // need levels to be sequential from min to max
  const minLevelNum = _.minBy(seasonPass?.levels, "levelNum")?.levelNum;
  const maxLevelNum = _.maxBy(seasonPass?.levels, "levelNum")?.levelNum;

  const endRange = numTiles > maxLevelNum ? numTiles : maxLevelNum;

  const levelRange = _.range(minLevelNum, endRange + minLevelNum);

  useEffect(() => {
    if (currentLevelNum && numTiles) {
      if (currentLevelNum < numTiles) {
        focalIndexStream.next(0);
      } else if (currentLevelNum + numTiles - 1 > levelRange?.length) {
        focalIndexStream.next(levelRange?.length - numTiles);
      } else {
        focalIndexStream.next(currentLevelNum - 1);
      }
    }
  }, [currentLevelNum]);

  const onLeftClick = () => {
    if (focalIndex - numTiles < 0) {
      focalIndexStream.next(0);
    } else {
      focalIndexStream.next(focalIndex - numTiles);
    }
    selectedRewardStream.next();
  };

  const onRightClick = () => {
    if (focalIndex + numTiles * 2 > levelRange?.length) {
      focalIndexStream.next(levelRange?.length - numTiles);
    } else {
      focalIndexStream.next(focalIndex + numTiles);
    }
    selectedRewardStream.next();
  };

  // TODO: detect when user levels up
  useEffect(() => {
    if (!_.isEmpty(seasonPass?.seasonPassProgression?.changesSinceLastViewed)) {
      _.map(
        seasonPass?.seasonPassProgression?.changesSinceLastViewed,
        (change) => {
          console.log({ change });
          const Component =
            change?.rewards?.length > 1
              ? MultipleRewardLevelUpDialog
              : LevelUpDialog;
        }
      );
    }
  }, [seasonPass?.seasonPassProgression?.changesSinceLastViewed]);

  // since the focal index starts at zero, check if we are at the left boundary
  const isNotLeftClickable = focalIndex - numTiles <= -numTiles;

  // check to see if we are at a right boundary
  const isNotRightClickable = focalIndex + numTiles >= levelRange?.length;

  const isMember = me?.phone || me?.email;

  const visibleLevels = _.slice(levelRange, focalIndex, focalIndex + numTiles);

  const tierNums = _.uniqBy(
    _.flatten(
      _.map(seasonPass?.levels, (level) => _.map(level.rewards, "tierNum"))
    )
  );

  const userTierNum = seasonPass?.seasonPassProgression?.tierNum;
  const xpSrc = xpImageObj
    ? getSrcByImageObj(xpImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/xp.svg";

  return (
    <div className="c-browser-extension-season-pass">
      {seasonPass && (
        <>
          <div className="top-info">
            <div className="left">
              {isMember && (
                <>
                  <div className="account">
                    <AccountAvatar size="72px" />
                  </div>
                  <div className="level-progress">
                    <div className="xp">
                      <div className="icon">
                        <ImageByAspectRatio
                          imageUrl={xpSrc}
                          aspectRatio={1}
                          widthPx={24}
                          height={24}
                        />
                      </div>
                      <div className="amount">{`${progress}/${range}`}</div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="filler"
                        style={{
                          width: `calc(${(progress / range) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="level">
                      {`Level ${
                        shouldUseCurrentLevelZeroPrefix
                          ? zeroPrefix(currentLevelNum)
                          : currentLevelNum
                      }`}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {true && (
            <div className="pages">
              <div
                className={`button left ${classKebab({
                  isDisabled: isNotLeftClickable,
                })}`}
                onClick={onLeftClick}
              >
                ◂
              </div>
              <div className="days">
                {`Ends in ${seasonPass?.daysRemaining} days`}
              </div>
              <div
                className={`button right ${classKebab({
                  isDisabled: isNotRightClickable,
                })}`}
                onClick={onRightClick}
              >
                ▸
              </div>
            </div>
          )}
          <div className="action-levels-wrapper">
            <div
              className="levels-wrapper"
              ref={$$levelsRef}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {tiers?.length ? (
                <div className="tier-info">
                  {_.map(tiers, (tier) => {
                    console.log("tier", tier);
                    return (
                      tier?.name && (
                        <div
                          className="tier"
                          style={{
                            background: tier?.background,
                          }}
                        >
                          {tier?.name}
                        </div>
                      )
                    );
                  })}
                </div>
              ) : null}
              <div
                className="levels"
                style={{
                  // 165 is in the css. we should probably make a prop and css var in here
                  gridTemplateColumns: `repeat(${numTiles}, 1fr)`,
                }}
              >
                {_.map(visibleLevels, (levelNum) => {
                  return (
                    <$level
                      key={levelNum}
                      abc="def"
                      level={groupedLevels[levelNum]}
                      tierNums={tierNums}
                      userTierNum={userTierNum}
                      tiers={tiers}
                      $$levelRef={$$levelRef}
                      shouldUseLevelsZeroPrefix={shouldUseLevelsZeroPrefix}
                      premiumAccentColor={premiumAccentColor}
                      premiumBgColor={premiumBgColor}
                      selectedRewardStream={selectedRewardStream}
                      currentLevelNum={currentLevelNum}
                      xpRange={range}
                      xpProgress={progress}
                      xpImgSrc={xpSrc}
                      xp={seasonPass?.xp?.count ?? 0}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LevelUpDialog({}) {
  return (
    <Dialog>
      <DefaultDialogContentFragment primaryText="Level up!" />
    </Dialog>
  );
}

function MultipleRewardLevelUpDialog({}) {
  return (
    <Dialog>
      <DefaultDialogContentFragment primaryText="Multiple levels up!" />
    </Dialog>
  );
}

export function $level(props) {
  const {
    level,
    tierNums,
    tiers,
    userTierNum,
    $$levelRef,
    shouldUseLevelsZeroPrefix,
    premiumAccentColor,
    premiumBgColor,
    selectedRewardStream,
    currentLevelNum,
    xp,
    xpImgSrc,
  } = props;

  const isCurrentLevel = currentLevelNum === level.levelNum;
  const { pushDialog, popDialog } = useDialog();
  // const { dispatch } = useTabStateManager()
  const { setActiveTab } = useTabState();

  const onRewardClick = (reward, $$rewardRef, tierNum) => {
    if (reward) {
      const isUnlocked = reward && currentLevelNum >= level.levelNum;
      const isEmote = reward?.source?.type === "emote";
      const isRedeemable = reward?.source?.type === "redeemable";
      const minXp = level.minXp;
      selectedRewardStream.next({ sourceId: reward?.sourceId, level });
      // this series of if statements categorize different rewards
      // and displays the appropriate dialog for each
      // if the user hasn't unlocked the item yet
      if (!isUnlocked) {
        pushDialog(
          <LockedRewardDialog
            reward={reward}
            xpImgSrc={xpImgSrc}
            minXp={minXp}
            xp={xp}
          />
        );
        // if the user clicked on an emote
      } else if (isEmote) {
        pushDialog(<UnlockedEmoteDialog reward={reward} />);
        // if the user clicked on a redeemable
      } else if (isRedeemable) {
        pushDialog(<RedeemableDialog redeemableCollectible={reward} />);
      } else {
        pushDialog(
          <ItemDialog
            displayMode="center"
            imgRel={reward?.source?.fileRel}
            primaryText={`You unlocked a ${reward?.source?.name}`}
            secondaryText=""
            buttons={[
              {
                text: "Close",
                borderRadius: "4px",
                bg: cssVars.$tertiaryBase,
                textColor: cssVars.$tertiaryBaseText,
                onClick: popDialog,
              },
              {
                text: "View collection",
                borderRadius: "4px",
                style: "primary",
                onClick: () => {
                  popDialog();
                  setActiveTab("collection");
                },
              },
            ]}
            onExit={popDialog}
          />
        );
      }
    }
  };

  return (
    <div className={`level ${classKebab({ isCurrentLevel })}`} ref={$$levelRef}>
      <div className="number">
        Level{" "}
        {shouldUseLevelsZeroPrefix
          ? zeroPrefix(level.levelNum)
          : level.levelNum}
      </div>
      {_.map(tierNums, (tierNum) => {
        const reward = _.find(level.rewards, { tierNum });
        const tierName = tiers?.[tierNum];

        const isValidTierNum = userTierNum >= reward?.tierNum;
        const isUnlockedLevel = currentLevelNum >= level.levelNum;
        const isUnlocked = reward && isValidTierNum && isUnlockedLevel;

        return (
          <div
            key={tierNum}
            className={`reward tier-${tierNum} ${classKebab({
              isFirstWithTierName:
                tierNum === tierNums?.length - 1 && Boolean(tierName), // FIXME this is a hack for Faze reverse bp order
              hasTierName: Boolean(tierName),
            })}`}
          >
            <Reward
              selectedRewardStream={selectedRewardStream}
              premiumAccentColor={premiumAccentColor}
              premiumBgColor={premiumBgColor}
              onClick={onRewardClick}
              isUnlocked={isUnlocked}
              reward={reward}
              tierNum={tierNum}
              level={level}
            />
          </div>
        );
      })}
    </div>
  );
}

function NoItemLevelUpDialog({
  $title,
  $children,
  onViewCollection,
  headerText,
  highlightBg,
}) {
  const { popDialog } = useDialog();

  return (
    <div className="c-unlocked-emote-reward-dialog use-css-vars-creator">
      <ItemDialog
        displayMode="center"
        $title={$title}
        $children={$children}
        headerText={headerText}
        highlightBg={highlightBg}
        primaryText="No item for this level"
        buttons={[
          {
            text: "Close",
            borderRadius: "4px",
            bg: cssVars.$tertiaryBase,
            textColor: cssVars.$tertiaryBaseText,
            onClick: popDialog,
          },
        ]}
        onExit={popDialog}
      />
    </div>
  );
}

export function LockedRewardDialog({ reward, xp, minXp, xpImgSrc }) {
  const { popDialog } = useDialog();
  const isEmote = reward?.source?.type === "emote";
  return (
    <div className="c-locked-reward-item-dialog">
      <Dialog
        actions={[
          <Button style="bg-tertiary" onClick={popDialog}>
            Close
          </Button>,
        ]}
      >
        <div className="body">
          <div className="image">
            <img
              src={getSrcByImageObj(reward?.source?.fileRel?.fileObj)}
              width="56"
            />
          </div>
          <div className="info">
            <div className="name">
              <div className="text mm-text-subtitle-1">
                {reward?.source?.name}
              </div>
              <LockedIcon />
            </div>
            <div className="value-container">
              <ImageByAspectRatio
                imageUrl={xpImgSrc}
                aspectRatio={1}
                widthPx={18}
                height={18}
              />
              <div>
                {xp}/{minXp}
              </div>
            </div>
            <div className="description mm-text-body-2">
              {reward?.description ??
                (isEmote &&
                  `Unlock the ${reward?.source?.name} emote to use in chat`)}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export function $rewardTooltip({
  name,
  description,
  imageFileObj,
  premiumAccentColor,
}) {
  // const { breakpoint } = useObservables(() => ({
  //   breakpoint: browser.getBreakpointStream().obs,
  // }));

  const breakpoint = "desktop";

  const imageUrl =
    "https://cdn.bio/ugc/collectible/2cb65a70-8449-11ec-a3ff-5ff20225f34b.svg";

  const isMobile = breakpoint === "mobile";
  return (
    <div className="c-reward-tooltip">
      <style>
        {isMobile
          ? `
      .c-reward-tooltip > .title {
        background: ${premiumAccentColor};
      }

      .c-reward-tooltip::after {
        position: absolute;
        right: calc(50% - 8px);
        // top: calc(25% - 8px);
        bottom: -8px;
        content: '';
        width: 0;
        height: 0;
        z-index: 1;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid ${premiumAccentColor};
      }`
          : `
      .c-reward-tooltip > .title {
          background: ${premiumAccentColor};
      }

      .c-reward-tooltip::after {
        position: absolute;
        right: -8px;
        top: calc(25% - 8px);
        content: '';
        width: 0;
        height: 0;
        z-index: 1;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-left: 8px solid ${premiumAccentColor};
      }
      `}
      </style>
      <div className="title">
        {imageFileObj && (
          <div className="thumbnail">
            <ImageByAspectRatio
              imageUrl={imageUrl}
              height={24}
              isCentered={true}
            />
          </div>
        )}
        <div className="name">{name}</div>
      </div>
      <div className="description">{description}</div>
    </div>
  );
}
