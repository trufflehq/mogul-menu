/*

NOTES

Services that the menu component should provide:
- Linking of Truffle account -> Twitch/Youtube account
- Interface for setting/unseting tab badge
- Interface for setting tab name
- Interface for enqueueing snackbar
- Interface for pushing/popping page onto page stack
- Interface for displaying action banners
- Interface for displaying a button to the right of tabs (like the channel points claim button)
*/

import React, { useMemo, useEffect, useRef, useState, JSX } from 'react'
import _ from 'https://npm.tfl.dev/lodash?no-check'

import Button from 'https://tfl.dev/@truffle/ui@0.0.1/components/button/button.jsx'
// import Components from 'https://tfl.dev/@truffle/ui@0.0.1/components/components/components.jsx'
import Modal from 'https://tfl.dev/@truffle/ui@0.0.1/components/modal/modal.jsx'
import Ripple from 'https://tfl.dev/@truffle/ui@0.0.1/components/ripple/ripple.jsx'
import Icon from 'https://tfl.dev/@truffle/ui@0.0.1/components/icon/icon.jsx'
import ImageByAspectRatio from 'https://tfl.dev/@truffle/ui@0.0.1/components/image-by-aspect-ratio/image-by-aspect-ratio.jsx'
import Spinner from 'https://tfl.dev/@truffle/ui@0.0.1/components/spinner/spinner.jsx'
import SignUpForm from 'https://tfl.dev/@truffle/ui@0.0.1/components/sign-up-form/sign-up-form.jsx'
import cssVars from 'https://tfl.dev/@truffle/ui@0.0.1/util/css-vars.js'
import SnackBarProvider from 'https://tfl.dev/@truffle/ui@0.0.1/components/snack-bar-provider/snack-bar-provider.jsx'

import { createSubject, op, Obs } from 'https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js'
import useObservables from 'https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js'
import jumper from 'https://tfl.dev/@truffle/utils@0.0.1/jumper/jumper.js'
import { getModel } from 'https://tfl.dev/@truffle/api@0.0.1/legacy/index.js'

import classKebab from 'https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js'

import HomeTab from '../home-tab/home-tab.tsx'

import { TabElement } from '../../util/tabs/tab-definition.ts'
import { TabContext, TabStateManager, useTabStateManager } from '../../util/tabs/tab-state.ts'

import styles from './menu.css' assert { type: 'css' }
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styles]

function getStorageKey (prefix) {
  const extensionMappingId = getExtensionMappingId()
  return `${prefix}:${extensionMappingId}`
}

function getExtensionMappingId () {
  if (typeof document !== 'undefined') {
    // get query params
    const urlSearchParams = new URLSearchParams(window.location.search)
    const params = Object.fromEntries(urlSearchParams.entries())
    return params.e
  }
}

export const isYoutubeSourceType = (
  sourceType
) =>
  sourceType === 'youtube' ||
  sourceType === 'youtubeLive' ||
  sourceType === 'youtubeVideo'

export const getYoutubePageIdentifier = (
  pageInfoIdentifiers
) =>
  pageInfoIdentifiers?.find((identifier) =>
    isYoutubeSourceType(identifier.sourceType)
  )

export const isTwitchSourceType = (
  sourceType
) =>
  sourceType === 'twitch'

export const getTwitchPageIdentifier = (
  pageInfoIdentifiers
) =>
  pageInfoIdentifiers?.find((identifier) =>
    isTwitchSourceType(identifier.sourceType)
  )

const SNACKBAR_ANIMATION_DURATION_MS = 5000
const STORAGE_POSITION_PREFIX = 'extensionIconPosition'
const STORAGE_TOOLTIP_PREFIX = 'hasViewedOnboardTooltip'
const DEFAULT_TABS = [
  {
    text: 'Home',
    slug: 'home',
    imgUrl:
      'https://cdn.bio/assets/images/features/browser_extension/home.svg',
    $el: HomeTab
  },
  {
    text: 'Collection',
    slug: 'collection',
    imgUrl:
      'https://cdn.bio/assets/images/features/browser_extension/collection.svg',
    // $el: CollectionTab
  },
  {
    text: 'Battle Pass',
    slug: 'battle-pass',
    imgUrl:
      'https://cdn.bio/assets/images/features/browser_extension/gamepad.svg',
    // $el: SeasonPassTab
  },
  {
    text: 'Shop',
    slug: 'shop',
    imgUrl:
      'https://cdn.bio/assets/images/features/browser_extension/store.svg',
    // $el: ChannelPointsShopTab
  }
]

