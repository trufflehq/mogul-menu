import {
  abbreviateNumber,
  Icon,
  ImageByAspectRatio,
  React,
  Spinner,
  useQuery,
  useStyleSheet,
} from "../../deps.ts";

import styleSheet from "./home-tab.scss.js";

import { usePageStack } from "../../util/mod.ts";
import { USER_INFO_QUERY } from "../../gql/mod.ts";
import ActivePowerups from "../active-powerups/active-powerups.tsx";
import AccountAvatar from "../account-avatar/account-avatar.tsx";
import Watchtime from "../watchtime/watchtime.tsx";
import Advert from "../advert/advert.tsx";
import PredictionTile from "../prediction-tile/prediction-tile.tsx";
import KothTile from "../koth-tile/koth-tile.tsx";
import SettingsPage from "../settings/settings-page/settings-page.tsx";
import { AdvertProps } from "../advert/advert.tsx";
import BrowserExtensionNotificationDialog from "../dialogs/notification-dialog/notification-dialog.tsx";
import { useDialog } from "../base/dialog-container/dialog-service.ts";
import BattlepassLeaderboardTile from "../battlepass-leaderboard-tile/battlepass-leaderboard-tile.tsx";
import IsLive from "../is-live/is-live.tsx";
import CPSpentTile from "../cp-spent-tile/cp-spent-tile.tsx";

export default function HomeTab() {
  useStyleSheet(styleSheet);
  const [{ data: userInfoData }] = useQuery({ query: USER_INFO_QUERY });

  const me = userInfoData?.me;
  const org = userInfoData?.org;
  const activePowerups = userInfoData?.activePowerupConnection?.nodes;
  const channelPoints = userInfoData?.channelPoints?.orgUserCounter;
  const xp = userInfoData?.seasonPass?.xp?.count;
  const hasChannelPoints = true;
  const hasBattlePass = true;

  const { pushPage } = usePageStack();
  const { pushDialog } = useDialog();

  const channelPointsSrc =
    "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  const xpSrc =
    "https://cdn.bio/assets/images/features/browser_extension/xp.svg";

  const handleOpenNotificationDialog = () => {
    pushDialog(<BrowserExtensionNotificationDialog />);
  };

  const handleOpenSupportChat = () => {
    const supportChatUrl = "/chat/support";
    window.open(supportChatUrl, "_blank");
  };

  // TODO: home tab should be "components" component that accepts other components
  // so creators would add the advert component and set the props on that
  const adverts: Record<string, AdvertProps> = {
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
    <div className="c-home-tab">
      <div className="header">
        <div className="user">
          <AccountAvatar size="72px" />
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
              onclick={() => pushPage(<SettingsPage />)}
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
            <IsLive sourceType="youtube">
              <Watchtime
                hasChannelPoints={hasChannelPoints}
                hasBattlePass={hasBattlePass}
              />
            </IsLive>
          </>
        )}
        <BattlepassLeaderboardTile />
        <PredictionTile />
        <CPSpentTile />
        <KothTile />
        {adverts[org?.slug] ? <Advert {...adverts[org.slug]} /> : null}
      </div>
    </div>
  );
}
