import React from "https://npm.tfl.dev/react";
import Icon from "https://tfl.dev/@truffle/ui@0.0.1/components/icon/icon.jsx";
import { CRYSTAL_BALL_ICON } from "../../util/icon/paths.ts";
import { CRYSTAL_BALL_ICON_VIEWBOX } from "../../util/icon/viewboxes.ts";
import Page from "../page/page.tsx";
import {
  abbreviateNumber,
  formatNumber,
} from "https://tfl.dev/@truffle/utils@0.0.1/format/format.js";
import { usePageStack } from "../../util/page-stack/page-stack.ts";
import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@0.0.1/components/image-by-aspect-ratio/image-by-aspect-ratio.jsx";
import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.jsx";

export default function PredictionPage() {
  // const { channelPoints } = useObservables(() => ({
  //   channelPoints: channelPointsOrgUserCounterObs,
  // }));

  // const channelPointsSrc = channelPointsImageObj
  //   ? getModel().image.getSrcByImageObj(channelPointsImageObj)
  //   : "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";

  const { popPage } = usePageStack();

  const channelPoints = { count: 100 };
  const channelPointsSrc =
    "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";

  const activePoll = true;

  let pageContent;
  if (!activePoll) {
    pageContent = (
      <div className="c-prediction-page_no-active-predictions">
        <div>
          <Icon
            icon={CRYSTAL_BALL_ICON}
            color="var(--truffle-color-text-bg-primary)"
            size="40px"
            viewBox={CRYSTAL_BALL_ICON_VIEWBOX}
          />
        </div>
        <div className="text">No active predictions</div>
      </div>
    );
  } else {
    pageContent = (
      <div>Prediction component</div>
      // <Component
      //   slug="active-prediction"
      //   props={{
      //     isForm: true,
      //   }}
      // />
    );
  }

  return (
    <Page
      title="Prediction"
      headerTopRight={
        <ScopedStylesheet url={new URL("prediction-page.css", import.meta.url)}>
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
        </ScopedStylesheet>
      }
      content={pageContent}
      onBack={popPage}
    />
  );
}
