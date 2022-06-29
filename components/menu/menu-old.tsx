import _ from "https://npm.tfl.dev/lodash?no-check";
import React, { useEffect, useMemo, useRef } from "https://npm.tfl.dev/react";

import {
  createSubject,
  Obs,
  op,
} from "https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import { getCookie } from "https://tfl.dev/@truffle/utils@0.0.1/cookie/cookie.js";
import classKebab from "https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js";
import jumper from "https://tfl.dev/@truffle/utils@0.0.1/jumper/jumper.js";
import { getHost } from "https://tfl.dev/@truffle/utils@0.0.1/request/request-info.js";
import {
  abbreviateNumber,
  formatCountdown,
  formatNumber,
} from "https://tfl.dev/@truffle/utils@0.0.1/format/format.js";

import { getModel } from "https://tfl.dev/@truffle/api@0.0.1/legacy/index.js";

import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.js";
// import Components from 'https://tfl.dev/@truffle/ui@0.0.1/components/components/components.js'
import Modal from "https://tfl.dev/@truffle/ui@0.0.1/components/modal/modal.js";
import Ripple from "https://tfl.dev/@truffle/ui@0.0.1/components/ripple/ripple.js";
import Icon from "https://tfl.dev/@truffle/ui@0.0.1/components/icon/icon.js";
import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@0.0.1/components/image-by-aspect-ratio/image-by-aspect-ratio.js";
import Spinner from "https://tfl.dev/@truffle/ui@0.0.1/components/spinner/spinner.js";
import SignUpForm from "https://tfl.dev/@truffle/ui@0.0.1/components/sign-up-form/sign-up-form.js";
import cssVars from "https://tfl.dev/@truffle/ui@0.0.1/util/css-vars.js";

import ChannelPoints from "../channel-points/channel-points.tsx";
import Page from "../page/page.tsx";
import SeasonPass from "../season-pass/season-pass.tsx";
import SnackBarContainer from "../snack-bar-container/snack-bar-container.tsx";

// FIXME: replace all <Component slug="..." /> w/ normal react
function Component() {
  return "";
}

const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 3600 * 1000;

const MESSAGE = {
  INVALIDATE_USER: "user.invalidate",
  SET_ACCESS_TOKEN: "user.setAccessToken",
};

const BASE_IFRAME_STYLES = {
  height: "600px",
  width: "640px",
  background: "transparent",
  "z-index": 2000,
  position: "absolute",
  overflow: "hidden",
  transition: "clip-path .5s cubic-bezier(.4,.71,.18,.99)",
};

const YOUTUBE_VIDEO_QUERY_SELECTOR = "#ytd-player > #container > #movie_player";
const TWITCH_VIDEO_QUERY_SELECTOR = ".video-player__container";

const BASE_IFRAME_STYLES_IN_VIDEO = {
  ...BASE_IFRAME_STYLES,
  // right: '20px',
  // top: '50px',
  // FAZEFIXME: rm faze styles
  right:
    typeof document !== "undefined" &&
    window.location?.hostname === "faze1.live"
      ? "10px"
      : "20px",
  top:
    typeof document !== "undefined" &&
    window.location?.hostname === "faze1.live"
      ? "72px"
      : "50px",
  "max-height": "calc(100% - 50px)",
};

const BASE_IFRAME_STYLES_IN_CHAT = {
  ...BASE_IFRAME_STYLES,
  right: "0",
  top: "-540px",
  "max-height": "none",
};

const BASE_TWITCH_IFRAME_STYLES_IN_CHAT = {
  ...BASE_IFRAME_STYLES,
  right: "calc(100% - 50px)",
};

const YOUTUBE_ICON_POSITIONS = [
  {
    positionSlug: "chat",
    text: "Below chat",
    layoutConfigSteps: [
      { action: "querySelector", value: "#show-hide-button" },
      { action: "setStyle", value: { height: "60px", position: "relative" } },
      { action: "appendSubject" },
      // center button
      { action: "querySelector", value: ".ytd-toggle-button-renderer" },
      { action: "setStyle", value: { height: "60px" } },
      { action: "useSubject" },
      { action: "resetStyles" }, // clear styles for our iframe (otherwise we have big empty iframe on page)
    ],
  },
  {
    positionSlug: "stream-top-right",
    text: "Top right of stream",
    layoutConfigSteps: [
      { action: "querySelector", value: YOUTUBE_VIDEO_QUERY_SELECTOR },
      { action: "appendSubject" },
      { action: "useSubject" },
      { action: "resetStyles" }, // clear styles for our iframe (otherwise we have big empty iframe on page)
    ],
  },
];

const TWITCH_ICON_POSITIONS = [
  {
    positionSlug: "chat",
    text: "Below chat",
    layoutConfigSteps: [
      { action: "querySelector", value: ".chat-input__buttons-container" },
      {
        action: "setStyle",
        value: {
          height: "55px",
          "align-items": "center",
          position: "relative",
        },
      },
      {
        action: "querySelector",
        value: ".chat-input__buttons-container > div",
      },
      {
        action: "setStyle",
        value: {
          height: "55px",
          "align-items": "center",
          "margin-left": "45px",
          position: "relative",
        },
      },
      { action: "insertSubjectBefore" },
      { action: "useSubject" },
      { action: "resetStyles" }, // clear styles for our iframe (otherwise we have big empty iframe on page)
    ],
  },
  {
    positionSlug: "stream-top-right",
    text: "Top right of stream",
    layoutConfigSteps: [
      // reset channel points positioning
      {
        action: "querySelector",
        value: ".chat-input__buttons-container > div",
      },
      { action: "setStyle", value: { "margin-left": "0px" } },
      // move to video
      { action: "useDocument" },
      { action: "querySelector", value: TWITCH_VIDEO_QUERY_SELECTOR },
      { action: "appendSubject" },
      { action: "useSubject" },
      { action: "resetStyles" }, // clear styles for our iframe (otherwise we have big empty iframe on page)
    ],
  },
];

const SNACKBAR_ANIMATION_DURATION_MS = 5000;

const CRYSTAL_BALL_ICON =
  "M2.72573 16.4978L3.834 15H16.166L17.2743 16.4978C17.4209 16.6959 17.5 16.9359 17.5 17.1824C17.5 17.818 16.9847 18.3333 16.3491 18.3333H3.65093C3.01529 18.3333 2.5 17.818 2.5 17.1824C2.5 16.9359 2.57913 16.6959 2.72573 16.4978ZM15.5903 14.1666C16.7779 12.8397 17.5 11.0875 17.5 9.16663C17.5 5.02449 14.1421 1.66663 10 1.66663C5.85786 1.66663 2.5 5.02449 2.5 9.16663C2.5 11.0875 3.22213 12.8397 4.40973 14.1666H15.5903ZM8.07311 3.75543C8.01941 3.61033 7.81418 3.61033 7.76049 3.75543L7.3807 4.78179C7.36382 4.82741 7.32785 4.86337 7.28223 4.88026L6.25588 5.26004C6.11078 5.31373 6.11078 5.51897 6.25588 5.57266L7.28223 5.95244C7.32785 5.96932 7.36382 6.00529 7.3807 6.05091L7.76049 7.07726C7.81418 7.22237 8.01941 7.22237 8.07311 7.07726L8.45289 6.05091C8.46977 6.00529 8.50574 5.96932 8.55136 5.95244L9.57771 5.57266C9.72282 5.51897 9.72282 5.31373 9.57771 5.26004L8.55136 4.88026C8.50574 4.86337 8.46977 4.82741 8.45289 4.78179L8.07311 3.75543ZM13.0731 5.4221C13.0194 5.277 12.8142 5.277 12.7605 5.4221L12.1556 7.05671C12.1387 7.10233 12.1028 7.1383 12.0572 7.15518L10.4225 7.76004C10.2774 7.81373 10.2774 8.01896 10.4225 8.07266L12.0572 8.67752C12.1028 8.6944 12.1387 8.73037 12.1556 8.77599L12.7605 10.4106C12.8142 10.5557 13.0194 10.5557 13.0731 10.4106L13.678 8.77599C13.6948 8.73037 13.7308 8.6944 13.7764 8.67752L15.411 8.07266C15.5561 8.01896 15.5561 7.81373 15.411 7.76004L13.7764 7.15518C13.7308 7.1383 13.6948 7.10233 13.678 7.05671L13.0731 5.4221Z";
const CRYSTAL_BALL_ICON_VIEWBOX = 20;
const TROPHY_ICON =
  "M21.1667 5.33331H17.5556V3.94442C17.5556 3.48261 17.184 3.11108 16.7222 3.11108H7.27778C6.81597 3.11108 6.44444 3.48261 6.44444 3.94442V5.33331H2.83333C2.37153 5.33331 2 5.70483 2 6.16664V8.11108C2 9.35067 2.78125 10.625 4.14931 11.6076C5.24306 12.3958 6.57292 12.8958 7.96875 13.0555C9.05903 14.8646 10.3333 15.6111 10.3333 15.6111V18.1111H8.66667C7.44097 18.1111 6.44444 18.8298 6.44444 20.0555V20.4722C6.44444 20.7014 6.63194 20.8889 6.86111 20.8889H17.1389C17.3681 20.8889 17.5556 20.7014 17.5556 20.4722V20.0555C17.5556 18.8298 16.559 18.1111 15.3333 18.1111H13.6667V15.6111C13.6667 15.6111 14.941 14.8646 16.0313 13.0555C17.4306 12.8958 18.7604 12.3958 19.8507 11.6076C21.2153 10.625 22 9.35067 22 8.11108V6.16664C22 5.70483 21.6285 5.33331 21.1667 5.33331ZM5.44792 9.80553C4.60069 9.19442 4.22222 8.51386 4.22222 8.11108V7.55553H6.45139C6.48611 8.68747 6.65278 9.68053 6.89583 10.5486C6.37153 10.368 5.88194 10.118 5.44792 9.80553V9.80553ZM19.7778 8.11108C19.7778 8.67011 19.1632 9.36456 18.5521 9.80553C18.1181 10.118 17.625 10.368 17.1007 10.5486C17.3438 9.68053 17.5104 8.68747 17.5451 7.55553H19.7778V8.11108Z";
