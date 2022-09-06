import {
  globalContext,
  ImageByAspectRatio,
  OAuthIframe,
  OAuthResponse,
  React,
  useHandleTruffleOAuth,
  useStyleSheet,
} from "../../../deps.ts";
import {
  getAccessToken,
  persistTruffleAccessToken,
  setAccessTokenAndClear,
} from "../../../shared/mod.ts";
import { Page, usePageStack } from "../../page-stack/mod.ts";
import ChatSettingsPage from "../chat-settings-page/chat-settings-page.tsx";

import stylesheet from "./oauth-connection-page.scss.js";

export default function OAuthConnectionPage(
  { sourceType = "youtube" }: { sourceType?: "youtube" | "twitch" },
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
    sourceType?: "youtube" | "twitch";
  },
) {
  const { clearPageStack, pushPage, popPage } = usePageStack();

  const onSetAccessToken = (oauthResponse: OAuthResponse) => {
    popPage();
    setAccessTokenAndClear(oauthResponse.truffleAccessToken);
    persistTruffleAccessToken(oauthResponse.truffleAccessToken);

    pushPage(
      <ChatSettingsPage
        onContinue={clearPageStack}
      />,
    );
  };

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
    // <iframe
    //   src={`http://localhost:50230/auth/${sourceType}?accessToken=${accessToken}&orgId=${orgId}`}
    //   style={DEFAULT_STYLES}
    // />
  );
}
