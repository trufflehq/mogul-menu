import _ from 'https://npm.tfl.dev/lodash?no-check'
import React, { useMemo, useRef, useEffect } from 'react'

import { createSubject } from 'https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js'
import useObservables from 'https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js'
import { zeroPrefix } from 'https://tfl.dev/@truffle/utils@0.0.1/format/format.js'
import classKebab from 'https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js'
import { getModel } from 'https://tfl.dev/@truffle/api@0.0.1/legacy/index.js'
import Spinner from 'https://tfl.dev/@truffle/ui@0.0.1/components/spinner/spinner.jsx'
import cssVars, { rgb2rgba, hexOpacity } from 'https://tfl.dev/@truffle/ui@0.0.1/util/css-vars.js'

import { getLevelBySeasonPassAndXp, getXPBarBySeasonPassAndXp } from '../../util/season-pass/season-pass.js'

import styles from './season-pass.css' assert { type: 'css' }
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styles]

const GREEN = '#75DB9E'
const YELLOW = '#EBC564'

const config = {}
const router = {}

function Component () { return '' }

export default function SeasonPass (props) {
  const {
    shouldUseCurrentLevelZeroPrefix,
    shouldUseLevelsZeroPrefix,
    premiumAccentColor,
    premiumBgColor = '',
    freeTierText,
    premiumTierText,
    numTiles = 4,
    xpImageObj,
    highlightButtonBg,
    onViewCollection,
    enqueueSnackBar
  } = props

  const $$levelsRef = useRef(null)
  const $$levelRef = useRef(null)
  const { seasonPassObs, focalIndexStream, selectedRewardStream } =
    useMemo(() => {
      return {
        seasonPassObs: getModel().seasonPass.getCurrent(),
        focalIndexStream: createSubject(0),
        selectedRewardStream: createSubject()
      }
    }, [])

  const { seasonPass, me, meOrgUserWithKv, focalIndex } = useObservables(
    () => ({
      seasonPass: seasonPassObs,
      me: getModel().user.getMe(),
      org: getModel().org.getMe(),
      focalIndex: focalIndexStream.obs,
      meOrgUserWithKv: getModel().orgUser.getMeWithKV()
    })
  )

  if (!seasonPass) {
    return (
      <div className="c-season-pass">
        <Spinner />
      </div>
    )
  }

  const currentLevelNum =
    getLevelBySeasonPassAndXp(seasonPass, seasonPass.xp)?.levelNum || 0

  const { range, progress } = getXPBarBySeasonPassAndXp(
    seasonPass,
    seasonPass.xp
  )

  // FIXME hack for faze
  const isEligibleCryptoGiveawayKv = meOrgUserWithKv?.keyValueConnection?.nodes
    ?.find(({ key }) => key === 'isEligibleCryptoGiveaway')
  const isEligibleCryptoGiveaway = isEligibleCryptoGiveawayKv?.value === 'yes'

  // FIXME - hack for faze
  const tiers = !isEligibleCryptoGiveaway
    ? _.filter(seasonPass?.data?.tiers, (tier) => tier?.name !== 'Crypto-eligible')
    : seasonPass?.data?.tiers

  // FIXME - hack for faze
  const levels = !isEligibleCryptoGiveaway
    ? _.map(seasonPass.levels, (level) => {
      const nonCryptoRewards = _.filter(level.rewards, (reward) => reward.tierNum < 1)

      return {
        ...level,
        rewards: nonCryptoRewards
      }
    })
    : seasonPass.levels

  const groupedLevels = _.keyBy(levels, 'levelNum')

  // need levels to be sequential from min to max
  const minLevelNum = _.minBy(seasonPass.levels, 'levelNum')?.levelNum
  const maxLevelNum = _.maxBy(seasonPass.levels, 'levelNum')?.levelNum

  const endRange = numTiles > maxLevelNum ? numTiles : maxLevelNum

  const levelRange = _.range(minLevelNum, endRange + minLevelNum)

  useEffect(() => {
    if (currentLevelNum && numTiles) {
      if (currentLevelNum < numTiles) {
        focalIndexStream.next(0)
      } else if ((currentLevelNum + numTiles - 1) > levelRange?.length) {
        focalIndexStream.next(levelRange?.length - numTiles)
      } else {
        focalIndexStream.next(currentLevelNum - 1)
      }
    }
  }, [currentLevelNum])

  const onLeftClick = () => {
    if (focalIndex - numTiles < 0) {
      focalIndexStream.next(0)
    } else {
      focalIndexStream.next(focalIndex - numTiles)
    }
    selectedRewardStream.next()
  }

  const onRightClick = () => {
    if (focalIndex + numTiles * 2 > levelRange?.length) {
      focalIndexStream.next(levelRange?.length - numTiles)
    } else {
      focalIndexStream.next(focalIndex + numTiles)
    }
    selectedRewardStream.next()
  }

  useEffect(() => {
    if (
      !_.isEmpty(
        seasonPass?.seasonPassProgression?.changesSinceLastViewed
      )
    ) {
      _.map(seasonPass?.seasonPassProgression?.changesSinceLastViewed, (change) => {
        const Component = change?.rewards?.length > 1 ? MultipleRewardLevelUpDialog : LevelUpDialog
        overlay.open(Component, {
          change,
          onViewCollection,
          premiumBgColor,
          premiumAccentColor,
          highlightButtonBg,
          enqueueSnackBar
        })
      })
    }
  }, [seasonPass?.seasonPassProgression?.changesSinceLastViewed])

  // since the focal index starts at zero, check if we are at the left boundary
  const isNotLeftClickable = focalIndex - numTiles <= -numTiles

  // check to see if we are at a right boundary
  const isNotRightClickable = focalIndex + numTiles >= levelRange?.length

  const isMember = getModel().user.isMember(me)

  const visibleLevels = _.slice(levelRange, focalIndex, focalIndex + numTiles)

  // FIXME: the reverse here is a hack for Faze
  let tierNums = _.reverse(_.uniqBy(
    _.flatten(
      _.map(seasonPass.levels, (level) =>
        _.map(level.rewards, 'tierNum')
      )
    )
  ))

  // FIXME: the reverse here is a hack for Faze
  tierNums = !isEligibleCryptoGiveaway ? _.filter(tierNums, (num) => num < 1) : tierNums

  const userTierNum = seasonPass?.seasonPassProgression?.tierNum
  const xpSrc = xpImageObj ? getModel().image.getSrcByImageObj(xpImageObj) : 'https://cdn.bio/assets/images/features/browser_extension/xp.svg'

  return (
    <div className="c-browser-extension-season-pass">
      {seasonPass &&
        <>
          <div className="top-info">
            <div className="left">
              {isMember &&
                <>
                <div className="account">
                  <$accountAvatar />
                </div>
                <div className="level-progress">
                  <div className="xp">
                    <div className="icon">
                      <Component
                        slug="image-by-aspect-ratio"
                        props={{
                          imageUrl: xpSrc,
                          aspectRatio: 1,
                          widthPx: 24,
                          height: 24
                        }}
                      />
                    </div>
                    <div className="amount">{`${progress}/${range}`}</div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="filler"
                      style={{
                        width: `calc(${(progress / range) * 100}%`
                      }}
                    />
                  </div>
                  <div className="level">{`Level ${
                    shouldUseCurrentLevelZeroPrefix
                      ? zeroPrefix(currentLevelNum)
                      : currentLevelNum
                  }`}</div>
                </div>
                </>
              }
            </div>
          </div>
          {true && (
              <div className="pages">
                <div
                  className={`button left ${classKebab({ isDisabled: isNotLeftClickable })}`}
                  onClick={onLeftClick}
                >
                  ◂
                </div>
                <div className='days'>
                  {`Ends in ${seasonPass?.daysRemaining} days`}
                </div>
                <div
                  className={`button right ${classKebab({ isDisabled: isNotRightClickable })}`}
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
              {tiers?.length
                ? <div className="tier-info">
                {
                  // FIXME: the reverse here is a hack for Faze
                  _.reverse(_.map(tiers, (tier) => {
                    console.log('tier', tier);
                    return tier?.name && <div className='tier' style={{
                      background: tier?.background
                    }}>
                      {
                        tier?.name
                      }
                    </div>
                  }))
                }
              </div>
                : null}
              <div
                className="levels"
                style={{
                  // 165 is in the css. we should probably make a prop and css var in here
                  gridTemplateColumns: `repeat(${numTiles}, 1fr)`
                }}
              >
                {_.map(visibleLevels, (levelNum) => {
                  return (
                    <$level
                      key={levelNum}
                      abc='def'
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
                      enqueueSnackBar={enqueueSnackBar}
                      xp={seasonPass?.xp?.count ?? 0}
                      onViewCollection={onViewCollection}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </>
      }
    </div>
  )
}

function LevelUpDialog ({
  change,
  onViewCollection,
  premiumBgColor,
  premiumAccentColor,
  highlightButtonBg,
  enqueueSnackBar
}) {
  const { selectedRewardStream } = useMemo(() => {
    return {
      selectedRewardStream: createSubject(null)
    }
  }, [])

  const reward = change.rewards?.[0]
  const levelNum = change?.levelNum
  const isEmote = reward?.source?.type === 'emote'
  const isTicket = reward?.source?.type === 'ticket'
  const isRedeemable = reward?.source?.type === 'redeemable'
  const levelUpHeaderText = `Level ${levelNum} unlocked`
  const $title = 'You leveled up!'

  return (
    <div className="c-rewards-dialog use-css-vars-creator">
      {
          isEmote || isTicket
            ? <Component
                  slug="unlocked-emote-dialog"
                  props={{
                    $title,
                    $children: <Reward
                      selectedRewardStream={selectedRewardStream}
                      premiumAccentColor={premiumAccentColor}
                      premiumBgColor={premiumBgColor}
                      onClick={() => _.noop}
                      isUnlocked={true}
                      reward={reward}
                      levelNum={change?.levelNum}
                      isFreeTier={true}
                      tierNum={reward?.tierNum}
                    />,
                    highlightBg: highlightButtonBg,
                    headerText: levelUpHeaderText,
                    reward,
                    onViewCollection
                  }}
                />
            : isRedeemable
              ? <Component
              slug="redeemable-dialog"
              props={{
                $title,
                highlightBg: highlightButtonBg,
                headerText: levelUpHeaderText,
                enqueueSnackBar,
                $children: <Reward
                  selectedRewardStream={selectedRewardStream}
                  premiumAccentColor={premiumAccentColor}
                  premiumBgColor={premiumBgColor}
                  onClick={() => _.noop}
                  isUnlocked={true}
                  reward={reward}
                  levelNum={change?.levelNum}
                  isFreeTier={true}
                  tierNum={reward?.tierNum}
                />,
                redeemableCollectible: reward,
                onViewCollection
              }}
            />
              : <NoItemLevelUpDialog
                  $title={$title}
                  headerText={levelUpHeaderText}
                  highlightBg={highlightButtonBg}
                  $children={<Reward
                    selectedRewardStream={selectedRewardStream}
                    premiumAccentColor={premiumAccentColor}
                    premiumBgColor={premiumBgColor}
                    onClick={() => _.noop}
                    isUnlocked={true}
                    reward={ { tierNum: 0 }}
                    levelNum={change?.levelNum}
                    isFreeTier={true}
                    tierNum={reward?.tierNum}
                  />}
                  onViewCollection={onViewCollection}
                />
      }
    </div>
  )
}

function MultipleRewardLevelUpDialog ({
  change,
  onViewCollection,
  premiumBgColor,
  highlightButtonBg
}) {
  const levelNum = change?.levelNum

  const $title = 'You leveled up!'
  return (
    <div className="c-multiple-rewards-dialog use-css-vars-creator">
        <style>
        {`
          .c-multiple-rewards-dialog {
            --highlight-gradient: ${highlightButtonBg ?? ''};
          }
        `}
        </style>
        <Component slug="dialog"
          props={{
            $title,
            $content:
            <div className='body'>
              <div className='title'>
                {`Level ${levelNum} rewards unlocked!`}
              </div>
              {
                _.map(change.rewards, (reward) => {
                  const imgRel = reward?.source?.fileRel
                  const rewardAmountValue = reward?.amountValue
                  const name = rewardAmountValue ? `x${rewardAmountValue} ${reward?.source?.name}` : reward?.source?.name
                  const description = reward?.source?.data?.description

                  return <div className='reward'>
                    <div className='image'>
                      <Component
                        slug="image-by-aspect-ratio"
                        props={{
                          imageUrl: getModel().image.getSrcByImageObj(imgRel?.fileObj),
                          aspectRatio: imgRel?.fileObj?.data?.aspectRatio,
                          heightPx: 80,
                          widthPx: 80
                        }}
                      />
                    </div>
                    <div className='info'>
                      <div className='title'>
                        <div className='name'>{name}</div>
                        <div className='icon'>
                          <$unlockedIcon />
                        </div>
                      </div>
                      <div className='description'>{description}</div>
                      <div className='button'>
                        <Component slug="button"
                          props={{
                            text: 'View in collection',
                            isFullWidth: false,
                            bg: cssVars.$primaryBase,
                            borderRadius: '4px',
                            bgColor: cssVars.$primaryBase,
                            style: 'primary',
                            textColor: cssVars.$bgBase,
                            onclick: onViewCollection
                          }}
                        />
                      </div>
                    </div>
                  </div>
                })
              }
            </div>,
            $topRightButton:
            <div className='close-button'>
              <Component slug="icon"
                props={{
                  icon: 'close',
                  color: cssVars.$bgBase,
                  onclick: () => overlay.close()
                }}
              />
            </div>
          }}
        />
    </div>
  )
}

export function $level (props) {
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
    onViewCollection,
    enqueueSnackBar
  } = props

  const isCurrentLevel = currentLevelNum === level.levelNum

  const onRewardClick = (reward, $$rewardRef, tierNum) => {
    if (reward) {
      const isUnlocked = reward && currentLevelNum >= level.levelNum
      const isEmote = reward?.source?.type === 'emote'
      const isRedeemable = reward?.source?.type === 'redeemable'

      const minXp = level.minXp
      selectedRewardStream.next({ sourceId: reward?.sourceId, level })

      // this series of if statements categorize different rewards
      // and displays the appropriate dialog for each

      // if the user hasn't unlocked the item yet
      if (!isUnlocked) {
        overlay.open(() => (
          <LockedRewardDialog
            reward={reward}
            xpImgSrc={xpImgSrc}
            minXp={minXp}
            xp={xp}
          />
        ))

      // if the user clicked on an emote
      } else if (isEmote) {
        overlay.open(() => (
          <Component
            slug="unlocked-emote-dialog"
            props={{
              reward,
              onViewCollection
            }}
          />
        ))

      // if the user clicked on a redeemable
      } else if (isRedeemable) {
        overlay.open(() => (
          <Component
            slug="redeemable-dialog"
            props={{
              enqueueSnackBar,
              redeemableCollectible: reward,
              onViewCollection
            }}
          />
        ))
      } else {
        overlay.open(() => (
          <Component slug="browser-extension-item-dialog"
          props={{
            displayMode: 'center',
            imgRel: reward?.source?.fileRel,
            primaryText: `You unlocked a ${reward?.source?.name}`,
            secondaryText: '',
            buttons: [
              {
                text: 'Close',
                borderRadius: '4px',
                bg: cssVars.$tertiaryBase,
                textColor: cssVars.$tertiaryBaseText,
                onClick: () => overlay.close()
              },
              {
                text: 'View collection',
                borderRadius: '4px',
                style: 'primary',
                onClick: onViewCollection
              }
            ],
            onExit: () => overlay.close()
          }}
        />
        ))
      }
    }
  }

  return (
    <div
      className={`level ${classKebab({ isCurrentLevel })}`}
      ref={$$levelRef}
    >
      <div className="number">
        Level { shouldUseLevelsZeroPrefix
        ? zeroPrefix(level.levelNum)
        : level.levelNum}
      </div>
      {_.map(tierNums, (tierNum) => {
        const reward = _.find(level.rewards, { tierNum })
        const tierName = tiers?.[tierNum]

        const isValidTierNum = userTierNum >= reward?.tierNum
        const isUnlockedLevel = currentLevelNum >= level.levelNum
        const isUnlocked = reward && isValidTierNum && isUnlockedLevel

        return (
          <div key={tierNum} className={`reward tier-${tierNum} ${classKebab({
            isFirstWithTierName: tierNum === tierNums?.length - 1 && Boolean(tierName), // FIXME this is a hack for Faze reverse bp order
            hasTierName: Boolean(tierName)
          })}`}>
            <Reward
              selectedRewardStream={ selectedRewardStream }
              premiumAccentColor={ premiumAccentColor }
              premiumBgColor={ premiumBgColor }
              onClick={ onRewardClick }
              isUnlocked={ isUnlocked }
              reward={ reward }
              tierNum={ tierNum }
              level={ level }
            />
          </div>
        )
      })}
    </div>
  )
}

export function Reward ({
  selectedRewardStream,
  premiumAccentColor,
  premiumBgColor,
  onClick,
  isUnlocked,
  reward,
  level,
  tierNum
}) {
  const { selectedReward } = useObservables(() => ({
    selectedReward: selectedRewardStream.obs
  }))

  const $$ref = useRef()

  let isRewardSelected

  if (selectedReward?.level) {
    isRewardSelected =
      reward &&
      selectedReward?.sourceId === reward.sourceId &&
      selectedReward?.level === level
  } else {
    isRewardSelected = reward && selectedReward?.sourceId === reward.sourceId
  }

  const isFreeReward = tierNum === 0
  const isPaidReward = tierNum === 1
  const isFreeUnlocked = isUnlocked && isFreeReward
  const isPaidUnlocked = isUnlocked && isPaidReward
  const rewardAmountValue = reward?.amountValue

  const rewardClassname = isPaidReward
    ? 'paid'
    : 'free'

  return (
    <div
      className={`c-reward ${rewardClassname} ${classKebab({
        isSelected: isRewardSelected,
        isFreeUnlocked,
        isPaidUnlocked,
        hasTooltip: Boolean(reward)
      })}`}
      ref={ $$ref }
      onClick={(e) => {
        onClick(reward, $$ref, tierNum)
      }}
    >
      <style>{`
      .c-reward.is-paid-unlocked {
        background: ${premiumAccentColor};
      }

      .c-reward.paid {
        background: ${premiumBgColor};
        border-color: ${premiumAccentColor};
      }

      .c-reward.paid.has-tooltip:not(.is-selected):hover {
        background-color: ${
          premiumBgColor.indexOf('#') !== -1
            ? hexOpacity(premiumBgColor, 0.7)
            : rgb2rgba(premiumBgColor, 0.7)
        }!important;
      }
  `}</style>
      {reward && (
        isUnlocked
          ? <$unlockedIcon />
          : <$lockIcon />
      )}
      <div className="inner">
        {reward?.source?.fileRel?.fileObj && (
          <div className="image">
            <img
              src={getModel().image.getSrcByImageObj(
                reward?.source.fileRel.fileObj
              )} />

          </div>
        )}
        <div className="name">{rewardAmountValue ? `x${rewardAmountValue} ${reward?.source?.name}` : reward?.source?.name}</div>
      </div>
    </div>
  )
}

function NoItemLevelUpDialog ({ $title, $children, onViewCollection, headerText, highlightBg }) {
  return (
    <div className='c-unlocked-emote-reward-dialog use-css-vars-creator'>
      <Component slug="browser-extension-item-dialog"
        props={{
          displayMode: 'center',
          $title,
          $children,
          headerText,
          highlightBg,
          primaryText: 'No item for this level',
          buttons: [
            {
              text: 'Close',
              borderRadius: '4px',
              bg: cssVars.$tertiaryBase,
              textColor: cssVars.$tertiaryBaseText,
              onClick: () => overlay.close()
            }
          ],
          onExit: () => overlay.close()
        }}
      />
    </div>
  )
}

export function LockedRewardDialog ({ reward, xp, minXp, xpImgSrc }) {
  return (
    <div className='c-locked-reward-item-dialog'>
      <Component slug="browser-extension-item-dialog"
        props={{
          displayMode: 'left',
          imgRel: reward?.source?.fileRel,
          primaryText:
          <div className='item-name'>
            <div className='text'>{reward?.source?.name}</div>
            <$lockIcon />
          </div>,
          valueText:
          <div className='value-container'>
            <Component
              slug="image-by-aspect-ratio"
              props={{
                imageUrl: xpImgSrc,
                aspectRatio: 1,
                widthPx: 18,
                height: 18
              }}
            />
            <div>{xp}/{minXp}</div>
          </div>,
          secondaryText: reward?.description,
          buttons: [
            {
              text: 'Close',
              bg: cssVars.$tertiaryBase,
              borderRadius: '4px',
              textColor: cssVars.$tertiaryBaseText,
              onClick: () => overlay.close()
            }
          ],
          onExit: () => overlay.close()
        }}
      />
    </div>
  )
}

export function $rewardTooltip ({
  name,
  description,
  imageFileObj,
  premiumAccentColor
}) {
  const { breakpoint } = useObservables(() => ({
    breakpoint: browser.getBreakpointStream().obs
  }))

  const isMobile = breakpoint === 'mobile'
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
            <Component
              slug="image-by-aspect-ratio"
              props={{
                imageUrl: getModel().image.getSrcByImageObj(imageFileObj),
                aspectRatio: imageFileObj.data.aspectRatio,
                heightPx: 24,
                isCentered: true
              }}
            />
          </div>
        )}
        <div className="name">{name}</div>
      </div>
      <div className="description">{description}</div>
    </div>
  )
}

export function $lockIcon () {
  return (
    <div className="status-icon locked">
      <div className="c-lock-icon">
        {
          <Component
            slug="icon"
            props={{
              icon: 'lock',
              color: YELLOW,
              size: '14px'
            }}
          />
        }
      </div>
    </div>
  )
}

export function $unlockedIcon () {
  return (
    <div className="status-icon unlocked">
      <div className="c-unlock-icon">
        {
          <Component
            slug="icon"
            props={{
              icon: 'check',
              color: GREEN,
              size: '14px'
            }}
          />
        }
      </div>
    </div>
  )
}

function $accountAvatar () {
  const { me /* , breakpoint */ } = useObservables(() => ({
    me: getModel().user.getMe(),
    breakpoint: browser.getBreakpointStream().obs
  }))

  // const isMobile = breakpoint === 'mobile'

  return (
    <div className="c-account-avatar">
      {router.link(
        <a href={ router.get('orgEditProfile') }>
          <Component
            slug="avatar"
            props={{
              user: me,
              size: '72px'
            }}
          />
        </a>
      )}
    </div>
  )
}