const CROWN_ICON =
  "M18.5 18H5.5C5.225 18 5 18.225 5 18.5V19.5C5 19.775 5.225 20 5.5 20H18.5C18.775 20 19 19.775 19 19.5V18.5C19 18.225 18.775 18 18.5 18ZM20.5 8C19.6719 8 19 8.67188 19 9.5C19 9.72188 19.05 9.92812 19.1375 10.1188L16.875 11.475C16.3938 11.7625 15.7719 11.6 15.4937 11.1125L12.9469 6.65625C13.2812 6.38125 13.5 5.96875 13.5 5.5C13.5 4.67188 12.8281 4 12 4C11.1719 4 10.5 4.67188 10.5 5.5C10.5 5.96875 10.7188 6.38125 11.0531 6.65625L8.50625 11.1125C8.22813 11.6 7.60313 11.7625 7.125 11.475L4.86562 10.1188C4.95 9.93125 5.00312 9.72188 5.00312 9.5C5.00312 8.67188 4.33125 8 3.50312 8C2.675 8 2 8.67188 2 9.5C2 10.3281 2.67188 11 3.5 11C3.58125 11 3.6625 10.9875 3.74063 10.975L6 17H18L20.2594 10.975C20.3375 10.9875 20.4188 11 20.5 11C21.3281 11 22 10.3281 22 9.5C22 8.67188 21.3281 8 20.5 8Z";

const STORAGE_POSITION_PREFIX = "extensionIconPosition";
const STORAGE_TOOLTIP_PREFIX = "hasViewedOnboardTooltip";

const REFRESH_TIME_WHEN_OFFLINE_MS = 3 * 1000; // refetch every 3 seconds
const REFRESH_TIME_WHEN_LIVE_MS = 60 * 1000; // refetch every 60 seconds if online
const POLL_VISIBLE_MAX_TIME_MS = 3600 * 12 * 1000; // 12 hours
const EXTENSION_MENU_ANIMATION_MS = 500;

// want to scope each storage item to this ext mapping id
// so another yt channel's position doesn't interfere.
// (we also scope the cached LayoutConfigSteps to ext mapping id)
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

