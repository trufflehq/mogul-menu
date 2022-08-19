/*

NOTES

Services that the menu component should provide:
- Linking of Truffle account -> Twitch/Youtube account
- Interface for setting/unseting tab badge - done
- Interface for setting tab name - done
- Interface for enqueueing snackbar - done
- Interface for pushing/popping page onto page stack - done
- Interface for displaying action banners - done
- Interface for displaying a button to the right of tabs (like the channel points claim button)
- Interface for navigating between tabs - done
*/
import {
  _,
  AuthDialog,
  getSrcByImageObj,
  jumper,
  React,
  useEffect,
  useMemo,
  useMutation,
  useQuery,
  useRef,
  useState,
  useStyleSheet,
} from "../../deps.ts";
import styleSheet from "./menu.scss.js";
import { EXTENSION_TOKEN_SIGNIN_QUERY } from "../../gql/mod.ts";
import { setAccessToken } from "../../util/mod.ts";
import { MogulTvUser } from "../../types/mod.ts";

import Ripple from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/ripple/ripple.tsx";
import Icon from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/icon/icon.tsx";
import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/image-by-aspect-ratio/image-by-aspect-ratio.tsx";
import Spinner from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/spinner/spinner.tsx";
import Stylesheet from "https://tfl.dev/@truffle/ui@~0.1.0/components/stylesheet/stylesheet.tag.ts";
import SignUpForm from "https://tfl.dev/@truffle/ui@~0.1.0/components/sign-up-form/sign-up-form.js";
import cssVars from "https://tfl.dev/@truffle/ui@~0.1.0/legacy/css-vars.js";
import SnackBarProvider from "../base/snack-bar-provider/snack-bar-provider.tsx";
import { isMemberMeUser } from "../../util/mod.ts";
import { createSubject, Obs, op } from "https://tfl.dev/@truffle/utils@~0.0.2/obs/subject.ts";
import useObservables from "https://tfl.dev/@truffle/utils@~0.0.2/obs/use-observables-react.ts";

import classKebab from "https://tfl.dev/@truffle/utils@~0.0.2/legacy/class-kebab.ts";
import ActionBanner from "../action-banner/action-banner.tsx";

import Draggable from "../draggable/draggable.tsx";

import HomeTab from "../home-tab/home-tab.tsx";
import TestTab from "../test-tab/test-tab.tsx";
import CollectionTab from "../collection-tab/collection-tab.tsx";
import PageStack from "../page-stack/page-stack.tsx";
import ActionBannerContainer from "../action-banner-container/action-banner-container.tsx";
import DialogContainer from "../base/dialog-container/dialog-container.tsx";
import Button from "../base/button/button.tsx";
import { TabElement } from "../../util/tabs/types.ts";
import { TabStateContext, TabStateManager, useTabStateManager } from "../../util/tabs/tab-state.ts";
import { TabIdContext } from "../../util/tabs/tab-id.ts";
import { PageStackContext } from "../../util/page-stack/page-stack.ts";
import { usePageStackManager } from "../../util/page-stack/manager.ts";
import { useActionBannerManager } from "../../util/action-banner/manager.ts";
import { ActionBannerContext } from "../../util/action-banner/action-banner.ts";
import SeasonPassTab from "../season-pass-tab/season-pass-tab.tsx";
import ChannelPointsShopTab from "../channel-points-shop-tab/channel-points-shop-tab.tsx";
import { activeTabSubject as nextTabSubject } from "../../util/tabs/active-tab.ts";

import { TabButtonContext, useTabButtonManager } from "../../util/tabs/tab-button.ts";

import { ME_QUERY } from "../../gql/mod.ts";

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
  pageInfoIdentifiers?.find((identifier) => isYoutubeSourceType(identifier.sourceType));

export const isTwitchSourceType = (sourceType) => sourceType === "twitch";

