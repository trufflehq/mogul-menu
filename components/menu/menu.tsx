/*

NOTES

Services that the menu component should provide:
- Linking of Truffle account -> Twitch/Youtube account
- Interface for setting/unseting tab badge - done
- Interface for setting tab name - done
- Interface for enqueueing snackbar - done
- Interface for pushing/popping page onto page stack - done
- Interface for displaying action banners
- Interface for displaying a button to the right of tabs (like the channel points claim button)
- Interface for navigating between tabs
*/

import React, {
  JSX,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "https://npm.tfl.dev/react";
import _ from "https://npm.tfl.dev/lodash?no-check";
import root from "https://npm.tfl.dev/react-shadow@19";

import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.js";
// import Components from 'https://tfl.dev/@truffle/ui@0.0.1/components/components/components.js'
import Modal from "https://tfl.dev/@truffle/ui@0.0.1/components/modal/modal.js";
import Ripple from "https://tfl.dev/@truffle/ui@0.0.1/components/ripple/ripple.js";
import Icon from "https://tfl.dev/@truffle/ui@0.0.3/components/icon/icon.js";
import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@0.0.1/components/image-by-aspect-ratio/image-by-aspect-ratio.js";
import Spinner from "https://tfl.dev/@truffle/ui@0.0.1/components/spinner/spinner.js";
import Stylesheet from "https://tfl.dev/@truffle/ui@0.0.3/components/stylesheet/stylesheet.tag.js";
import SignUpForm from "https://tfl.dev/@truffle/ui@0.0.1/components/sign-up-form/sign-up-form.js";
import cssVars from "https://tfl.dev/@truffle/ui@0.0.1/util/css-vars.js";
import SnackBarProvider from "https://tfl.dev/@truffle/ui@0.0.1/components/snack-bar-provider/snack-bar-provider.js";

import {
  createSubject,
  Obs,
  op,
} from "https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import jumper from "https://tfl.dev/@truffle/utils@0.0.1/jumper/jumper.js";
import { getModel } from "https://tfl.dev/@truffle/api@0.0.1/legacy/index.js";

import classKebab from "https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js";

import HomeTab from "../home-tab/home-tab.tsx";
// import HomeTab from "../test-tab/test-tab.tsx";
import CollectionTab from "../collection-tab/collection-tab.tsx";
import PageStack from "../page-stack/page-stack.tsx";
import ActionBannerContainer from "../action-banner-container/action-banner-container.tsx";
import DialogContainer from "../dialog-container/dialog-container.tsx";

import { TabElement } from "../../util/tabs/types.ts";
import {
  TabStateContext,
  TabStateManager,
  useTabStateManager,
} from "../../util/tabs/tab-state.ts";
import { TabIdContext } from "../../util/tabs/tab-id.ts";
import { PageStackContext } from "../../util/page-stack/page-stack.ts";
import { usePageStackManager } from "../../util/page-stack/manager.ts";
import { useActionBannerManager } from "../../util/action-banner/manager.ts";
import { ActionBannerContext } from "../../util/action-banner/action-banner.ts";
import SeasonPassTab from "../season-pass-tab/season-pass-tab.tsx";
import ChannelPointsShopTab from "../channel-points-shop-tab/channel-points-shop-tab.tsx";

function getStorageKey(prefix) {
  const extensionMappingId = getExtensionMappingId();
  return `${prefix}:${extensionMappingId}`;
}

function getExtensionMappingId() {
  if (typeof document !== "undefined") {
    // get query params
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    return params.e;
  }
}

export const isYoutubeSourceType = (sourceType) =>
  sourceType === "youtube" ||
  sourceType === "youtubeLive" ||
  sourceType === "youtubeVideo";

export const getYoutubePageIdentifier = (pageInfoIdentifiers) =>
  pageInfoIdentifiers?.find((identifier) =>
    isYoutubeSourceType(identifier.sourceType)
  );

export const isTwitchSourceType = (sourceType) => sourceType === "twitch";

export const getTwitchPageIdentifier = (pageInfoIdentifiers) =>
  pageInfoIdentifiers?.find((identifier) =>
    isTwitchSourceType(identifier.sourceType)
  );

const SNACKBAR_ANIMATION_DURATION_MS = 5000;
const STORAGE_POSITION_PREFIX = "extensionIconPosition";
const STORAGE_TOOLTIP_PREFIX = "hasViewedOnboardTooltip";
const DEFAULT_TABS = [
  {
    text: "Home",
    slug: "home",
    imgUrl: "https://cdn.bio/assets/images/features/browser_extension/home.svg",
    $el: HomeTab,
  },
  {
    text: "Collection",
    slug: "collection",
    imgUrl:
      "https://cdn.bio/assets/images/features/browser_extension/collection.svg",
    $el: CollectionTab,
  },
  {
    text: "Battle Pass",
    slug: "battle-pass",
    imgUrl:
      "https://cdn.bio/assets/images/features/browser_extension/gamepad.svg",
    $el: SeasonPassTab,
  },
  {
    text: "Shop",
    slug: "shop",
    imgUrl:
      "https://cdn.bio/assets/images/features/browser_extension/store.svg",
    $el: ChannelPointsShopTab,
  },
];

export default function BrowserExtensionMenu(props) {
  // make sure we don't render this on the server
  if (typeof document === "undefined") return <></>;

  // props
  const {
    // hasChannelPoints,
    // hasBattlePass,
    iconImageObj,
    channelPointsImageObj,
    xpImageObj,
    hasSupportChat,
    darkChannelPointsImageObj,
    darkXpImageObj,
    creatorName,
  } = props;

  // fetched values
  // TODO: implement logic for fetching from backend
  const { extensionIconPositionObs, hasViewedOnboardTooltipObs } =
    useMemo(() => {
      const extensionIconPositionObs = Obs.from(
        jumper
          ?.call("storage.get", {
            key: getStorageKey(STORAGE_POSITION_PREFIX),
          })
          // TODO: remove entire .then in mid-june 2022. legacy code to use old window.localStorage value
          ?.then(async (value) => {
            try {
              if (!value) {
                const legacyValue =
                  (await jumper?.call("storage.get", {
                    key: STORAGE_POSITION_PREFIX,
                  })) || window.localStorage.getItem("extensionIconPosition");
                await jumper.call("storage.set", {
                  key: getStorageKey(STORAGE_POSITION_PREFIX),
                  value: legacyValue,
                });
                value = legacyValue;
                // cleanup old values
                jumper.call("storage.set", {
                  key: STORAGE_POSITION_PREFIX,
                  value: "",
                });
                window.localStorage.removeItem("extensionIconPosition");
              }
            } catch {}
            return value;
          }) || ""
      );
      // want this to always be true/false since it's async
      const hasViewedOnboardTooltipObs = Obs.from(
        jumper
          ?.call("storage.get", {
            key: getStorageKey(STORAGE_TOOLTIP_PREFIX),
          })
          ?.then((value) => value || false) || ""
      );

      return {
        extensionIconPositionObs,
        hasViewedOnboardTooltipObs,
      };
    }, []);

  const { extensionIconPosition, hasViewedOnboardTooltip } = useObservables(
    () => ({
      extensionIconPosition: extensionIconPositionObs,
      hasViewedOnboardTooltip: hasViewedOnboardTooltipObs,
    })
  );

  const isClaimable = false;
  const hasChannelPoints = true;
  const hasBattlePass = true;
  // references
  const $$extensionIconRef = useRef(null);

  // isOpen state
  const [isOpen, setIsOpen] = useState(false);
  const toggleIsOpen = () => setIsOpen((prev) => !prev);

  // computed values
  const visibleTabs = DEFAULT_TABS.filter((tab) => {
    if (!hasChannelPoints) {
      return tab.slug !== "shop";
    }
    if (!hasBattlePass) {
      return tab.slug !== "battle-pass";
    }
    return true;
  });

  const { pushPage, popPage, clearPageStack, pageStackSubject } =
    usePageStackManager();

  // set up state for TabNameContext
  const tabStateManager: TabStateManager = useTabStateManager(visibleTabs);
  const { tabStates } = tabStateManager;
  const tabIds = Object.keys(tabStates);
  const [activeTabId, setActiveTabId] = useState(tabIds[0]);

  const activeTabIndex = tabIds.indexOf(activeTabId);
  const ActiveTab: TabElement =
    visibleTabs[activeTabIndex].$el ?? (() => <></>);

  useEffect(() => {
    const setTabState = (tabId: string, isActive: boolean) =>
      tabStateManager.dispatch({
        type: "isActive",
        payload: {
          tabId: tabId,
          value: isActive,
        },
      });

    // set the current tab state to active
    setTabState(activeTabId, true);

    const onNavigateAway = () => {
      // set the tab to inactive when the user
      // navigates to a different tab
      setTabState(activeTabId, false);
    };

    return onNavigateAway;
  }, [activeTabId]);

  const hasNotification = Object.values(tabStates).reduce(
    (acc, tabState) => acc || tabState.hasBadge,
    false
  );

  // action banners
  const { actionBannerObjSubject, displayActionBanner, removeActionBanner } =
    useActionBannerManager();

  const className = `z-browser-extension-menu position-${extensionIconPosition} ${classKebab(
    { isOpen, hasNotification, isClaimable }
  )}`;

  return (
    <root.div className={className}>
      <Stylesheet url={new URL("menu.css", import.meta.url)} />
      <div
        className="extension-icon"
        style={{
          backgroundImage: iconImageObj
            ? `url(${getModel().image.getSrcByImageObj(iconImageObj)})`
            : undefined,
        }}
        ref={$$extensionIconRef}
        onClick={toggleIsOpen}
      >
        <Ripple color="var(--tfl-color-on-bg-fill)" />
      </div>
      <div className="menu">
        <div className="inner">
          <div className="bottom">
            <div className="tabs">
              {_.map(Object.entries(tabStates), ([id, tabState]) => {
                const { text: tabText, hasBadge, icon, isActive } = tabState;
                return (
                  <div
                    key={id}
                    className={`tab ${classKebab({ isActive, hasBadge })}`}
                    onClick={() => {
                      clearPageStack();
                      // set the tab that was clicked to the current tab
                      setActiveTabId(id);
                    }}
                  >
                    <div className="icon">
                      <ImageByAspectRatio
                        imageUrl={icon}
                        aspectRatio={1}
                        width={18}
                        height={18}
                      />
                    </div>
                    {/* TODO: add a way for tabs to set the tab name */}
                    <div className="title truffle-text-body-2">{tabText}</div>
                    <Ripple color="var(--tfl-color-on-bg-fill)" />
                  </div>
                );
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
          {/* TODO: put back account linking logic */}
          {/*shouldShowSignupBanner && <ActionBanner
            message="Finish setting up your account"
            buttonText="Sign up"
            onClick={handleSignup}
          />*/}
          {/*shouldShowTwitchBanner && getModel().user.isMember(me) && credentials?.sourceType === 'twitch' && !hasConnectedAccount && <TwitchSignupBanner /> */}
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
          <div className="body">
            <DialogContainer />
            <ActionBannerContext.Provider
              value={{ displayActionBanner, removeActionBanner }}
            >
              <TabStateContext.Provider value={tabStateManager}>
                <PageStackContext.Provider value={{ pushPage, popPage }}>
                  <SnackBarProvider
                    visibilityDuration={SNACKBAR_ANIMATION_DURATION_MS}
                  />
                  <PageStack pageStackSubject={pageStackSubject} />
                  <ActionBannerContainer
                    actionBannerObjSubject={actionBannerObjSubject}
                  />
                  {visibleTabs.map(({ $el: TabComponent }, idx) => (
                    <TabIdContext.Provider key={idx} value={tabIds[idx]}>
                      <div
                        className={`tab-component ${classKebab({
                          isActive: idx === activeTabIndex,
                        })}`}
                      >
                        {TabComponent && <TabComponent />}
                      </div>
                    </TabIdContext.Provider>
                  ))}
                </PageStackContext.Provider>
              </TabStateContext.Provider>
            </ActionBannerContext.Provider>
          </div>
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
    </root.div>
  );
}
