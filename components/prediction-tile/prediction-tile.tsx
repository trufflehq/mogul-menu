import React, { useMemo } from "https://npm.tfl.dev/react";
import {
  gql,
  usePollingQuery,
} from "https://tfl.dev/@truffle/api@0.0.1/client.js";
import { ONE_SECOND_MS } from "../../util/general.ts";
import { CRYSTAL_BALL_ICON } from "../../util/icon/paths.ts";
import { CRYSTAL_BALL_ICON_VIEWBOX } from "../../util/icon/viewboxes.ts";
import { usePageStack } from "../../util/page-stack/page-stack.ts";
import PredictionPage from "../prediction-page/prediction-page.tsx";
import Tile from "../tile/tile.tsx";

import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.js";
import Time from "../time/time.tsx";

const POLL_INTERVAL = ONE_SECOND_MS;

const ACTIVE_POLL_QUERY = gql`
  query PredictionPoll {
    pollConnection(first: 1) {
      nodes {
        id
        question
        options {
          index
          text
          count
          unique
        }
        data
        time
        endTime
        myVote {
          optionIndex
          count
        }
      }
    }
  }
`;

export default function PredictionTile() {
  const { pushPage } = usePageStack();

  const { data: activePollData } = usePollingQuery(POLL_INTERVAL, {
    query: ACTIVE_POLL_QUERY,
  });

  const activePoll = useMemo(
    () => activePollData?.pollConnection?.nodes?.[0],
    [activePollData]
  );
  const pollMsLeft = useMemo(
    () => new Date(activePoll?.endTime || Date.now()).getTime() - Date.now(),
    [activePoll]
  );
  const isPredictionExpired = useMemo(() => pollMsLeft <= 0, [pollMsLeft]);

  const hasWinner = useMemo(
    () => activePoll?.data?.winningOptionIndex !== undefined,
    [activePoll]
  );

  let Content: Function;

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
          <span>
            Submissions closing in <Time ms={pollMsLeft} />
          </span>
        </div>
      </div>
    );
  }

  if (!activePoll) return;

  return (
    <Tile
      className="c-prediction-tile"
      icon={CRYSTAL_BALL_ICON}
      iconViewBox={CRYSTAL_BALL_ICON_VIEWBOX}
      headerText="Prediction"
      color="#AB8FE9"
      onClick={() => pushPage(<PredictionPage />)}
      content={() => (
        <ScopedStylesheet url={new URL("prediction-tile.css", import.meta.url)}>
          <Content />
        </ScopedStylesheet>
      )}
    />
  );
}