export const getTwitchPageIdentifier = (pageInfoIdentifiers) =>
  pageInfoIdentifiers?.find((identifier) => isTwitchSourceType(identifier.sourceType));

const SNACKBAR_ANIMATION_DURATION_MS = 5000;
const STORAGE_TOOLTIP_PREFIX = "hasViewedOnboardTooltip";
const DEFAULT_TABS = [
  {
    text: "Test",
    slug: "test",
    imgUrl: "",
    $el: TestTab,
  },
  {
    text: "Home",
    slug: "home",
    imgUrl: "https://cdn.bio/assets/images/features/browser_extension/home.svg",
    $el: HomeTab,
  },
  {
    text: "Collection",
    slug: "collection",
    imgUrl: "https://cdn.bio/assets/images/features/browser_extension/collection.svg",
    $el: CollectionTab,
  },
  {
    text: "Battle Pass",
    slug: "battle-pass",
    imgUrl: "https://cdn.bio/assets/images/features/browser_extension/gamepad.svg",
    $el: SeasonPassTab,
  },
  {
    text: "Shop",
    slug: "shop",
    imgUrl: "https://cdn.bio/assets/images/features/browser_extension/store.svg",
    $el: ChannelPointsShopTab,
  },
];

function getMenuState({
  isOpen,
  isClaimable,
  snackBarQueue,
  shouldShowOnboardTooltip,
}) {
  if (isOpen) {
    return "open";
  } else if (shouldShowOnboardTooltip) {
    return "closed-with-tooltip";
  } else if (snackBarQueue?.length > 0) {
    return "closed-with-snackbar";
  } else if (isClaimable) {
    return "closed-with-claim";
  } else {
    return "closed";
  }
}

interface OptionalSigninArgs {
  isTransfer: boolean;
}