export default function $browserExtensionMenu(props) {
  if (typeof document === "undefined") return <></>;

  const {
    hasChannelPoints,
    hasBattlePass,
    iconImageObj,
    channelPointsImageObj,
    xpImageObj,
    hasSupportChat,
    darkChannelPointsImageObj,
    darkXpImageObj,
    creatorName,
  } = props;
  // TODO: rm when we update props for ludwig org (initial propType had typo)
  const highlightButtonBg = props.highlightButtonBg || props.highlighButtonBg;

  const $$extensionIconRef = useRef(null);
  const sourceTypeConnectionRef = useRef(null);

  const DEFAULT_TABS = [
    {
      text: "Home",
      slug: "home",
      imgUrl:
        "https://cdn.bio/assets/images/features/browser_extension/home.svg",
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
    /* {
      text: 'Settings',
      slug: 'settings',
      imgUrl:
        'https://cdn.bio/assets/images/features/browser_extension/cog.svg',
      $el: SettingsTab
    },
    {
      text: 'Sponsor',
      imgUrl: 'https://www.clipartmax.com/png/middle/240-2400861_nordvpn-review-nord-vpn-png-logo.png',
      bgColor: '#F5F5F5',
      textColor: 'black',
      iconSize: 50,
      $el: BrowserCommsTestTab
    } */
  ];

  const {
    isSignupVisibleSubject,
    isOnboardTooltipVisibleSubject,
    credentialsSubject,
    connectionObs,
    activePollConnectionObs,
    isOpenSubject,
    activeTabIndexSubject,
    tabBadgeStatesSubject,
    channelPointsOrgUserCounterObs,
    channelPointsOrgUserCounterTypeObs,
    seasonPassObs,
    extensionIconBadgeStateObs,
    transactionsObs,
    snackBarQueueSubject,
    timeWatchedSecondsSubject,
    secondsRemainingSubject,
    isLiveObs,
    refreshSubject,
    isClaimableSubject,
    pageStackSubject,
    sourceTypeConnectionObs,
    extensionIconPositionSubject,
    hasViewedOnboardTooltipSubject,
    sourceObs,
  } = useMemo(() => {
    try {
      const credentialsSubject = createSubject(null);
      const channelPointsOrgUserCounterTypeObs =
        getModel().orgUserCounterType.getBySlug("channel-points");

      let invalidateOrgUserCounterFn;
      const channelPointsOrgUserCounterObs =
        channelPointsOrgUserCounterTypeObs.pipe(
          op.switchMap((orgUserCounterType) => {
            if (orgUserCounterType) {
              const { invalidateFn, obs } =
                getModel().orgUserCounter.getMeByCounterTypeId(
                  orgUserCounterType.id,
                  { shouldReturnInvalidateFn: true }
                );
              invalidateOrgUserCounterFn = invalidateFn;
              return obs;
            } else {
              return Obs.of({ count: 0 });
            }
          })
        );

      const { invalidateFn: invalidateSeasonPassFn, obs: seasonPassObs } =
        getModel().seasonPass.getCurrent({ shouldReturnInvalidateFn: true });

      const transactionsObs = getModel()
        .economyTransaction.getAll({
          limit: 50,
          isSubjected: true,
          // debounce - don't need to invalidate multiple times if we're streaming back and xp and a cp transaction
          onNewData: _.debounce(
            (update) => {
              // can use update[0].newVal.amountValue for ui if we want
              invalidateOrgUserCounterFn?.();
              invalidateSeasonPassFn?.();
            },
            100,
            { trailing: true }
          ),
        })
        .pipe(
          op.map((economyTransactionConnection) => {
            return economyTransactionConnection?.nodes
              ? economyTransactionConnection.nodes
              : [];
          })
        );
      const activePollConnectionObs = getModel().poll.getAllSmall({
        isSubjected: true,
      });

      // keeps track of which tabs have a badge;
      // by default, none of the tabs have badges;
      // the value of this stream is a Map of (tabSlug -> badgeIsVisible)
      const tabBadgeStatesSubject = createSubject(
        new Map(DEFAULT_TABS.map((tab) => [tab.slug, false]))
      );
      // keeps track of whether or not the extension icon has a badge;
      // if at least one of the tabs has a visible badge, the extension will have a badge;
      // the value of this stream is a boolean
      const extensionIconBadgeStateObs = tabBadgeStatesSubject.obs.pipe(
        op.map((badges) =>
          Array.from(badges.values()).reduce(
            (acc, isVisible) => acc || isVisible
          )
        )
      );

      const snackBarQueueSubject = createSubject([]);

      const refreshSubject = createSubject("");

      const sourcePromise = jumper
        ?.call("context.getInfo")
        ?.catch(() => null)
        .then(
          (extensionInfo) =>
            extensionInfo?.pageInfo
              ? pageInfoToSource(extensionInfo.pageInfo)
              : { sourceType: "youtube" } // fallback for <= v3.0.9
        );
      const sourceObs = Obs.from(sourcePromise || "");

      const refreshAndSourceObs = Obs.combineLatest(
        refreshSubject.obs,
        sourceObs
      );

      const isLiveObs = refreshAndSourceObs.pipe(
        op.distinctUntilChanged((a, b) => a[0] === b[0]),
        op.switchMap(([refresh, source]) => {
          return source
            ? // only sourceType so zygote grabs by orgId instead of channel (for manual overrides)
              getModel().channel.getBySource({
                sourceType: source.sourceType,
                ignoreCache: true,
              })
            : Obs.of(null);
        }),
        op.map((channel) => channel?.isLive || false),
        op.publishReplay(1),
        op.refCount()
      );

      const sourceTypeConnectionObs = credentialsSubject.obs.pipe(
        op.switchMap((credentials) => {
          return getModel().connection.getConnectionByMeAndSource(
            credentials?.sourceType
          );
        })
      );

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
        isOnboardTooltipVisibleSubject: createSubject(false),
        isSignupVisibleSubject: createSubject(false),
        credentialsSubject,
        activePollConnectionObs,
        channelPointsOrgUserCounterTypeObs,
        channelPointsOrgUserCounterObs,
        seasonPassObs,
        isLiveObs,
        refreshSubject,
        sourceTypeConnectionObs,
        secondsRemainingSubject: createSubject(),
        timeWatchedSecondsSubject: createSubject(),
        isOpenSubject: createSubject(false),
        activeTabIndexSubject: createSubject(0),
        isClaimableSubject: createSubject(false),
        transactionsObs,
        tabBadgeStatesSubject,
        extensionIconBadgeStateObs,
        snackBarQueueSubject,
        pageStackSubject: createSubject([]),
        extensionIconPositionSubject: createSubject(extensionIconPositionObs),
        hasViewedOnboardTooltipSubject: createSubject(
          hasViewedOnboardTooltipObs
        ),
        sourceObs,
      };
    } catch (err) {
      console.log("err", err);
      return {};
    }
  }, []);

  const {
    me,
    isOpen,
    credentials,
    hasNotification,
    activePollConnection,
    activeTabIndex,
    tabBadgeStates,
    seasonPass,
    channelPoints,
    isLive,
    isClaimable,
    snackBarQueue,
    pageStack,
    org,
    sourceTypeConnection,
    extensionIconPosition,
    hasViewedOnboardTooltip,
    extensionInfo,
    source,
    orgUserWithKv,
  } = useObservables(() => ({
    me: getModel().user.getMe(),
    credentials: credentialsSubject.obs,
    isOpen: isOpenSubject.obs,
    hasNotification: extensionIconBadgeStateObs,
    activePollConnection: activePollConnectionObs,
    activeTabIndex: activeTabIndexSubject?.obs,
    tabBadgeStates: tabBadgeStatesSubject.obs,
    seasonPass: seasonPassObs,
    channelPoints: channelPointsOrgUserCounterObs,
    isLive: isLiveObs,
    snackBarQueue: snackBarQueueSubject.obs,
    // NOTE: even if we're not using it here, we need to subscribe here
    // so we can fire invalidations onNewData (eg updating channel points)
    transactions: transactionsObs,
    isClaimable: isClaimableSubject.obs,
    pageStack: pageStackSubject.obs,
    extensionInfo: Obs.from(jumper?.call("context.getInfo") || ""),
    org: getModel().org.getMe(),
    sourceTypeConnection: sourceTypeConnectionObs,
    extensionIconPosition: extensionIconPositionSubject.obs,
    hasViewedOnboardTooltip: hasViewedOnboardTooltipSubject.obs,
    source: sourceObs,
    orgUserWithKv: getModel().orgUser.getMeWithKV(),
  }));

  console.log("me", me, org);

  const isFaze = org?.slug === "faze";

  // TODO: onboard tooltip doesn't work in chat area
  // === false is important, so we don't show while loading (undefined/null)
  const shouldShowOnboardTooltip =
    hasViewedOnboardTooltip === false &&
    extensionIconPosition === "stream-top-right";

  sourceTypeConnectionRef.current = sourceTypeConnection;
  const hasConnectedAccount = sourceTypeConnectionRef.current;
  // pushes a component onto the page stack;
  // used for creating pages that take over
  // the whole extension UI (like the
  // prediction page, for example)
  const pushPage = (Component, props) => {
    const currentPageStack = pageStackSubject.getValue();
    pageStackSubject.next(currentPageStack.concat({ Component, props }));
  };

  const popPage = () => {
    const currentPageStack = pageStackSubject.getValue();
    pageStackSubject.next(currentPageStack.slice(0, -1));
  };

  const clearPageStack = () => {
    pageStackSubject.next([]);
  };

  const isPageStackEmpty = pageStack.length === 0;
  const PageStackHead = pageStack[pageStack.length - 1];

  // sets the badge state for a tab using its slug
  const setBadge = (slug, isShowing) => {
    tabBadgeStates.set(slug, isShowing);
    tabBadgeStatesSubject.next(tabBadgeStates);
  };

  // removes the badge from the actively selected tab
  const clearActiveTabBadge = () => {
    const tabSlug = visibleTabs[activeTabIndex].slug;
    setBadge(tabSlug, false);
  };

  // adds a snack-bar component to the snackBar queue
  const enqueueSnackBar = (snackBar) => {
    const snackBarQueue = snackBarQueueSubject.getValue();
    snackBarQueueSubject.next(snackBarQueue.concat(snackBar));
  };

  const mostRecentPoll = activePollConnection?.nodes?.[0];
  const isMostRecentPollOutdated =
    mostRecentPoll?.data?.hasWinner &&
    new Date(mostRecentPoll?.time).getTime() <
      Date.now() - POLL_VISIBLE_MAX_TIME_MS;
  const activePoll = isMostRecentPollOutdated ? null : mostRecentPoll;

  useEffect(() => {
    const fetchCredentials = async () => {
      const credentials = await jumper.call("context.getCredentials");
      credentialsSubject.next(credentials);

      if (credentials?.sourceType === "youtube" && credentials?.token) {
        getModel().mogulTv.signInWithMogulTvJwt(credentials.token);
      }

      if (credentials?.sourceType === "twitch" && credentials?.token) {
        getModel().auth.setAccessToken(credentials?.token);
        getModel().graphqlClient.invalidateAll();
      }
    };

    fetchCredentials();
  }, []);

  useEffect(() => {
    if (me && hasConnectedAccount) {
      const accessToken = getCookie("accessToken");
      if (accessToken) {
        // we need to set the access token in the background script so we can
        // a) grab the access token from local storage in the extension vs. a cross-site
        // cookie which can be blocked on certain browsers and b) to ensure we are using
        // the same user across iframes
        jumper.call("user.setAccessToken", { accessToken });
        jumper.call("comms.postMessage", MESSAGE.INVALIDATE_USER);
      }
    }
  }, [hasConnectedAccount]);

  useEffect(() => {
    const refreshInterval = setInterval(
      () => {
        refreshSubject.next(Math.random());
      },
      isLive ? REFRESH_TIME_WHEN_LIVE_MS : REFRESH_TIME_WHEN_OFFLINE_MS
    );

    return () => clearInterval(refreshInterval);
  }, [isLive]);

  useEffect(() => {
    const state = getMenuState({
      isOpen,
      isClaimable,
      snackBarQueue,
      shouldShowOnboardTooltip,
    });
    setMenuStyles({ state, jumper, extensionIconPosition, extensionInfo });
  }, [
    isOpen,
    isClaimable,
    snackBarQueue,
    extensionIconPosition,
    extensionInfo,
    shouldShowOnboardTooltip,
  ]);

  useEffect(() => {
    // TODO: we could get this to also work in chat position - looks really bad atm
    // not super important since we default to show in stream
    if (shouldShowOnboardTooltip) {
      isOnboardTooltipVisibleSubject.next(true);
    }
  }, [shouldShowOnboardTooltip]);

  // any time poll is updated, set the notif badge to true
  useEffect(() => {
    if (activePoll?.id) {
      if (activePoll?.data === null) {
        // set a badge on the predictions tab when a prediction is active
        setBadge("home", true);
        enqueueSnackBar(() => (
          <ActivePredictionSnackBar
            onLinkClick={() => {
              if (!isOpen) {
                isOpenSubject.next(true);
              }
              pushPage(() => (
                <PredictionPage
                  activePoll={activePoll}
                  channelPointsImageObj={channelPointsImageObj}
                  channelPointsOrgUserCounterObs={
                    channelPointsOrgUserCounterObs
                  }
                  onBack={popPage}
                />
              ));
            }}
          />
        ));
      }
    }
  }, [activePoll?.id]);

  useEffect(() => {
    if (!_.isEmpty(seasonPass?.seasonPassProgression?.changesSinceLastViewed)) {
      // set a badge on the battle pass tab when the user levels up
      setBadge("battle-pass", true);
      // notify the parent extension
      jumper.call("user.invalidateSporeUser", { orgId: org?.id });
      jumper.call("comms.postMessage", MESSAGE.INVALIDATE);
    }
  }, [seasonPass?.seasonPassProgression?.changesSinceLastViewed]);

  const toggleIsOpen = () => {
    if (isOpen) {
      // clear the badge of the active tab when the user
      // closes the extension menu
      clearActiveTabBadge();
      setTimeout(() => {
        clearPageStack();
      }, EXTENSION_MENU_ANIMATION_MS);
    }
    isOpenSubject.next(!isOpen);
  };

  const visibleTabs = DEFAULT_TABS.filter((tab) => {
    if (!hasChannelPoints) {
      return tab.slug !== "shop";
    }
    if (!hasBattlePass) {
      return tab.slug !== "battle-pass";
    }
    return true;
  });

  const onViewCollection = () => {
    // navigate to the profile page when the user
    // selects 'View collectibles' after purchasing a collectible
    const collectibleTabIndex = visibleTabs.findIndex(
      (tab) => tab.slug === "collection"
    );
    activeTabIndexSubject.next(collectibleTabIndex);
    overlay.close();
  };

  const $activeTabEl = visibleTabs[activeTabIndex].$el;

  const transferJwt = async () => {
    await getModel().mogulTv.signInWithMogulTvJwt(credentials.token, {
      isTransfer: true,
    });
  };

  const handleSignup = async () => {
    isSignupVisibleSubject.next(true);
  };

  const isNotFazeOrIsFazeEligible =
    !isFaze ||
    (orgUserWithKv?.keyValueConnection?.nodes?.find(
      ({ key }) => key === "isEligibleMerchGiveaway"
    )?.value === "yes" &&
      extensionInfo?.version); // make sure we're iframed by twitch/yt
  const canClaim = isLive && isNotFazeOrIsFazeEligible;

  const shouldShowSignupBanner = !isFaze && !getModel().user.isMember(me);
  const shouldShowTwitchBanner =
    !isFaze &&
    getModel().user.isMember(me) &&
    credentials?.sourceType === "twitch" &&
    !hasConnectedAccount;

  const className = `c-browser-extension-menu position-${extensionIconPosition} ${classKebab(
    { isOpen, hasNotification, isClaimable }
  )}`;

  return (
    <div className={className}>
      <style>
        {`
        .c-browser-extension-menu {
          --highlight-gradient: ${highlightButtonBg ?? cssVars.$bgBaseText};
        }
      `}
      </style>
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
        <Ripple color={cssVars.textColor} />
      </div>
      <div className="menu">
        <div className="inner">
          <div className="bottom">
            <div className="tabs">
              {_.map(visibleTabs, (tab, i) => {
                const isActive = i === activeTabIndex;
                const hasBadge = tabBadgeStates.get(tab.slug);
                return (
                  <div
                    key={i}
                    className={`tab ${classKebab({ isActive, hasBadge })}`}
                    onClick={() => {
                      // clear any badges when the user navigates away from the tab
                      clearActiveTabBadge();
                      clearPageStack();
                      // set the tab that was clicked to the current tab
                      activeTabIndexSubject.next(i);
                    }}
                  >
                    <div className="icon">
                      <ImageByAspectRatio
                        imageUrl={tab.imgUrl}
                        aspectRatio={1}
                        widthPx={18}
                        height={18}
                      />
                    </div>
                    <div className="title">
                      {tab.slug === "battle-pass"
                        ? getSeasonPassName(org)
                        : tab.text}
                    </div>
                    <Ripple color={cssVars.textColor} />
                  </div>
                );
              })}
            </div>
            {(hasChannelPoints || hasBattlePass) && canClaim && (
              <div className="channel-points">
                <ChannelPoints
                  {...{
                    hasText: isOpen,
                    fontColor: "#FFFFFF",
                    source,
                    connectionObs,
                    highlightButtonBg,
                    channelPointsImageObj,
                    hasChannelPoints,
                    hasBattlePass,
                    darkChannelPointsImageObj: hasChannelPoints
                      ? darkChannelPointsImageObj
                      : darkXpImageObj,
                    timeWatchedSecondsSubject,
                    secondsRemainingSubject,
                    onFinishedCountdown: () => {
                      // set a badge on the extension icon
                      // when the user is able to claim channel points
                      // setBadge('channel-points', true)
                      isClaimableSubject.next(true);
                    },
                    onClaim: ({ channelPointsClaimed, xpClaimed }) => {
                      // clear the badge when the user claims their channel points
                      // setBadge('channel-points', false)
                      isClaimableSubject.next(false);

                      // display a couple of snack bars to notify them of their rewards
                      hasChannelPoints &&
                        enqueueSnackBar(() => (
                          <ChannelPointsClaimSnackBar
                            channelPointsClaimed={channelPointsClaimed}
                            totalChannelPoints={channelPoints?.count}
                            channelPointsImageObj={channelPointsImageObj}
                            darkChannelPointsImageObj={
                              darkChannelPointsImageObj
                            }
                          />
                        ));
                      enqueueSnackBar(() => (
                        <XpClaimSnackBar
                          xpClaimed={xpClaimed}
                          totalXp={parseInt(seasonPass?.xp?.count || 0)}
                          xpImageObj={xpImageObj}
                          darkXpImageObj={darkXpImageObj}
                        />
                      ));
                    },
                  }}
                />
              </div>
            )}
            <div className="extension-icon-placeholder"></div>
          </div>
          {shouldShowSignupBanner && (
            <ActionBanner
              message="Finish setting up your account"
              buttonText="Sign up"
              onClick={handleSignup}
            />
          )}
          {shouldShowTwitchBanner &&
            getModel().user.isMember(me) &&
            credentials?.sourceType === "twitch" &&
            !hasConnectedAccount && <TwitchSignupBanner />}
          {
            // TODO: update to mockup spec w/ timer, etc...
            // make separate component so we're only rerendering on timer tick in that component
            // also only show if timer hasn't expired (make isPredictionExpiredObs)
            // ActionBanner should support a close icon
            getModel().user.isMember(me) && activePoll && isPageStackEmpty && (
              <ActionBanner
                message={`Prediction: ${activePoll.question}`}
                buttonText="Participate"
                onClick={() =>
                  pushPage(PredictionPage, {
                    activePoll,
                    channelPointsImageObj,
                    channelPointsOrgUserCounterObs,
                    onBack: popPage,
                  })
                }
              />
            )
          }
          {!isPageStackEmpty ? (
            <div className="page-stack">
              {<PageStackHead.Component {...PageStackHead.props} />}
            </div>
          ) : (
            <div className="body">
              {
                <$activeTabEl
                  {...{
                    handleSignup,
                    org,
                    extensionInfo,
                    activePoll,
                    credentialsSubject,
                    seasonPassObs,
                    channelPointsOrgUserCounterObs,
                    channelPointsOrgUserCounterTypeObs,
                    transactionsObs,
                    channelPointsImageObj,
                    darkChannelPointsImageObj,
                    xpImageObj,
                    darkXpImageObj,
                    highlightButtonBg,
                    onViewCollection,
                    hasSupportChat,
                    hasChannelPoints,
                    hasBattlePass,
                    isLive,
                    canClaim,
                    creatorName,
                    timeWatchedSecondsSubject,
                    secondsRemainingSubject,
                    visibleTabs,
                    enqueueSnackBar,
                    activeTabIndexSubject,
                    pushPage,
                    popPage,
                    extensionIconPositionSubject,
                  }}
                />
              }
            </div>
          )}
        </div>
      </div>
      <SnackBarContainer
        snackBarQueueSubject={snackBarQueueSubject}
        visibilityDuration={SNACKBAR_ANIMATION_DURATION_MS}
      />
      <Modal isVisibleSubject={isOnboardTooltipVisibleSubject}>
        <NewExtensionUserTooltip
          hasViewedOnboardTooltipSubject={hasViewedOnboardTooltipSubject}
          $$extensionIconRef={$$extensionIconRef}
        />
      </Modal>
      <Modal isVisibleSubject={isSignupVisibleSubject}>
        <SignUpForm
          source="extension-sign-up"
          prefillName={me?.name}
          infoMessage="Create an account to secure your collection"
          onComplete={transferJwt}
        />
      </Modal>
    </div>
  );
}

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

