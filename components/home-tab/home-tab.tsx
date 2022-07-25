import React, { useEffect } from "https://npm.tfl.dev/react";
import { getHost } from "https://tfl.dev/@truffle/utils@0.0.1/request/request-info.js";
import { abbreviateNumber } from "https://tfl.dev/@truffle/utils@0.0.1/format/format.js";
import root from "https://npm.tfl.dev/react-shadow@19";
import { gql, useQuery } from "https://tfl.dev/@truffle/api@^0.1.0/client.ts";
import { op } from "https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js";
import globalContext from "https://tfl.dev/@truffle/global-context@1.0.0/index.js";

import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/image-by-aspect-ratio/image-by-aspect-ratio.tsx";
import Icon from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/icon/icon.tsx";
import Spinner from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/spinner/spinner.tsx";

import { usePageStack } from "../../util/page-stack/page-stack.ts";

import ActivePowerups from "../active-powerups/active-powerups.tsx";
import AccountAvatar from "../account-avatar/account-avatar.tsx";
import IsLiveInfo from "../is-live-info/is-live-info.tsx";
import Advert from "../advert/advert.tsx";
import PredictionTile from "../prediction-tile/prediction-tile.tsx";
import { LeaderboardTile } from "../leaderboard-tile/leaderboard-tile.tsx";
import KothTile from "../koth-tile/koth-tile.tsx";
import SettingsPage from "../settings-page/settings-page.tsx";
import BrowserExtensionNotificationDialog from "../notification-dialog/notification-dialog.tsx";
import { useDialog } from "../dialog-container/dialog-service.ts";

const USER_INFO_QUERY = gql`
  query UserInfoQuery {
    me {
      id
      name
    }

    org {
      id
      slug
    }

    channelPoints: orgUserCounterType(input: { slug: "channel-points" }) {
      orgUserCounter {
        count
      }
    }

    seasonPass {
      xp: orgUserCounter {
        count
      }
    }

    activePowerupConnection {
      nodes {
        id
        powerup {
          id
          name
          slug
        }
      }
    }
  }
`;

export default function HomeTab() {
  const [{ data: userInfoData }] = useQuery({ query: USER_INFO_QUERY });

  const me = userInfoData?.me;
  const org = userInfoData?.org;
  const activePowerups = userInfoData?.activePowerups?.nodes;
  const channelPoints = userInfoData?.channelPoints?.orgUserCounter;
  const xp = userInfoData?.seasonPass?.xp?.count;
  const canClaim = true;
  const hasChannelPoints = true;

  const { pushPage, popPage } = usePageStack();
  const { pushDialog, popDialog } = useDialog();

  const channelPointsSrc = false
    ? // channelPointsImageObj
      // ? getSrcByImageObj(channelPointsImageObj)
      ""
    : "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  const xpSrc = false
    ? // xpImageObj
      // ? getSrcByImageObj(xpImageObj)
      ""
    : "https://cdn.bio/assets/images/features/browser_extension/xp.svg";

  const handleOpenNotificationDialog = () => {
    pushDialog(<BrowserExtensionNotificationDialog />);
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
      buttonBgColor: "var(--mm-color-secondary)",
      buttonBgColorHover: "var(--mm-color-secondary)",
      buttonTextColor: "var(--mm-color-text-secondary)",
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
                  pushPage(<SettingsPage />)
                }
                hasRipple={true}
                size="24px"
                iconViewBox="24px"
              />
            </div>
            <div className="icon">
              <Icon
                icon="bell"
                onclick={handleOpenNotificationDialog}
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
          <LeaderboardTile />
          <PredictionTile />
          <KothTile />
          {adverts[org?.slug] && <Advert {...adverts[org.slug]} />}
        </div>
      </div>
    </root.div>
  );
}