export default function BrowserExtensionMenu(props) {
  const signInActionBannerIdRef = useRef(null);
  useStyleSheet(styleSheet);
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

  const [signInResult, executeSigninMutation] = useMutation(
    EXTENSION_TOKEN_SIGNIN_QUERY,
  );
  // fetched values
  // TODO: implement logic for fetching from backend
  const { extensionIconPositionObs, hasViewedOnboardTooltipObs } = useMemo(() => {
    // want this to always be true/false since it's async
    const hasViewedOnboardTooltipObs = Obs.from(
      jumper
        ?.call("storage.get", {
          key: getStorageKey(STORAGE_TOOLTIP_PREFIX),
        })
        ?.then((value) => value || false) || "",
    );

    return {
      hasViewedOnboardTooltipObs,
    };
  }, []);
  const { hasViewedOnboardTooltip, extensionInfo } = useObservables(() => ({
    hasViewedOnboardTooltip: hasViewedOnboardTooltipObs,
    extensionInfo: Obs.from(jumper?.call("context.getInfo") || ""),
  }));

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

  const { pushPage, popPage, clearPageStack, pageStackSubject } = usePageStackManager();

  // set up state for TabNameContext
  const tabStateManager: TabStateManager = useTabStateManager(visibleTabs);
  const { tabStates } = tabStateManager;
  const tabSlugs = Object.keys(tabStates);
  const [activeTabSlug, setActiveTabId] = useState(tabSlugs[0]);

  const activeTabIndex = tabSlugs.indexOf(activeTabSlug);

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
    setTabState(activeTabSlug, true);

    const onNavigateAway = () => {
      // set the tab to inactive when the user
      // navigates to a different tab
      setTabState(activeTabSlug, false);
    };

    return onNavigateAway;
  }, [activeTabSlug]);

  const hasNotification = Object.values(tabStates).reduce(
    (acc, tabState) => acc || tabState.hasBadge,
    false,
  );

  const { nextTabSlugFromExternal } = useObservables(() => ({
    nextTabSlugFromExternal: nextTabSubject.obs,
  }));

  useEffect(() => {
    if (tabSlugs.includes(nextTabSlugFromExternal)) {
      clearPageStack();
      // set the tab that was clicked to the current tab
      setActiveTabId(nextTabSlugFromExternal);
      // this effect doesn't get called unless the next value
      // is different from the previous one; we set the next
      // value of nextTabSubject to null so that consecutive
      // calls to setActiveTab for a particular tab slug work
      nextTabSubject.next(null);
    }
  }, [nextTabSlugFromExternal]);

  // action banners
  const { actionBannerObj, displayActionBanner, removeActionBanner } = useActionBannerManager();

  const [{ data: meRes, fetching: isFetchingUser }, reexecuteMeUserQuery] = useQuery({
    query: ME_QUERY,
  });
  const [isAuthDialogHidden, setIsAuthDialogHidden] = useState(true);

  useEffect(() => {
    if (!isFetchingUser) {
      if (!isMemberMeUser(meRes?.me)) {
        signInActionBannerIdRef.current = displayActionBanner(
          <ActionBanner
            action={<Button onClick={() => setIsAuthDialogHidden(false)}></Button>}
          >
            Finish setting up your account
          </ActionBanner>,
          "sign-in",
        );
      } else {
        removeActionBanner(signInActionBannerIdRef.current);
      }
    }
  }, [JSON.stringify(meRes?.me), isFetchingUser]);

  const className = `z-browser-extension-menu ${
    classKebab(
      { isOpen, hasNotification, isClaimable },
    )
  }`;
  // custom tab buttons
  const tabButtonManager = useTabButtonManager();
  const { additionalTabButtons } = useObservables(() => ({
    additionalTabButtons: tabButtonManager.buttonMapSubject.obs,
  }));

  const onAuthClose = async () => {
    setIsAuthDialogHidden(true);
    await reexecuteMeUserQuery({ requestPolicy: "network-only" });

    const result = await executeSigninMutation(
      {
        token: credentials?.token,
        isTransfer: true,
      },
      {
        additionalTypenames: [
          "Poll",
          "PollVote",
          "PollOption",
          "MeUser",
          "Collectible",
          "OwnedCollectible",
          "ActivePowerup",
        ],
      },
    );

    const mogulTvUser: MogulTvUser = result?.data?.mogulTvSignIn;
    setAccessToken(mogulTvUser?.truffleAccessToken);
    await reexecuteMeUserQuery({ requestPolicy: "network-only" });
  };

  const [credentials, setCredentials] = useState();

  useEffect(() => {
    const fetchCredentials = async () => {
      const credentials = await jumper.call("context.getCredentials");
      setCredentials(credentials);

      if (credentials?.sourceType === "youtube" && credentials?.token) {
        const result = await executeSigninMutation(
          {
            token: credentials?.token,
            isTransfer: false,
          },
          {
            additionalTypenames: [
              "Poll",
              "PollVote",
              "PollOption",
              "MeUser",
              "Collectible",
              "OwnedCollectible",
              "ActivePowerup",
            ],
          },
        );

        const mogulTvUser: MogulTvUser = result?.data?.mogulTvSignIn;
        setAccessToken(mogulTvUser?.truffleAccessToken);

        await reexecuteMeUserQuery({ requestPolicy: "network-only" });
      }

      // FIXME - add for twitch
      if (credentials?.sourceType === "twitch" && credentials?.token) {
        // model.auth.setAccessToken(credentials?.token)
        // model.graphqlClient.invalidateAll()
      }
    };

    fetchCredentials();
  }, []);
  const base = { x: 640, y: 600 };
  const defaultModifier = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    transition: "none",
  };
  const dragProps = {
    dimensions: {
      base: base,
      modifiers: defaultModifier,
    },
    defaultPosition: { x: 0, y: 0 },
  };

  // new iFrame styles
  const menuState = getMenuState({
    isOpen,
    isClaimable,
    snackBarQueue: undefined,
    shouldShowOnboardTooltip: undefined,
  });
  switch (menuState) {
    case "closed":
      dragProps.dimensions.modifiers = {
        ...defaultModifier,
        bottom: -560,
        left: -600,
        transition: "clip-path .5s cubic-bezier(.4, .71, .18, .99)",
      };
      break;
    case "closed-with-claim":
      //TODO: add the sizes for the other things once we implement them
      break;
    case "closed-with-snackbar":
      break;
    case "closed-with-tooltip":
      break;
  }
  return (
    <Draggable
      dimensions={dragProps.dimensions}
      defaultPosition={dragProps.defaultPosition}
      requiredClassName="extension-icon"
      ignoreClassName="z-browser-extension-menu"
    >
      <div className={className}>
        <div className="menu">
          <div className="inner">
            <div className="bottom">
              <div className="tabs">
                <div className="additional-tab-buttons">
                  {Object.values(additionalTabButtons)}
                </div>
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
                      <Ripple color="var(--mm-color-text-bg-primary)" />
                    </div>
                  );
                })}
              </div>
              {/* TODO: refactor channel points component */}
              {
                /*(hasChannelPoints || hasBattlePass) && canClaim && <div className="channel-points">
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
            </div> */
              }
              <div
                className="extension-icon"
                style={{
                  backgroundImage: iconImageObj
                    ? `url(${getSrcByImageObj(iconImageObj)})`
                    : undefined,
                }}
                ref={$$extensionIconRef}
                onClick={toggleIsOpen}
              >
                <Ripple color="var(--mm-color-text-bg-primary)" />
              </div>
            </div>
            {/* TODO: put back account linking logic */}
            {
              /*shouldShowSignupBanner && <ActionBanner
            message="Finish setting up your account"
            buttonText="Sign up"
            onClick={handleSignup}
          />*/
            }
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
              {!isAuthDialogHidden && (
                <AuthDialog
                  hidden={isAuthDialogHidden}
                  onclose={onAuthClose}
                />
              )}
              <DialogContainer />
              <TabButtonContext.Provider
                value={_.pick(tabButtonManager, [
                  "addButton",
                  "removeButton",
                  "clearButtons",
                ])}
              >
                <ActionBannerContext.Provider
                  value={{ displayActionBanner, removeActionBanner }}
                >
                  <TabStateContext.Provider value={tabStateManager}>
                    <PageStackContext.Provider value={{ pushPage, popPage }}>
                      <SnackBarProvider
                        visibilityDuration={SNACKBAR_ANIMATION_DURATION_MS}
                      />
                      <PageStack pageStackSubject={pageStackSubject} />
                      <ActionBannerContainer actionBannerObj={actionBannerObj} />
                      {visibleTabs.map(({ $el: TabComponent }, idx) => (
                        <TabIdContext.Provider key={idx} value={tabSlugs[idx]}>
                          <div
                            className={`tab-component ${
                              classKebab({
                                isActive: idx === activeTabIndex,
                              })
                            }`}
                          >
                            {TabComponent && <TabComponent />}
                          </div>
                        </TabIdContext.Provider>
                      ))}
                    </PageStackContext.Provider>
                  </TabStateContext.Provider>
                </ActionBannerContext.Provider>
              </TabButtonContext.Provider>
            </div>
          </div>
        </div>
        {/* TODO: refactor NewExtensionUserTooltip */}
        {
          /* <Modal isVisibleSubject={isOnboardTooltipVisibleSubject}>
        <NewExtensionUserTooltip
          hasViewedOnboardTooltipSubject={hasViewedOnboardTooltipSubject}
          $$extensionIconRef={$$extensionIconRef}
        />
      </Modal> */
        }
        {/* TODO: wire up */}
        {
          /* <Modal isVisibleSubject={isSignupVisibleSubject}>
        <SignUpForm
          source='extension-sign-up'
          prefillName={me?.name}
          infoMessage='Create an account to secure your collection'
          onComplete={transferJwt}
        />
      </Modal> */
        }
      </div>
    </Draggable>
  );
}