function NewExtensionUserTooltip({
  hasViewedOnboardTooltipSubject,
  $$extensionIconRef,
}) {
  const onClose = () => {
    jumper.call("storage.set", {
      key: getStorageKey(STORAGE_TOOLTIP_PREFIX),
      value: true,
    });
    hasViewedOnboardTooltipSubject.next(true);
    overlay.close();
  };

  return (
    <>
      <Component
        slug="positioned-overlay"
        props={{
          key: "tooltip",
          $$targetRef: $$extensionIconRef,
          anchor: "bottom-left",
          offset: {
            x: -160,
            y: 184,
          },
          onClose,
          zIndex: 9999999,
          $content: (
            <div className="c-extension-user-tooltip use-css-vars-creator">
              <div className="triangle" />
              <div className="message">
                Access the extension here for predictions and more
              </div>
              <div className="button">
                <Button
                  text="Got it"
                  size="medium"
                  style="primary-outline"
                  onclick={onClose}
                />
              </div>
            </div>
          ),
        }}
      />
    </>
  );
}

function getBaseStyles({ extensionIconPosition, extensionInfo }) {
  const twitchPageIdentifiers = getTwitchPageIdentifier(
    extensionInfo?.pageInfo
  );
  const baseStyles =
    extensionIconPosition === "chat"
      ? twitchPageIdentifiers
        ? BASE_TWITCH_IFRAME_STYLES_IN_CHAT
        : BASE_IFRAME_STYLES_IN_CHAT
      : BASE_IFRAME_STYLES_IN_VIDEO;

  return baseStyles;
}

function getIframeStyles({
  state = "open",
  extensionIconPosition,
  extensionInfo,
}) {
  const baseStyles = getBaseStyles({ extensionIconPosition, extensionInfo });
  if (state === "open") {
    const stateStyles = { "clip-path": "inset(0% 0% 0% 0%)" };
    return { ...baseStyles, ...stateStyles };
  }

  const closedStates = {
    // NOTE: i (austin) have no clue how these clips work :p
    // we should try to document/name them better
    "closed-with-claim": { width: "calc(100% - 88px)", heightPx: 55 },
    "closed-with-snackbar": { width: "calc(0% + 120px", heightPx: 100 },
    "closed-with-tooltip": { width: "calc(0% + 100px", heightPx: 200 },
    closed: { width: "calc(100% - 50px)", heightPx: 55 },
  };

  const { width, heightPx } = closedStates[state] || closedStates.closed;

  const stateStyles =
    extensionIconPosition === "chat"
      ? { "clip-path": `inset(calc(100% - ${heightPx}px) 0% 0% ${width})` }
      : { "clip-path": `inset(0% 0% calc(100% - ${heightPx}px) ${width})` };

  return {
    ...baseStyles,
    ...stateStyles,
  };
}

function setMenuStyles({
  state,
  jumper,
  extensionIconPosition,
  extensionInfo,
}) {
  const style = getIframeStyles({
    state,
    extensionIconPosition,
    extensionInfo,
  });

  jumper.call("layout.applyLayoutConfigSteps", {
    layoutConfigSteps: [
      { action: "useSubject" }, // start with our iframe
      { action: "setStyle", value: style },
    ],
  });
  // DEPRECATED: applyLayoutConfigSteps replaces in 3.1.0. can rm in late 2022
  jumper.call("dom.setStyle", {
    querySelector: "#spore-chrome-extension-menu",
    style: Object.entries(style)
      .map(([k, v]) => `${k}:${v}`)
      .join(";"),
  });
}

function TwitchSignupBanner() {
  const { twitchOAuthUrl } = useObservables(() => ({
    twitchOAuthUrl: getModel().connection.getOAuthUrlBySourceType("twitch"),
  }));

  const handleTwitchSignup = () => {
    const openedWindow = window.open(twitchOAuthUrl);

    clearInterval(openedWindowInterval);
    openedWindowInterval =
      openedWindow &&
      setInterval(() => {
        if (openedWindow.closed) {
          clearInterval(openedWindowInterval);
          getModel().graphqlClient.invalidateAll();
        }
      }, 500);
  };

  let openedWindowInterval;

  useEffect(() => {
    return () => {
      clearInterval(openedWindowInterval);
    };
  }, []);

  return (
    <ActionBanner
      message="Connect your Twitch account"
      buttonText="Connect"
      classNamePostfix={"twitch"}
      onClick={handleTwitchSignup}
    />
  );
}

function ActionBanner({ onClick, message, buttonText, classNamePostfix }) {
  return (
    <div className={`action-banner action-banner-style-${classNamePostfix}`}>
      <div className="info">{message}</div>
      <div className="signup">
        <Button text={buttonText} size="small" style="bg" onclick={onClick} />
      </div>
    </div>
  );
}

function SettingsPage({ extensionIconPositionSubject, extensionInfo, onBack }) {
  const { meObs, nameSubject, orgUserKVObs, nameColorSubject } = useMemo(() => {
    const meObs = getModel().user.getMe();
    const orgUserKVObs = getModel().orgUser.getMeWithKV();

    return {
      meObs,
      nameSubject: createSubject(
        meObs.pipe(op.map((user) => user?.name || ""))
      ),
      orgUserKVObs,
      nameColorSubject: createSubject(
        orgUserKVObs.pipe(
          op.map((orgUserKV) => {
            const keyValues = orgUserKV?.keyValueConnection?.nodes;
            const color =
              keyValues.find((kv) => kv.key === "nameColor")?.value || "";
            return color;
          })
        )
      ),
    };
  }, []);

  const { me, org, name, nameColor } = useObservables(() => ({
    me: meObs,
    org: getModel().org.getMe(),
    orgUserKV: orgUserKVObs,
    name: nameSubject.obs,
    nameColor: nameColorSubject.obs,
  }));

  const hasNameChanged = nameSubject.isChanged();
  const hasColorChanged = nameColorSubject.isChanged();

  const isChanged = hasNameChanged || hasColorChanged;

  const minVersionForSporeUserSettings = "3.2.0";
  const hasSporeUserSettings =
    extensionInfo?.version &&
    extensionInfo.version.localeCompare(
      minVersionForSporeUserSettings,
      undefined,
      { numeric: true, sensitivity: "base" }
    ) !== -1;

  const reset = () => {
    nameColorSubject.reset();
    nameSubject.reset();
  };

  const save = async () => {
    await getModel().user.requestLoginIfGuest(me, overlay, {
      props: { source: "extension-profile" },
    });

    if (hasNameChanged) {
      await getModel().user.upsert({ name: nameSubject.getValue() });
    }

    if (hasColorChanged) {
      const diff = {
        sourceType: "user",
        sourceId: me.id,
        key: "nameColor",
        value: nameColorSubject.getValue(),
      };
      await getModel().keyValue.upsert(diff);
    }

    jumper.call("user.invalidateSporeUser", { orgId: org?.id });
    jumper.call("comms.postMessage", MESSAGE.INVALIDATE_USER);
  };

  const SettingsPageContent = () => (
    <div className="c-settings-page_content">
      {hasSporeUserSettings && (
        <>
          <div className="name">
            <Component
              slug="input"
              props={{
                label: "Display name",
                valueSubject: nameSubject,
              }}
            />
          </div>
          <div className="color">
            <Component
              slug="input-color"
              props={{
                label: "Chat name color",
                colorSubject: nameColorSubject,
                isLabelVisible: true,
              }}
            />
          </div>
        </>
      )}
      <PositionChooser
        extensionInfo={extensionInfo}
        extensionIconPositionSubject={extensionIconPositionSubject}
      />
      {isChanged && (
        <Component
          slug="unsaved-snackbar"
          props={{
            onSave: save,
            onCancel: reset,
          }}
        />
      )}
    </div>
  );

  return (
    <Page title="Settings" content={<SettingsPageContent />} onBack={onBack} />
  );
}

