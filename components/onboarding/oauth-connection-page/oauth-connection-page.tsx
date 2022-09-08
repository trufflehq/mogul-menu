import {
  _setAccessTokenAndClear,
  ConnectionSourceType,
  getAccessToken,
  globalContext,
  ImageByAspectRatio,
  jumper,
  OAuthIframe,
  OAuthResponse,
  React,
  useHandleTruffleOAuth,
  useStyleSheet,
} from "../../../deps.ts";
import { JUMPER_MESSAGES } from "../../../shared/mod.ts";
import { Page, usePageStack } from "../../page-stack/mod.ts";
import ChatSettingsPage from "../chat-settings-page/chat-settings-page.tsx";

import stylesheet from "./oauth-connection-page.scss.js";

export default function OAuthConnectionPage(
  { sourceType = "youtube" }: { sourceType: ConnectionSourceType },
) {
  useStyleSheet(stylesheet);

  return (
    <Page isFull={true} shouldShowHeader={false} shouldDisableEscape={true}>
      <div className="c-oauth-connection-page">
        <ImageByAspectRatio
          imageUrl="https://cdn.bio/assets/images/features/browser_extension/extension-onboarding.png"
          widthPx={576}
          height={327}
        />
        <div className="info">
          Start earning channel points, unlocking rewards, and participating in polls and
          predictions
        </div>
        <OAuthButton sourceType={sourceType} />
      </div>
    </Page>
  );
}

function OAuthButton(
  { sourceType = "youtube" }: {
    sourceType: ConnectionSourceType;
  },
) {
  const { clearPageStack, pushPage, popPage } = usePageStack();

  const onSetAccessToken = (oauthResponse: OAuthResponse) => {
    popPage();
    _setAccessTokenAndClear(oauthResponse.truffleAccessToken);

    // let other embeds know that the user has changed and they need to
    // reset their api client and cache
    jumper.call("comms.postMessage", JUMPER_MESSAGES.ACCESS_TOKEN_UPDATED);

    pushPage(
      <ChatSettingsPage
        onContinue={clearPageStack}
      />,
    );
  };

  // listens for a post message from the OAuthIframe component
  // and call onSetAccessToken when a user logs in using a 3rd party connection
  // and the user's truffle access token is returned
  useHandleTruffleOAuth(onSetAccessToken);

  const accessToken = getAccessToken();
  const context = globalContext.getStore();
  const orgId = context?.orgId;

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
  );
}
