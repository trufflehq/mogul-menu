import {
  React,
  abbreviateNumber,
  formatNumber,
  gql,
  Icon,
  ImageByAspectRatio,
  usePollingQuery,
  useStyleSheet,
} from "../../deps.ts";
import { CRYSTAL_BALL_ICON } from "../../util/icon/paths.ts";
import { CRYSTAL_BALL_ICON_VIEWBOX } from "../../util/icon/viewboxes.ts";
import Page from "../base/page/page.tsx";
import { usePageStack } from "../../util/page-stack/page-stack.ts";
import ActivePrediction from "../active-prediction/active-prediction.tsx";
import styleSheet from "./prediction-page.scss.js";

const CHANNEL_POINTS_QUERY = gql`
  query ChannelPointsQuery {
    channelPoints: orgUserCounterType(input: { slug: "channel-points" }) {
      orgUserCounter {
        count
      }
    }
  }
`;

const POLL_INTERVAL = 1000;

export default function PredictionPage() {
  useStyleSheet(styleSheet);
  const { data: channelPointsData } = usePollingQuery(POLL_INTERVAL, {
    query: CHANNEL_POINTS_QUERY,
  });

  const channelPoints = channelPointsData?.channelPoints?.orgUserCounter;

  // const channelPointsSrc = channelPointsImageObj
  //   ? getSrcByImageObj(channelPointsImageObj)
  //   : "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";

  const { popPage } = usePageStack();

  // const channelPoints = { count: 100 };
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
            color="var(--mm-color-text-bg-primary)"
            size="40px"
            viewBox={CRYSTAL_BALL_ICON_VIEWBOX}
          />
        </div>
        <div className="text">No active predictions</div>
      </div>
    );
  } else {
    pageContent = <ActivePrediction isForm={true} />;
  }

  return (
    <Page
      title="Prediction"
      headerTopRight={
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
      }
      onBack={popPage}
    >
      {pageContent}
    </Page>
  );
}
