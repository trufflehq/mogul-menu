import { ImageByAspectRatio, React, useStyleSheet } from "../../../deps.ts";
import { Page, usePageStack } from "../../page-stack/mod.ts";
import Button from "../../base/button/button.tsx";

import stylesheet from "./oauth-connection-page.scss.js";
const getTitle = (sourceType: "youtube" | "twitch") =>
  sourceType === "youtube" ? "YouTube" : "Twitch";
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

function getSourceTypeTitle(sourceType: "youtube" | "twitch") {
  return sourceType === "youtube" ? "YouTube" : "Twitch";
}

function OAuthButton({ sourceType = "youtube" }: { sourceType?: "youtube" | "twitch" }) {
  return (
    <Button className={`${sourceType} oauth-button`}>
      <ImageByAspectRatio
        imageUrl="https://cdn.bio/assets/images/features/browser_extension/youtube.svg"
        widthPx={24}
        height={24}
        aspectRatio={1}
      />
      {`Link your ${getSourceTypeTitle(sourceType)} account`}
    </Button>
  );
}