export default function BrowserExtensionMenu (props) {
  // make sure we don't render this on the server
  if (typeof document === 'undefined') return <></>

  // props
  const {
    hasChannelPoints, hasBattlePass, iconImageObj, channelPointsImageObj, xpImageObj,
    hasSupportChat, darkChannelPointsImageObj, darkXpImageObj,
    creatorName
  } = props

  // fetched values
  // TODO: implement logic for fetching from backend
  const {
    extensionIconPositionObs,
    hasViewedOnboardTooltipObs,
    tabBadgeStatesSubject,
    extensionIconBadgeStateObs,
    pageStackSubject
  } = useMemo(() => {
    const extensionIconPositionObs = Obs.from(
      jumper?.call('storage.get', { key: getStorageKey(STORAGE_POSITION_PREFIX) })
        // TODO: remove entire .then in mid-june 2022. legacy code to use old window.localStorage value
        ?.then(async (value) => {
          try {
            if (!value) {
              const legacyValue = await jumper?.call('storage.get', { key: STORAGE_POSITION_PREFIX }) ||
                window.localStorage.getItem('extensionIconPosition')
              await jumper.call('storage.set', { key: getStorageKey(STORAGE_POSITION_PREFIX), value: legacyValue })
              value = legacyValue
              // cleanup old values
              jumper.call('storage.set', { key: STORAGE_POSITION_PREFIX, value: '' })
              window.localStorage.removeItem('extensionIconPosition')
            }
          } catch {}
          return value
        }) || ''
    )
    // want this to always be true/false since it's async
    const hasViewedOnboardTooltipObs = Obs.from(
      jumper?.call('storage.get', { key: getStorageKey(STORAGE_TOOLTIP_PREFIX) })
        ?.then((value) => value || false) || ''
    )

    // keeps track of which tabs have a badge;
    // by default, none of the tabs have badges;
    // the value of this stream is a Map of (tabSlug -> badgeIsVisible)
    const tabBadgeStatesSubject = createSubject(
      new Map(DEFAULT_TABS.map((tab) => [tab.slug, false]))
    )
    // keeps track of whether or not the extension icon has a badge;
    // if at least one of the tabs has a visible badge, the extension will have a badge;
    // the value of this stream is a boolean
    const extensionIconBadgeStateObs = tabBadgeStatesSubject.obs.pipe(
      op.map(badges => Array.from(badges.values()).reduce((acc, isVisible) => acc || isVisible))
    )

    return {
      extensionIconPositionObs,
      hasViewedOnboardTooltipObs,
      tabBadgeStatesSubject,
      extensionIconBadgeStateObs,
      pageStackSubject: createSubject([])
    }
  })

  const {
    extensionIconPosition,
    hasViewedOnboardTooltip,
    extensionIconBadgeState,
    tabBadgeStates,
    hasNotification,
    pageStack
  } = useObservables(() => ({
    extensionIconPosition: extensionIconPositionObs,
    hasViewedOnboardTooltip: hasViewedOnboardTooltipObs,
    tabBadgeStates: tabBadgeStatesSubject.obs,
    hasNotification: extensionIconBadgeStateObs,
    pageStack: pageStackSubject.obs,
  }))

  const isClaimable = false

  // references
  const $$extensionIconRef = useRef(null)

  // state
  const [isOpen, setIsOpen] = useState(false)

  // computed values
  const visibleTabs = DEFAULT_TABS
  .filter((tab) => {
    if (!hasChannelPoints) {
      return tab.slug !== 'shop'
    }
    if (!hasBattlePass) {
      return tab.slug !== 'battle-pass'
    }
    return true
  })

  // set up state for TabNameContext
  const tabStateManager: TabStateManager = useTabStateManager(visibleTabs)
  const { tabStates } = tabStateManager
  const tabIds = Object.keys(tabStates)
  const [activeTabId, setActiveTabId] = useState(tabIds[0])

  const activeTabIndex = tabIds.indexOf(activeTabId)
  const $activeTabEl: TabElement = visibleTabs[activeTabIndex].$el ?? (() => <></>)

  const isPageStackEmpty = pageStack.length === 0
  const PageStackHead = pageStack[pageStack.length - 1]

  const className = `z-browser-extension-menu position-${extensionIconPosition} ${classKebab({ isOpen, hasNotification, isClaimable })}`

  // actions
  const toggleIsOpen = () => setIsOpen(prev => !prev)

  // sets the badge state for a tab using its slug
  const setBadge = (slug, isShowing) => {
    tabBadgeStates.set(slug, isShowing)
    tabBadgeStatesSubject.next(tabBadgeStates)
  }

  // removes the badge from the actively selected tab
  const clearActiveTabBadge = () => {
    const tabSlug = visibleTabs[activeTabIndex].slug
    setBadge(tabSlug, false)
  }
  // pushes a component onto the page stack;
  // used for creating pages that take over
  // the whole extension UI (like the
  // prediction page, for example)
  const pushPage = (Component, props) => {
    const currentPageStack = pageStackSubject.getValue()
    pageStackSubject.next(currentPageStack.concat({ Component, props }))
  }

  const popPage = () => {
    const currentPageStack = pageStackSubject.getValue()
    pageStackSubject.next(currentPageStack.slice(0, -1))
  }

  const clearPageStack = () => {
    pageStackSubject.next([])
  }

  // effects

  return (
    <div className={className}>
      <div className="extension-icon"
        style={{
          backgroundImage: iconImageObj ? `url(${getModel().image.getSrcByImageObj(iconImageObj)})` : undefined
        }}
        ref={$$extensionIconRef}
        onClick={toggleIsOpen}
      >
        <Ripple color="var(--truffle-color-text-bg-primary)" />
      </div>
      <div className="menu">
        <div className="inner">
          <div className="bottom">
            <div className="tabs">
              {_.map(Object.entries(tabStates), ([id, tabState]) => {
                const isActive = id === activeTabId
                const { text: tabText, hasBadge, icon } = tabState
                return (
                  <div
                    key={id}
                    className={`tab ${classKebab({ isActive, hasBadge })}`}
                    onClick={() => {
                      // clear any badges when the user navigates away from the tab
                      clearActiveTabBadge()
                      clearPageStack()
                      // set the tab that was clicked to the current tab
                      setActiveTabId(id)
                    }}
                  >
                    <div className="icon">
                      <ImageByAspectRatio imageUrl={icon} aspectRatio={1} width={18} height={18} />
                    </div>
                    { /* TODO: add a way for tabs to set the tab name */ }
                    <div className="title truffle-text-body-2">{tabText}</div>
                    <Ripple color="var(--truffle-color-text-bg-primary)" />
                  </div>
                )
              })}
            </div>
            {/* TODO: refactor channel points component */}
            {/*(hasChannelPoints || hasBattlePass) && canClaim && <div className="channel-points">
              <ChannelPoints {...{
                hasText: isOpen,
                fontColor: '#FFFFFF',
                source,
                connectionObs,
                highlightButtonBg,
                channelPointsImageObj,
                hasChannelPoints,
                hasBattlePass,
                darkChannelPointsImageObj: hasChannelPoints ? darkChannelPointsImageObj : darkXpImageObj,
                timeWatchedSecondsSubject,
                secondsRemainingSubject,
                onFinishedCountdown: () => {
                  // set a badge on the extension icon
                  // when the user is able to claim channel points
                  // setBadge('channel-points', true)
                  isClaimableSubject.next(true)
                },
                onClaim: ({ channelPointsClaimed, xpClaimed }) => {
                  // clear the badge when the user claims their channel points
                  // setBadge('channel-points', false)
                  isClaimableSubject.next(false)

                  // display a couple of snack bars to notify them of their rewards
                  hasChannelPoints && enqueueSnackBar(
                    () =>
                      <ChannelPointsClaimSnackBar
                        channelPointsClaimed={channelPointsClaimed}
                        totalChannelPoints={channelPoints?.count}
                        channelPointsImageObj={channelPointsImageObj}
                        darkChannelPointsImageObj={darkChannelPointsImageObj}
                      />
                  )
                  enqueueSnackBar(
                    () =>
                      <XpClaimSnackBar
                        xpClaimed={xpClaimed}
                        totalXp={parseInt(seasonPass?.xp?.count || 0)}
                        xpImageObj={xpImageObj}
                        darkXpImageObj={darkXpImageObj}
                      />
                  )
                }
              }} />
            </div> */}
            <div className="extension-icon-placeholder"></div>
          </div>
          {/* TODO: put back account linking logic */ }
          {/*shouldShowSignupBanner && <ActionBanner
            message="Finish setting up your account"
            buttonText="Sign up"
            onClick={handleSignup}
          />*/}
          { /*shouldShowTwitchBanner && getModel().user.isMember(me) && credentials?.sourceType === 'twitch' && !hasConnectedAccount && <TwitchSignupBanner /> */}
          {
            // TODO: move this to the actions page
            // TODO: update to mockup spec w/ timer, etc...
            // make separate component so we're only rerendering on timer tick in that component
            // also only show if timer hasn't expired (make isPredictionExpiredObs)
            // ActionBanner should support a close icon
            /*getModel().user.isMember(me) && activePoll && isPageStackEmpty && <ActionBanner
              message={`Prediction: ${activePoll.question}`}
              buttonText="Participate"
              onClick={ () => pushPage(PredictionPage, {
                activePoll, channelPointsImageObj, channelPointsOrgUserCounterObs, onBack: popPage
              }) }
            />*/
          }
          <TabContext.Provider value={tabStateManager}>
            <SnackBarProvider visibilityDuration={SNACKBAR_ANIMATION_DURATION_MS}>
              {
                !isPageStackEmpty
                  ? <div className='page-stack'>
                    { <PageStackHead.Component { ...PageStackHead.props } />}
                  </div>
                  : <div className="body"><$activeTabEl tabId={activeTabId} /></div>
              }
            </SnackBarProvider>
          </TabContext.Provider>
        </div>
      </div>
      {/* TODO: refactor snackbar container component */}
      
      {/* TODO: refactor NewExtensionUserTooltip */}
      {/* <Modal isVisibleSubject={isOnboardTooltipVisibleSubject}>
        <NewExtensionUserTooltip
          hasViewedOnboardTooltipSubject={hasViewedOnboardTooltipSubject}
          $$extensionIconRef={$$extensionIconRef}
        />
      </Modal> */}
      {/* TODO: wire up */}
      {/* <Modal isVisibleSubject={isSignupVisibleSubject}>
        <SignUpForm
          source='extension-sign-up'
          prefillName={me?.name}
          infoMessage='Create an account to secure your collection'
          onComplete={transferJwt}
        />
      </Modal> */}
    </div>
  )
}