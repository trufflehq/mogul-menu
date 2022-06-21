import React from "react";
import { getHost } from "https://tfl.dev/@truffle/utils@0.0.1/request/request-info.js";
import { abbreviateNumber } from "https://tfl.dev/@truffle/utils@0.0.1/format/format.js";
import root from "https://npm.tfl.dev/react-shadow@19?deps=react@18&dev";

import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@0.0.1/components/image-by-aspect-ratio/image-by-aspect-ratio.jsx";
import Icon from "https://tfl.dev/@truffle/ui@0.0.1/components/icon/icon.jsx";
import Spinner from "https://tfl.dev/@truffle/ui@0.0.1/components/spinner/spinner.jsx";

import { usePageStack } from "../../util/page-stack/page-stack.ts";

import ActivePowerups from "../active-powerups/active-powerups.tsx";
import AccountAvatar from "../account-avatar/account-avatar.tsx";
import IsLiveInfo from "../is-live-info/is-live-info.tsx";
import Advert from "../advert/advert.tsx";
import PredictionTile from "../prediction-tile/prediction-tile.tsx";
import { LeaderboardTile } from "../leaderboard-tile/leaderboard-tile.tsx";
import KothTile from "../koth-tile/koth-tile.tsx";

export default function HomeTab() {
  // const { activePowerupsObs } = useMemo(() => {
  //   const orgUserActivePowerupConnectionObs =
  //     getModel().orgUser.getMeActivePowerupsWithJsx();
  //   const activePowerupsObs = orgUserActivePowerupConnectionObs.pipe(
  //     op.map((orgUser) => {
  //       return orgUser?.activePowerupConnection?.nodes ?? [];
  //     })
  //   );
  //   return {
  //     activePowerupsObs,
  //   };
  // }, []);

  // const { me, org, activePowerups, channelPoints, xp } = useObservables(() => ({
  //   me: getModel().user.getMe(),
  //   org: getModel().org.getMe(),
  //   activePowerups: activePowerupsObs,
  //   channelPoints: channelPointsOrgUserCounterObs,
  //   xp: seasonPassObs.pipe(op.map((seasonPass) => seasonPass?.xp?.count)),
  // }));

  const me = {};
  const org = {};
  const activePowerups: any[] = [];
  const channelPoints = {};
  const xp = {};
  const canClaim = true;
  const hasChannelPoints = true;

  const { pushPage, popPage } = usePageStack();

  const channelPointsSrc = false
    ? // channelPointsImageObj
      // ? getModel().image.getSrcByImageObj(channelPointsImageObj)
      ""
    : "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  const xpSrc = false
    ? // xpImageObj
      // ? getModel().image.getSrcByImageObj(xpImageObj)
      ""
    : "https://cdn.bio/assets/images/features/browser_extension/xp.svg";

  const handleOpenNotificationDialog = () => {
    console.log("opening notification dialog");
    // overlay.open(() => (
    //   <Component
    //     slug="browser-extension-notification-dialog"
    //     props={{
    //       transactionsObs,
    //       channelPointsImageObj,
    //       seasonPassObs,
    //       xpImageObj,
    //     }}
    //   />
    // ));
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
  const isLive = true;
  const isLoading = isLive == null;

  return (
    <root.div>
      <link
        rel="stylesheet"
        href={new URL("home-tab.css", import.meta.url).toString()}
      />
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
                        width={20}
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
                      width={24}
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
                // color={cssVars.$bgBaseText}
                hasRipple={true}
                size="24px"
                iconViewBox="24px"
              />
            </div>
            <div className="icon">
              <Icon
                icon="settings"
                onclick={() =>
                  // pushPage(SettingsPage, {
                  //   extensionIconPositionSubject,
                  //   extensionInfo,
                  //   onBack: popPage,
                  // })
                  pushPage(<div onClick={popPage}>Settings page</div>)
                }
                // color={cssVars.$bgBaseText}
                hasRipple={true}
                size="24px"
                iconViewBox="24px"
              />
            </div>
            <div className="icon">
              <Icon
                icon="bell"
                onclick={handleOpenNotificationDialog}
                // color={cssVars.$bgBaseText}
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
                // secondsRemainingSubject={secondsRemainingSubject}
                // timeWatchedSecondsSubject={timeWatchedSecondsSubject}
                // highlightButtonBg={highlightButtonBg}
                // creatorName={creatorName}
                // hasChannelPoints={hasChannelPoints}
                // hasBattlePass={hasBattlePass}
                />
              )}
            </>
          )}
          {!["dev", "faze"].includes(org?.slug) && (
            <>
              <LeaderboardTile />
              <PredictionTile
              // channelPointsImageObj={channelPointsImageObj}
              // channelPointsOrgUserCounterObs={channelPointsOrgUserCounterObs}
              />
              <KothTile />
            </>
          )}
          {adverts[org?.slug] && <Advert {...adverts[org.slug]} />}
        </div>
      </div>
    </root.div>
  );
}
