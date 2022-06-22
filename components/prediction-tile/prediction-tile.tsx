import React from "react";
import { pad } from "../../util/general.ts";
import { CRYSTAL_BALL_ICON } from "../../util/icon/paths.ts";
import { CRYSTAL_BALL_ICON_VIEWBOX } from "../../util/icon/viewboxes.ts";
import { usePageStack } from "../../util/page-stack/page-stack.ts";
import PredictionPage from "../prediction-page/prediction-page.tsx";
import Tile from "../tile/tile.tsx";

const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 3600 * 1000;

export default function PredictionTile({
  channelPointsImageObj,
  channelPointsOrgUserCounterObs,
}) {
  // const { activePollConnectionObs, pollMsLeftSubject, isPredictionExpiredObs } =
  //   useMemo(() => {
  //     const activePollConnectionObs = getModel().poll.getAllSmall({
  //       isSubjected: true,
  //       // TODO: fix bug: https://discord.com/channels/839188384752599071/845377383870890055/963515614771683338
  //       // limit: 10
  //     });

  //     const activePollObs = activePollConnectionObs.pipe(
  //       op.map((activePollConnection) => {
  //         return activePollConnection?.nodes?.[0];
  //       })
  //     );

  //     const pollMsLeftSubject = createSubject(
  //       activePollObs.pipe(
  //         op.map(
  //           (activePoll) =>
  //             new Date(activePoll?.endTime || Date.now()) - new Date()
  //         )
  //       )
  //     );

  //     return {
  //       activePollConnectionObs,
  //       activePollObs,
  //       pollMsLeftSubject,
  //       isPredictionExpiredObs: pollMsLeftSubject.obs.pipe(
  //         op.map((msLeft) => msLeft <= 0)
  //       ),
  //     };
  //   }, []);

  // const { activePollConnection, isPredictionExpired } = useObservables(() => ({
  //   activePollConnection: activePollConnectionObs,
  //   isPredictionExpired: isPredictionExpiredObs,
  // }));

  const { pushPage, popPage } = usePageStack();

  const activePollConnection = { nodes: [{ question: "Who will win?" }] };
  const isPredictionExpired = true;

  const activePoll = activePollConnection?.nodes?.[0];
  const hasWinner = activePoll?.data?.winningOptionIndex !== undefined;

  if (!activePoll) return;

  let Content;

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
          <span>Submissions closing in</span>
          {/* <Component
            slug="timer"
            props={{
              timerMsSubject: pollMsLeftSubject,
              renderFn: (timerMs) => {
                const hours = Math.floor(timerMs / ONE_HOUR_MS);
                timerMs = timerMs % ONE_HOUR_MS;
                const minutes = Math.floor(timerMs / ONE_MINUTE_MS);
                timerMs = timerMs % ONE_MINUTE_MS;
                const seconds = Math.floor(timerMs / ONE_SECOND_MS);

                return (
                  <span className="timer">
                    {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                  </span>
                );
              },
            }}
          /> */}
        </div>
      </div>
    );
  }

  return (
    <Tile
      className="c-prediction-tile"
      icon={CRYSTAL_BALL_ICON}
      iconViewBox={CRYSTAL_BALL_ICON_VIEWBOX}
      headerText="Prediction"
      color="#AB8FE9"
      onClick={
        () => pushPage(<PredictionPage />)
        // pushPage(PredictionPage, {
        //   activePoll,
        //   channelPointsImageObj,
        //   channelPointsOrgUserCounterObs,
        //   onBack: popPage,
        // })
      }
      content={() => (
        <>
          <link
            rel="stylesheet"
            href={new URL("prediction-tile.css", import.meta.url).toString()}
          />
          <Content />
        </>
      )}
    />
  );
}
