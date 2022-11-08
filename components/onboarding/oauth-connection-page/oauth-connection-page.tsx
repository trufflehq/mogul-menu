import {
  _setAccessTokenAndClear,
  ConnectionSourceType,
  getAccessToken,
  GLOBAL_JUMPER_MESSAGES,
  globalContext,
  ImageByAspectRatio,
  jumper,
  OAuthIframe,
  OAuthResponse,
  React,
  useHandleTruffleOAuth,
  useSelector,
  useSignal,
  useStyleSheet,
} from "../../../deps.ts";
import { isGoogleChrome } from "../../../shared/mod.ts";
import { Page, usePageStack } from "../../page-stack/mod.ts";
import ChatSettingsPage from "../chat-settings-page/chat-settings-page.tsx";
import NotificationTopicPage from "../notification-topic-page/notification-topic-page.tsx";
import NotificationsEnablePage from "../notifications-enable-page/notifications-enable-page.tsx";

import LocalOAuthFrame from "./local-oauth-frame.tsx";
import stylesheet from "./oauth-connection-page.scss.js";

export default function OAuthConnectionPage(
  { sourceType = "youtube" }: { sourceType: ConnectionSourceType },
) {
  useStyleSheet(stylesheet);

  return (
    <Page isFullSize shouldDisableEscape shouldShowHeader={false}>
      <div className="c-oauth-connection-page">
        <ImageByAspectRatio
          imageUrl="https://cdn.bio/assets/images/features/browser_extension/extension-onboarding.png"
          height={221}
          isStretch
          isCentered
          aspectRatio={390 / 221}
        />
        <div className="info">
          <div className="title">
            Let's get started
          </div>
          Connect your Youtube account to start earning channel points, unlocking rewards, and
          participating in polls and predictions through Truffle
        </div>
        <OAuthButton sourceType={sourceType} />
        <a
          className="policies mm-text-link"
          target={"_blank"}
          href={"https://truffle.vip/policies"}
          rel="noreferrer"
        >
          Privacy Policies
        </a>
      </div>
    </Page>
  );
}

function OAuthButton(
  { sourceType = "youtube" }: {
    sourceType: ConnectionSourceType;
  },
) {
  const accessToken$ = useSignal(
    getAccessToken() || jumper.call("storage.get", {
      key: "mogul-menu:accessToken",
    }),
  );
  const { clearPageStack, pushPage, popPage } = usePageStack();

  const onSetAccessToken = (oauthResponse: OAuthResponse) => {
    jumper.call("platform.log", `onSetAccessToken ${JSON.stringify(oauthResponse)}`);
    popPage();
    _setAccessTokenAndClear(oauthResponse.truffleAccessToken);

    // let other embeds know that the user has changed and they need to
    // reset their api client and cache
    jumper.call("comms.postMessage", GLOBAL_JUMPER_MESSAGES.ACCESS_TOKEN_UPDATED);

    pushPage(
      <ChatSettingsPage
        onContinue={() => {
          // notifications only supported in Google Chrome atm
          if (isGoogleChrome) {
            pushPage(
              <NotificationsEnablePage
                onContinue={(shouldSetupNotifications) => {
                  if (shouldSetupNotifications) {
                    pushPage(<NotificationTopicPage onContinue={clearPageStack} />);
                  } else {
                    clearPageStack();
                  }
                }}
              />,
            );
          } else {
            clearPageStack();
          }
        }}
      />,
    );
  };

  // listens for a post message from the OAuthIframe component
  // and call onSetAccessToken when a user logs in using a 3rd party connection
  // and the user's truffle access token is returned
  useHandleTruffleOAuth(onSetAccessToken);
  const context = globalContext.getStore();
  const orgId = context?.orgId;

  // jumper.call("platform.log", `oauth frame :${JSON.stringify({ accessToken, context, orgId })}`);
  const accessToken = useSelector(() => accessToken$.get());
  jumper.call("platform.log", `oauth frame accessToken ${accessToken}`);

  // console.log(`oauth hostname ${process?.env?.OAUTH_HOSTNAME}`);
  return (
    <OAuthIframe
      sourceType={sourceType}
      accessToken={accessToken}
      orgId={orgId}
      styles={{
        width: "308px",
        height: "42px",
        margin: "20px auto",
        border: "none",
      }}
    />
    // For local development
    // <LocalOAuthFrame sourceType={sourceType} accessToken={accessToken} orgId={orgId} />
  );
}
