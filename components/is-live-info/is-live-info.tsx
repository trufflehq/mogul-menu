import React from "react";

import Timer from "../timer/timer.tsx";

export default function IsLiveInfo(props) {
  const {
    secondsRemainingSubject,
    timeWatchedSecondsSubject,
    highlightButtonBg,
    creatorName,
    hasChannelPoints,
    hasBattlePass,
  } = props;

  // const { secondsRemaining, timeWatchedSeconds } = useObservables(() => ({
  //   timeWatchedSeconds: timeWatchedSecondsSubject.obs,
  //   secondsRemaining: secondsRemainingSubject.obs,
  // }));

  const secondsRemaining = 10;
  const timeWatchedSeconds = 10;

  return (
    <div className="live-info">
      <div
        className="header"
        style={{
          background: highlightButtonBg,
        }}
      >
        {creatorName ? `${creatorName} is live!` : ""}
      </div>
      <div className="info">
        <div className="message">
          {creatorName
            ? hasChannelPoints && hasBattlePass
              ? `Earn channel points and XP by watching ${creatorName} during the stream`
              : hasChannelPoints
              ? `Earn channel points by watching ${creatorName} during the stream`
              : hasBattlePass
              ? `Earn XP by watching ${creatorName} during the stream`
              : "Channel Points and XP not currently enabled"
            : "Channel Points and XP not currently enabled"}
        </div>
        <div className="grid">
          {(hasChannelPoints || hasBattlePass) && (
            <Timer timerSeconds={timeWatchedSeconds} message={"Time watched"} />
          )}
          {(hasChannelPoints || hasBattlePass) && (
            <Timer
              timerSeconds={secondsRemaining}
              message={"Time until reward"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