function getExtensionPositions({ extensionInfo }) {
  const twitchPageIdentifiers = getTwitchPageIdentifier(
    extensionInfo?.pageInfo
  );

  const positions = twitchPageIdentifiers
    ? TWITCH_ICON_POSITIONS
    : YOUTUBE_ICON_POSITIONS;

  return positions;
}

function PositionChooser({ extensionInfo, extensionIconPositionSubject }) {
  const { extensionIconPosition } = useObservables(() => ({
    extensionIconPosition: extensionIconPositionSubject.obs,
  }));

  // TODO: LEGACY: remove in june 2022
  let allowsThirdPartyCookies;
  // 3.1.0 didn't play nicely with 3rd party cookies off
  if (extensionInfo?.version === "3.1.0") {
    try {
      window.localStorage.setItem("thirdPartyTest", "1");
      allowsThirdPartyCookies = true;
    } catch {}
  } else {
    allowsThirdPartyCookies = true;
  }

  const minVersionForLayoutConfigSteps = "3.1.0";
  const hasLayoutConfigSteps =
    extensionInfo?.version &&
    extensionInfo.version.localeCompare(
      minVersionForLayoutConfigSteps,
      undefined,
      { numeric: true, sensitivity: "base" }
    ) !== -1 &&
    allowsThirdPartyCookies;

  const positions = getExtensionPositions({ extensionInfo });

  const move = (position) => {
    const layoutConfigSteps = positions.find(
      ({ positionSlug }) => positionSlug === position
    ).layoutConfigSteps;
    jumper.call("storage.set", {
      key: getStorageKey(STORAGE_POSITION_PREFIX),
      value: position,
    });
    jumper.call("layout.setDefaultLayoutConfigSteps", { layoutConfigSteps });
    extensionIconPositionSubject.next(position);
  };

  return (
    <div className="c-position-chooser">
      <div className="label">Icon position:</div>
      {!hasLayoutConfigSteps && "Coming soon!"}
      {/* TODO: radio buttons (we don't have good component for that atm) */}
      {hasLayoutConfigSteps && (
        <>
          {positions.map((position) => {
            const isSelected =
              (extensionIconPosition || "stream-top-right") ===
              position.positionSlug;
            return (
              <div
                key={position.positionSlug}
                className={`option ${isSelected ? "is-selected" : ""}`}
                onClick={() => move(position.positionSlug)}
              >
                {position.text}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function PredictionPage({
  activePoll,
  channelPointsImageObj,
  channelPointsOrgUserCounterObs,
  onBack,
}) {
  const { channelPoints } = useObservables(() => ({
    channelPoints: channelPointsOrgUserCounterObs,
  }));

  const channelPointsSrc = channelPointsImageObj
    ? getModel().image.getSrcByImageObj(channelPointsImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  let pageContent;
  if (!activePoll) {
    pageContent = (
      <div className="c-prediction-page_no-active-predictions">
        <div>
          <Icon
            icon={CRYSTAL_BALL_ICON}
            color={cssVars.$bgBaseText60}
            size="40px"
            viewBox={CRYSTAL_BALL_ICON_VIEWBOX}
          />
        </div>
        <div className="text">No active predictions</div>
      </div>
    );
  } else {
    pageContent = (
      <Component
        slug="active-prediction"
        props={{
          isForm: true,
        }}
      />
    );
  }

  return (
    <Component
      slug="browser-extension-menu-page"
      props={{
        title: "Prediction",
        headerTopRight: (
          <div className="c-predictions-page_channel-points">
            <div className="icon">
              <ImageByAspectRatio
                imageUrl={channelPointsSrc}
                aspectRatio={1}
                widthPx={16}
                height={16}
              />
            </div>
            <div className="amount" title={formatNumber(channelPoints?.count)}>
              {abbreviateNumber(channelPoints?.count || 0, 1)}
            </div>
          </div>
        ),
        onBack,
        content: pageContent,
      }}
    />
  );
}

function CollectionTab({
  org,
  onViewCollection,
  enqueueSnackBar,
  channelPointsImageObj,
  xpImageObj,
  visibleTabs,
  activeTabIndexSubject,
  hasBattlePass,
  hasChannelPoints,
  pushPage,
  popPage,
}) {
  return (
    <Component
      slug="collectibles"
      props={{
        onViewCollection,
        enqueueSnackBar,
        pushPage,
        popPage,
        $emptyState: (props) => (
          <ExtensionMenuCollectibleEmptyState
            org={org}
            groupedCollectibles={props.groupedCollectibles}
            channelPointsImageObj={channelPointsImageObj}
            xpImageObj={xpImageObj}
            visibleTabs={visibleTabs}
            activeTabIndexSubject={activeTabIndexSubject}
            hasBattlePass={hasBattlePass}
            hasChannelPoints={hasChannelPoints}
          />
        ),
      }}
    />
  );
}

function ChannelPointsShopTab(props) {
  const {
    channelPointsOrgUserCounterObs,
    channelPointsImageObj,
    onViewCollection,
    enqueueSnackBar,
  } = props;

  const channelPointsSrc = channelPointsImageObj
    ? getModel().image.getSrcByImageObj(channelPointsImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/channel-points.svg";

  const onHowToEarnClick = () => {
    overlay.open(() => (
      <ChannelPointsActionsDialog channelPointsSrc={channelPointsSrc} />
    ));
  };

  return (
    <>
      <Component
        slug="channel-points-shop"
        props={{
          channelPointsOrgUserCounterObs,
          channelPointsImageObj,
          onViewCollection,
          onHowToEarnClick,
          enqueueSnackBar,
        }}
      />
    </>
  );
}

function SeasonPassTab(props) {
  const { onViewCollection, highlightButtonBg, enqueueSnackBar } = props;

  const { org } = useObservables(() => ({
    org: getModel().org.getMe(),
  }));

  const xpSrc = props?.xpImageObj
    ? getModel().image.getSrcByImageObj(props.xpImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/xp.svg";

  const onHowToEarnClick = () => {
    overlay.open(() => <XpActionsDialog xpSrc={xpSrc} />);
  };
  return (
    <div className="c-mogul-pass-tab">
      <SeasonPass
        onViewCollection={onViewCollection}
        highlightButtonBg={highlightButtonBg}
        enqueueSnackBar={enqueueSnackBar}
      />
      <div className="title">Earn XP</div>
      <div className="description">
        Connect your accounts to start earning XP
      </div>
      <div className="learn-more" onClick={onHowToEarnClick}>
        How do I earn XP?
      </div>
      {org?.slug !== "faze" && (
        <Component
          slug="browser-extension-ways-to-earn"
          props={{ enqueueSnackBar }}
        />
      )}
    </div>
  );
}

function HomeTab({
  handleSignup,
  connectionObs,
  channelPointsOrgUserCounterObs,
  seasonPassObs,
  channelPointsImageObj,
  xpImageObj,
  transactionsObs,
  hasSupportChat,
  isLive,
  canClaim,
  highlightButtonBg,
  timeWatchedSecondsSubject,
  secondsRemainingSubject,
  creatorName,
  hasChannelPoints,
  hasBattlePass,
  visibleTabs,
  activeTabIndexSubject,
  onViewCollection,
  enqueueSnackBar,
  pushPage,
  popPage,
  extensionIconPositionSubject,
  extensionInfo,
}) {
  const { activePowerupsObs } = useMemo(() => {
    const orgUserActivePowerupConnectionObs =
      getModel().orgUser.getMeActivePowerupsWithJsx();
    const activePowerupsObs = orgUserActivePowerupConnectionObs.pipe(
      op.map((orgUser) => {
        return orgUser?.activePowerupConnection?.nodes ?? [];
      })
    );
    return {
      activePowerupsObs,
    };
  }, []);

  const { me, org, activePowerups, channelPoints, xp } = useObservables(() => ({
    me: getModel().user.getMe(),
    org: getModel().org.getMe(),
    activePowerups: activePowerupsObs,
    channelPoints: channelPointsOrgUserCounterObs,
    xp: seasonPassObs.pipe(op.map((seasonPass) => seasonPass?.xp?.count)),
  }));

  const channelPointsSrc = channelPointsImageObj
    ? getModel().image.getSrcByImageObj(channelPointsImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  const xpSrc = xpImageObj
    ? getModel().image.getSrcByImageObj(xpImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/xp.svg";

  const handleOpenNotificationDialog = () => {
    overlay.open(() => (
      <Component
        slug="browser-extension-notification-dialog"
        props={{
          transactionsObs,
          channelPointsImageObj,
          seasonPassObs,
          xpImageObj,
        }}
      />
    ));
  };

  const handleOpenSupportChat = () => {
    const supportChatUrl = `${getHost()}/chat/support`;
    window.open(supportChatUrl, "_blank");
  };

  // TODO: home tab should be "components" component that accepts other components
  // so creators would add the advert component and set the props on that
  const adverts = {
    ludwig: {
      className: "base-ad-tile",
      imageSrc:
        "https://cdn.bio/assets/images/creators/ludwig/ludwig_mondays.jpg",
      hashtag: "#announcement",
      tagline: "Ludwig Mondays featuring Fortnite",
      buttonHref: "https://twitter.com/LudwigAhgren/status/1513659955663888385",
      // buttonOnClick,
      buttonText: "Learn more",
      buttonBgColor: "var(--secondary-base)",
      buttonTextColor: "var(--secondary-base-text)",
    },
  };

  // reduce jank by showing spinner until we know if they're live or not
  // other wise the live box loads in later and pushes everything else down
  const isLoading = isLive == null;

  return (
    <div className="c-home-tab">
      <div className="header">
        <div className="user">
          <AccountAvatar />
          <div className="info">
            <div className="top">
              <div className="name">{me?.name}</div>
              <ActivePowerups activePowerups={activePowerups} />
            </div>
            <div className="amounts">
              {hasChannelPoints && (
                <div className="amount">
                  <div className="icon">
                    <ImageByAspectRatio
                      imageUrl={channelPointsSrc}
                      aspectRatio={1}
                      widthPx={20}
                      height={20}
                    />
                  </div>
                  <div className="amount">
                    {abbreviateNumber(channelPoints?.count || 0, 1)}
                  </div>
                </div>
              )}
              <div className="amount">
                <div className="icon">
                  <ImageByAspectRatio
                    imageUrl={xpSrc}
                    aspectRatio={1}
                    widthPx={24}
                    height={24}
                  />
                </div>
                <div className="amount">{abbreviateNumber(xp || 0, 1)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
          <div className="icon">
            <Icon
              icon="help"
              onclick={handleOpenSupportChat}
              color={cssVars.$bgBaseText}
              hasRipple={true}
              size="24px"
              iconViewBox="24px"
            />
          </div>
          <div className="icon">
            <Icon
              icon="settings"
              onclick={() =>
                pushPage(SettingsPage, {
                  extensionIconPositionSubject,
                  extensionInfo,
                  onBack: popPage,
                })
              }
              color={cssVars.$bgBaseText}
              hasRipple={true}
              size="24px"
              iconViewBox="24px"
            />
          </div>
          <div className="icon">
            <Icon
              icon="bell"
              onclick={handleOpenNotificationDialog}
              color={cssVars.$bgBaseText}
              hasRipple={true}
              size="24px"
              iconViewBox="24px"
            />
          </div>
        </div>
      </div>
      <div className="tile-grid">
        {isLoading && <Spinner />}
        {!isLoading && (
          <>
            {canClaim && (
              <IsLiveInfo
                secondsRemainingSubject={secondsRemainingSubject}
                timeWatchedSecondsSubject={timeWatchedSecondsSubject}
                highlightButtonBg={highlightButtonBg}
                creatorName={creatorName}
                hasChannelPoints={hasChannelPoints}
                hasBattlePass={hasBattlePass}
              />
            )}
          </>
        )}
        {!["dev", "faze"].includes(org?.slug) && (
          <>
            <LeaderboardTile />
            <PredictionTile
              pushPage={pushPage}
              channelPointsImageObj={channelPointsImageObj}
              channelPointsOrgUserCounterObs={channelPointsOrgUserCounterObs}
              popPage={popPage}
            />
            <KothTile />
          </>
        )}
        {adverts[org?.slug] && <Advert {...adverts[org.slug]} />}
        {["faze", "dev"].includes(org?.slug) && (
          <>
            {/* HACK/hardcode for faze1 */}
            <FazeGiveaway handleSignup={handleSignup} />
            <FazeSponsors />
          </>
        )}
      </div>
    </div>
  );
}

// HACK/hardcode for faze1. rm this (and all other faze instances in code) 6/1/2022
function FazeSponsors() {
  const sponsors = [
    {
      imageSrc:
        "https://cdn.bio/assets/images/creators/faze/moonpay_sponsor.png",
      url: "https://www.moonpay.com",
    },
  ];
  return (
    <div className="c-faze-sponsors">
      {sponsors.map(({ imageSrc, url }) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="sponsor"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
      ))}
    </div>
  );
}

// HACK/hardcode for faze1. rm this (and all other faze instances in code) 6/1/2022
function FazeGiveaway({ handleSignup }) {
  const { meOrgUserWithKv } = useObservables(() => ({
    meOrgUserWithKv: getModel().orgUser.getMeWithKV(),
  }));

  const isEligibleCryptoGiveawayKv =
    meOrgUserWithKv?.keyValueConnection?.nodes?.find(
      ({ key }) => key === "isEligibleCryptoGiveaway"
    );

  const isAlmostEligibleCryptoGiveawayKv =
    meOrgUserWithKv?.keyValueConnection?.nodes?.find(
      ({ key }) => key === "isAlmostEligibleCryptoGiveaway"
    );

  const isEligibleMerchGiveawayKv =
    meOrgUserWithKv?.keyValueConnection?.nodes?.find(
      ({ key }) => key === "isEligibleMerchGiveaway"
    );

  const hasFilledOutEligibility =
    isEligibleCryptoGiveawayKv || isEligibleMerchGiveawayKv;
  const isEligibleCryptoGiveaway = isEligibleCryptoGiveawayKv?.value === "yes";
  const isEligibleMerchGiveaway = isEligibleMerchGiveawayKv?.value === "yes";
  const isAlmostEligibleCryptoGiveaway =
    isAlmostEligibleCryptoGiveawayKv?.value === "yes";

  const configs = {
    needsEligibilityInfo: {
      text: "Become eligible for the Moonpay $185,000 Crypto Giveaway",
      onclick: async () => {
        await handleSignup();
        overlay.open(() => <Component slug="faze-eligibility-dialog" />);
      },
      buttonText: "Enter now!",
    },
    eligibleBoth: {
      text: "You’re eligible for the MoonPay $185,000 Crypto and FaZe Merch Voucher Giveaways!",
    },
    eligibleMerchGiveaway: {
      text: "You’re eligible for the FaZe Merch Voucher Giveaway!",
    },
    almostEligibleCryptoGiveaway: {
      text: "You’re eligible for the FaZe Merch Voucher Giveaway! You can still enter an ETH Wallet to become eligible for crypto giveaway",
      onclick: async () => {
        overlay.open(() => (
          <Component
            slug="faze-eligibility-dialog"
            props={{ onlyNeedsEthWallet: true }}
          />
        ));
      },
      buttonText: "Update info",
    },
    ineligible: {
      text: "Unfortunately you're ineligible for this giveaway!",
    },
  };

  const status = !hasFilledOutEligibility
    ? "needsEligibilityInfo"
    : isEligibleCryptoGiveaway && isEligibleMerchGiveaway
    ? "eligibleBoth"
    : !isEligibleCryptoGiveaway &&
      isEligibleMerchGiveaway &&
      isAlmostEligibleCryptoGiveaway
    ? "almostEligibleCryptoGiveaway"
    : isEligibleMerchGiveaway
    ? "eligibleMerchGiveaway"
    : "ineligible";

  const config = configs[status];

  return (
    <div className="c-faze-giveaway">
      <div className="header-image">
        <ImageByAspectRatio
          imageUrl={
            "https://cdn.bio/assets/images/creators/faze/giveaway_header.png"
          }
          aspectRatio={568 / 36}
          isStretch={true}
        />
      </div>
      <div className="text">{config.text}</div>
      {config.onclick && (
        <Button
          text={config.buttonText}
          size="large"
          style="bg"
          onclick={config.onClick}
        />
      )}
    </div>
  );
}

const LEADERBOARD_LIMIT = 3;
function LeaderboardTile() {
  const { leaderboardCountersObs } = useMemo(() => {
    const seasonPassObs = getModel().seasonPass.getCurrent();
    const leaderboardCountersObs = seasonPassObs.pipe(
      op.switchMap((seasonPass) =>
        seasonPass
          ? getModel().orgUserCounter.getAllByCounterTypeId(
              seasonPass.orgUserCounterTypeId,
              { limit: LEADERBOARD_LIMIT }
            )
          : Obs.of(null)
      )
    );

    return {
      leaderboardCountersObs,
    };
  }, []);

  const { leaderboardCounters } = useObservables(() => ({
    leaderboardCounters: leaderboardCountersObs,
  }));

  let userRanks = _.map(leaderboardCounters?.nodes, (orgUserCounter, i) => {
    return {
      ...orgUserCounter,
      count: parseInt(orgUserCounter.count),
    };
  });

  userRanks = _.orderBy(userRanks, ["count"], ["desc"]);
  userRanks = _.uniqBy(userRanks, (rank) => rank.orgUser?.user?.id);
  userRanks = _.map(userRanks, (rank, i) => ({ ...rank, place: i }));

  const top3 = _.take(userRanks, 3);
  const ranks = [
    {
      text: "1st",
      color: "#EBC564",
    },
    {
      text: "2nd",
      color: "#ADBCCD",
    },
    {
      text: "3rd",
      color: "#EE8A41",
    },
  ];

  return (
    <Tile
      className="leaderboard-tile"
      icon={TROPHY_ICON}
      headerText="Top Battlepass"
      color="#CEDEE3"
      content={() => (
        <div className="content">
          {top3.map((contestant, idx) => (
            <div className="contestant" key={idx}>
              <div
                className="avatar"
                style={{
                  borderColor: ranks[idx].color,
                }}
              >
                <Component
                  slug="avatar"
                  props={{
                    user: contestant?.orgUser?.user,
                    size: "44px",
                  }}
                />
                <div className="username">
                  {contestant?.orgUser?.user?.name}
                </div>
              </div>
              <div
                className="rank"
                style={{
                  color: ranks[idx].color,
                }}
              >
                {ranks[idx].text}
              </div>
            </div>
          ))}
        </div>
      )}
    />
  );
}

function KothTile() {
  const { kingOrgUserObs } = useMemo(() => {
    const orgConfigObs = getModel().orgConfig.getMeWithData();
    const kingOrgUserObs = orgConfigObs.pipe(
      op.switchMap((orgConfig) =>
        orgConfig?.data?.kingOfTheHill?.userId
          ? getModel().orgUser.getByUserIdWithPowerups(
              orgConfig?.data?.kingOfTheHill?.userId
            )
          : Obs.of(null)
      )
    );
    return {
      kingOrgUserObs,
    };
  }, []);

  const { kingOrgUser } = useObservables(() => ({
    kingOrgUser: kingOrgUserObs,
  }));

  if (!kingOrgUser) return;

  const activePowerups = kingOrgUser.activePowerupConnection?.nodes;

  return (
    <Tile
      className="king-tile"
      icon={CROWN_ICON}
      headerText="King of the Hill"
      color="#E0BB72"
      content={() => (
        <div className="content">
          <div className="avatar">
            <Component
              slug="avatar"
              props={{
                user: kingOrgUser?.user,
                size: "56px",
              }}
            />
          </div>
          <div className="info">
            <div className="username">{kingOrgUser.name}</div>
            <div className="powerups">
              <ActivePowerups activePowerups={activePowerups} />
            </div>
          </div>
        </div>
      )}
    />
  );
}

function PredictionTile({
  pushPage,
  channelPointsImageObj,
  channelPointsOrgUserCounterObs,
  popPage,
}) {
  const { activePollConnectionObs, pollMsLeftSubject, isPredictionExpiredObs } =
    useMemo(() => {
      const activePollConnectionObs = getModel().poll.getAllSmall({
        isSubjected: true,
        // TODO: fix bug: https://discord.com/channels/839188384752599071/845377383870890055/963515614771683338
        // limit: 10
      });

      const activePollObs = activePollConnectionObs.pipe(
        op.map((activePollConnection) => {
          return activePollConnection?.nodes?.[0];
        })
      );

      const pollMsLeftSubject = createSubject(
        activePollObs.pipe(
          op.map(
            (activePoll) =>
              new Date(activePoll?.endTime || Date.now()) - new Date()
          )
        )
      );

      return {
        activePollConnectionObs,
        activePollObs,
        pollMsLeftSubject,
        isPredictionExpiredObs: pollMsLeftSubject.obs.pipe(
          op.map((msLeft) => msLeft <= 0)
        ),
      };
    }, []);

  const { activePollConnection, isPredictionExpired } = useObservables(() => ({
    activePollConnection: activePollConnectionObs,
    isPredictionExpired: isPredictionExpiredObs,
  }));

  const activePoll = activePollConnection?.nodes?.[0];
  const hasWinner = activePoll?.data?.winningOptionIndex !== undefined;

  if (!activePoll) return;

  let Content;

  if (isPredictionExpired && hasWinner) {
    Content = () => (
      <div className="content">
        <div className="primary-text">{activePoll?.question}</div>
        <div className="secondary-text">The results are in!</div>
      </div>
    );
  } else if (isPredictionExpired) {
    Content = () => (
      <div className="content">
        <div className="primary-text">{activePoll?.question}</div>
        <div className="secondary-text">Submissions closed</div>
      </div>
    );
  } else {
    Content = () => (
      <div className="content">
        <div className="primary-text">{activePoll?.question}</div>
        <div className="secondary-text">
          <span>Submissions closing in</span>
          <Component
            slug="timer"
            props={{
              timerMsSubject: pollMsLeftSubject,
              renderFn: (timerMs) => {
                const hours = Math.floor(timerMs / ONE_HOUR_MS);
                timerMs = timerMs % ONE_HOUR_MS;
                const minutes = Math.floor(timerMs / ONE_MINUTE_MS);
                timerMs = timerMs % ONE_MINUTE_MS;
                const seconds = Math.floor(timerMs / ONE_SECOND_MS);

                return (
                  <span className="timer">
                    {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                  </span>
                );
              },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Tile
      className="prediction-tile"
      icon={CRYSTAL_BALL_ICON}
      iconViewBox={CRYSTAL_BALL_ICON_VIEWBOX}
      headerText="Prediction"
      color="#AB8FE9"
      onClick={() =>
        pushPage(PredictionPage, {
          activePoll,
          channelPointsImageObj,
          channelPointsOrgUserCounterObs,
          onBack: popPage,
        })
      }
      content={Content}
    />
  );
}

function Tile(props) {
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
  if (!textColor) textColor = cssVars.$bgBaseText;

  const Header = () => {
    return (
      <div
        className="header"
        style={{
          backgroundColor: color,
        }}
      >
        <div
          className="icon"
          style={{
            borderColor: color,
          }}
        >
          <Component
            slug="icon"
            props={{
              icon,
              viewBox: iconViewBox,
              size: "24px",
              color,
            }}
          />
        </div>
        <div className="text">{headerText}</div>
      </div>
    );
  };
  return (
    <div
      className={`c-tile ${className} ${classKebab({ clickable: !!onClick })}`}
      onClick={onClick}
    >
      <Header />
      <Content />
      {onClick && <Ripple color={color} />}
    </div>
  );
}

function Advert(props) {
  const {
    className,
    imageSrc,
    hashtag,
    tagline,
    buttonHref,
    buttonOnClick,
    buttonText,
    buttonBgColor,
    buttonTextColor,
  } = props;

  return (
    <div className={`c-advert ${className}`}>
      <div className="image">
        <img src={imageSrc} alt="Ad" />
      </div>
      <div className="content">
        <div className="text">
          {/* <div className='ad'>#ad</div> */}
          <div className="ad">{hashtag}</div>
          <div className="tagline">{tagline}</div>
        </div>
        <div className="actions">
          <Button
            text={buttonText}
            bgColor={buttonBgColor}
            borderRadius="4px"
            textColor={buttonTextColor}
            href={buttonHref}
            onclick={buttonOnClick}
          />
        </div>
      </div>
    </div>
  );
}

function IsLiveInfo(props) {
  const {
    secondsRemainingSubject,
    timeWatchedSecondsSubject,
    highlightButtonBg,
    creatorName,
    hasChannelPoints,
    hasBattlePass,
  } = props;

  const { secondsRemaining, timeWatchedSeconds } = useObservables(() => ({
    timeWatchedSeconds: timeWatchedSecondsSubject.obs,
    secondsRemaining: secondsRemainingSubject.obs,
  }));

  return (
    <div className="live-info">
      <div
        className="header"
        style={{
          background: highlightButtonBg,
        }}
      >
        {creatorName ? `${creatorName} is live!` : ""}
      </div>
      <div className="info">
        <div className="message">
          {creatorName
            ? hasChannelPoints && hasBattlePass
              ? `Earn channel points and XP by watching ${creatorName} during the stream`
              : hasChannelPoints
              ? `Earn channel points by watching ${creatorName} during the stream`
              : hasBattlePass
              ? `Earn XP by watching ${creatorName} during the stream`
              : "Channel Points and XP not currently enabled"
            : "Channel Points and XP not currently enabled"}
        </div>
        <div className="grid">
          {(hasChannelPoints || hasBattlePass) && (
            <Timer timerSeconds={timeWatchedSeconds} message={"Time watched"} />
          )}
          {(hasChannelPoints || hasBattlePass) && (
            <Timer
              timerSeconds={secondsRemaining}
              message={"Time until reward"}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Timer({ timerSeconds, message }) {
  return (
    <div className="timer">
      {
        <>
          <div className="time">
            {timerSeconds !== undefined
              ? formatCountdown(timerSeconds, { shouldAlwaysShowHours: false })
              : ""}
          </div>
          <div className="title">{message}</div>
        </>
      }
    </div>
  );
}
// function SettingsTab ({ props }) {
//   const { twitchGlobalEmotesValueSubject } = useMemo(() => {
//     return {
//       twitchGlobalEmotesValueSubject: createSubject('')
//     }
//   }, [])

//   return <div className="c-settings-tab">
//     <Component slug="browser-extension-settings" />
//   </div>
// }

function AccountAvatar() {
  const { me, org } = useObservables(() => ({
    me: getModel().user.getMe(),
    org: getModel().org.getMe(),
  }));

  return (
    <div className="c-account-avatar">
      {
        <a href={`${getHost()}/edit-profile`} target="_blank" rel="noreferrer">
          <Component
            slug="avatar"
            props={{
              user: me,
              size: "72px",
            }}
          />
        </a>
      }
    </div>
  );
}

function ChannelPointsClaimSnackBar({
  channelPointsClaimed = 20,
  totalChannelPoints = 0,
  channelPointsImageObj,
  darkChannelPointsImageObj,
}) {
  // const channelPointsSrc = channelPointsImageObj ? getModel().image.getSrcByImageObj(channelPointsImageObj) : 'https://cdn.bio/assets/images/features/browser_extension/channel-points.svg'
  const darkChannelPointsSrc = channelPointsImageObj
    ? getModel().image.getSrcByImageObj(darkChannelPointsImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/channel-points-default-dark.svg";

  return (
    <Component
      slug="snack-bar"
      props={{
        message: `${channelPointsClaimed} channel points added!`,
        value: (
          <>
            <div>
              {abbreviateNumber(
                parseInt(totalChannelPoints) + parseInt(channelPointsClaimed),
                1
              )}
            </div>
            <ImageByAspectRatio
              imageUrl={darkChannelPointsSrc}
              aspectRatio={1}
              width={16}
              height={16}
            />
          </>
        ),
      }}
    />
  );
}

function XpClaimSnackBar({
  xpClaimed = 1,
  totalXp = 0,
  xpImageObj,
  darkXpImageObj,
}) {
  // const xpSrc = xpImageObj ? getModel().image.getSrcByImageObj(xpImageObj) : 'https://cdn.bio/assets/images/features/browser_extension/xp.svg'
  const darkXpSrc = xpImageObj
    ? getModel().image.getSrcByImageObj(darkXpImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/xp-dark.svg";

  return (
    <Component
      slug="snack-bar"
      props={{
        message: `${xpClaimed} XP earned!`,
        value: (
          <>
            <div>
              {abbreviateNumber(parseInt(totalXp) + parseInt(xpClaimed), 1)}
            </div>
            <ImageByAspectRatio
              imageUrl={darkXpSrc}
              aspectRatio={1}
              width={20}
              height={20}
            />
          </>
        ),
      }}
    />
  );
}

function ActivePredictionSnackBar({ onLinkClick }) {
  return (
    <Component
      slug="snack-bar"
      props={{
        className: "always-visible",
        message: (
          <>
            <Component
              slug="icon"
              props={{
                icon: CRYSTAL_BALL_ICON,
                color: cssVars.$bgBaseText60,
                size: "20px",
                viewBox: CRYSTAL_BALL_ICON_VIEWBOX,
              }}
            />
            <div style={"margin-left: 4px;"} className="info">
              {"Prediction started"}
            </div>
          </>
        ),
        style: "flat",
        value: (
          <a className="c-new-prediction" onClick={onLinkClick}>
            Participate
          </a>
        ),
      }}
    />
  );
}

function ExtensionMenuCollectibleEmptyState(props) {
  const {
    org,
    groupedCollectibles,
    channelPointsImageObj,
    xpImageObj,
    visibleTabs,
    activeTabIndexSubject,
    hasChannelPoints,
    hasBattlePass,
  } = props;

  const channelPointsSrc = channelPointsImageObj
    ? getModel().image.getSrcByImageObj(channelPointsImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  const xpSrc = xpImageObj
    ? getModel().image.getSrcByImageObj(xpImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/xp.svg";
  const emotes = _.find(groupedCollectibles, { type: "emote" });
  // FAZEFIXME - this is a hack for faze
  const tickets = _.find(groupedCollectibles, { type: "ticket" });
  const isFaze = org?.slug === "faze";
  const stackEmotes = isFaze
    ? _.map(_.take(tickets?.collectibles, 2), (ticket) =>
        getModel().image.getSrcByImageObj(ticket?.fileRel?.fileObj)
      )
    : _.map(_.take(emotes?.collectibles, 2), (emote) =>
        getModel().image.getSrcByImageObj(emote?.fileRel?.fileObj)
      );

  const onViewBattlePass = () => {
    // navigate to the battle pass tab when the user
    const collectibleTabIndex = visibleTabs.findIndex(
      (tab) => tab.slug === "battle-pass"
    );
    activeTabIndexSubject.next(collectibleTabIndex);
  };

  const onViewShop = () => {
    // navigate to the shop tab when the user
    const collectibleTabIndex = visibleTabs.findIndex(
      (tab) => tab.slug === "shop"
    );
    activeTabIndexSubject.next(collectibleTabIndex);
  };

  const handleChannelPointsLink = () => {
    overlay.open(() => (
      <ChannelPointsActionsDialog channelPointsSrc={channelPointsSrc} />
    ));
  };

  const handleXpLink = () => {
    overlay.open(() => <XpActionsDialog xpSrc={xpSrc} />);
  };

  return (
    <div className="c-collectible-empty">
      <div className="wrapper">
        <div className="preview">
          <div className="stack">
            <div className="block front">
              <ImageByAspectRatio
                imageUrl={stackEmotes?.[0]}
                aspectRatio={1}
                width={40}
                height={40}
              />
            </div>
            <div className="block back">
              <ImageByAspectRatio
                imageUrl={stackEmotes?.[1]}
                aspectRatio={1}
                width={40}
                height={40}
              />
            </div>
          </div>
          <div className="message">Nothing in your collection, yet!</div>
        </div>
        {(hasBattlePass || hasChannelPoints) && (
          <div className="body">
            <div className="title">Start Earning</div>
            {hasBattlePass && (
              <WayToEarnBlock
                description={`Earn XP to unlock rewards in the ${getSeasonPassName(
                  org
                )}`}
                buttonText={`Go to ${getSeasonPassName(org)}`}
                iconSrc={xpSrc}
                onButtonClick={onViewBattlePass}
                onLinkClick={handleXpLink}
                linkText={"How do I earn XP?"}
              />
            )}
            {hasChannelPoints && (
              <WayToEarnBlock
                description={"Earn channel points to buy items in the shop"}
                buttonText={"Go to Shop"}
                iconSrc={channelPointsSrc}
                onButtonClick={onViewShop}
                onLinkClick={handleChannelPointsLink}
                linkText={"How do I earn channel points?"}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WayToEarnBlock({
  description,
  iconSrc,
  linkText,
  onLinkClick,
  buttonText,
  onButtonClick,
}) {
  return (
    <div className="way-to-earn">
      <div className="left">
        <div className="icon">
          <ImageByAspectRatio
            imageUrl={iconSrc}
            aspectRatio={1}
            width={24}
            height={24}
          />
        </div>
      </div>

      <div className="right">
        <div className="description">{description}</div>
        <div className="button">
          <Button
            text={buttonText}
            size="large"
            style="primary"
            onclick={onButtonClick}
          />
        </div>
        <div className="link" onClick={onLinkClick}>
          {linkText}
        </div>
      </div>
    </div>
  );
}

function ChannelPointsActionsDialog({ channelPointsSrc }) {
  const { channelPointsEarnActionsObs } = useMemo(() => {
    const channelPointsOrgUserCounterTypeObs =
      getModel().orgUserCounterType.getBySlug("channel-points");

    const economyActionsObs =
      getModel().economyAction.getByAmountType("orgUserCounterType");

    const channelPointsEarnActionsObs = Obs.combineLatest(
      channelPointsOrgUserCounterTypeObs,
      economyActionsObs
    ).pipe(
      op.map(([orgUserCounterType, economyActions]) => {
        return _.filter(economyActions?.nodes, {
          amountId: orgUserCounterType?.id,
        });
      }),
      op.map((channelPointsActions) => {
        return _.filter(channelPointsActions, (action) => {
          return action?.amountValue || action?.data?.amountDescription;
        });
      }),
      op.map((channelPointsActions) =>
        _.filter(
          channelPointsActions,
          (action) => action?.name !== "Prediction refund"
        )
      ),
      op.map((channelPointsActions) => _.reverse(channelPointsActions))
    );
    return {
      economyActionsObs,
      channelPointsOrgUserCounterTypeObs,
      channelPointsEarnActionsObs,
    };
  }, []);

  const { channelPointsEarnActions } = useObservables(() => ({
    channelPointsEarnActions: channelPointsEarnActionsObs,
  }));

  return (
    <EconomyActionDialog
      economyActions={channelPointsEarnActions}
      orgUserCounterTypeSrc={channelPointsSrc}
      title={"How to earn channel points"}
    />
  );
}

function LearnMoreButton() {
  const { org } = useObservables(() => ({
    org: getModel().org.getMe(),
  }));

  return (
    <div className="c-learn-more">
      <div className="title">Earn XP through linked accounts</div>
      <a href={getHost()} target="_blank" className="button" rel="noreferrer">
        <Button
          text="Learn more"
          size="medium"
          style="primary-outline"
          icon="openExternal"
          iconLocation="right"
        />
      </a>
    </div>
  );
}

// HACK - plan is to move to a model where we can view all of the economy actions,
// just showing watchtime and linking to the site for now
const XP_INCREMENT_TRIGGER_ID = "b9d69a60-929e-11ec-b349-c56a67a258a0";
const XP_CLAIM_TRIGGER_ID = "fc93de80-929e-11ec-b349-c56a67a258a0";

function XpActionsDialog({ xpSrc }) {
  const { seasonPassWatchTimeActionsObs } = useMemo(() => {
    const seasonPassObs = getModel().seasonPass.getCurrent();

    const seasonPassWatchTimeActionsObs = seasonPassObs.pipe(
      op.map((seasonPass) => {
        return _.filter(
          seasonPass?.economyActions,
          (action) =>
            action?.economyTriggerId === XP_INCREMENT_TRIGGER_ID ||
            action?.economyTriggerId === XP_CLAIM_TRIGGER_ID
        );
      })
    );
    return {
      seasonPassWatchTimeActionsObs,
    };
  }, []);

  const { seasonPassWatchTimeActions, org } = useObservables(() => ({
    seasonPassWatchTimeActions: seasonPassWatchTimeActionsObs,
    org: getModel().org.getMe(),
  }));

  // FAZEFIXME - this is a hack for faze
  const isFaze = org?.slug === "faze";

  return (
    <EconomyActionDialog
      economyActions={seasonPassWatchTimeActions}
      orgUserCounterTypeSrc={xpSrc}
      title={"How to earn XP"}
      $bottom={!isFaze ? <LearnMoreButton /> : null}
    />
  );
}

function EconomyActionDialog({
  title,
  economyActions,
  orgUserCounterTypeSrc,
  $bottom,
}) {
  return (
    <div className="c-economy-action-dialog">
      <Component
        slug="dialog"
        props={{
          $title: title,
          minHeightPx: 440,
          $topRightButton: (
            <Component
              slug="icon"
              props={{
                icon: "close",
                color: cssVars.$primaryBaseText,
                isTouchTarget: true,
                onclick: () => {
                  overlay.close();
                },
              }}
            />
          ),
          $content: (
            <div className="content">
              {_.map(economyActions, (action) => {
                return (
                  <EconomyAction
                    economyAction={action}
                    orgUserCounterTypeSrc={orgUserCounterTypeSrc}
                  />
                );
              })}
              {<div className="bottom">{$bottom}</div>}
            </div>
          ),
        }}
      />
    </div>
  );
}

function EconomyAction({ economyAction, orgUserCounterTypeSrc }) {
  return (
    <div className="c-economy-action">
      <div className="name">{economyAction?.name}</div>
      <div className="reward">
        <div className="icon">
          <ImageByAspectRatio
            imageUrl={orgUserCounterTypeSrc}
            aspectRatio={1}
            width={24}
            height={24}
          />
        </div>
        <div className="amount">
          {economyAction?.amountValue > 0
            ? economyAction?.amountValue
            : economyAction?.data?.amountDescription}
        </div>
      </div>
      <div className="description">{economyAction?.data?.description}</div>
    </div>
  );
}

function ActivePowerups({ activePowerups }) {
  return _.map(
    _.take(
      _.filter(activePowerups, ({ powerup }) => powerup?.js),
      1
    ),
    (activePowerup) => <Powerup powerup={activePowerup?.powerup} />
  );
}

function Powerup({ powerup }) {
  if (!powerup?.js) return;
  return (
    <div className="powerup">
      {/* FIXME */}
      {/* <Components.RenderedJsByJsx
      jsx={powerup.js}
      components={_.map(powerup.componentRels, ({ component }) => {
        return getModel().component.getCachedComponentById(component.id)
      })}
    /> */}
    </div>
  );
}

function pad(num, size = 2) {
  num = num.toString();
  while (num.length < size) num = `0${num}`;
  return num;
}

function getSeasonPassName(orgWithOrgConfig) {
  return orgWithOrgConfig?.orgConfig?.data?.seasonPassName || "Battle Pass";
}

const VALID_SOURCE_TYPES = ["youtube", "twitch"];

function pageInfoToSource(pageInfo) {
  return pageInfo.find(({ sourceType, sourceId }) => {
    return VALID_SOURCE_TYPES.includes(sourceType);
  });
}
