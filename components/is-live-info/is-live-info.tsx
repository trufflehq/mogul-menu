import React from "react";
import root from "https://npm.tfl.dev/react-shadow@19?deps=react@18&dev";

import Timer from "../timer/timer.tsx";

export default function IsLiveInfo(props) {
  const {
    secondsRemainingSubject,
    timeWatchedSecondsSubject,
    highlightButtonBg,
    // creatorName,
    hasChannelPoints,
    hasBattlePass,
  } = props;

  const creatorName = "Ludwig";

  // const { secondsRemaining, timeWatchedSeconds } = useObservables(() => ({
  //   timeWatchedSeconds: timeWatchedSecondsSubject.obs,
  //   secondsRemaining: secondsRemainingSubject.obs,
  // }));

  const secondsRemaining = 10;
  const timeWatchedSeconds = 10;

  return (
    <root.div className="live-info">
      <link
        rel="stylesheet"
        href={new URL("is-live-info.css", import.meta.url).toString()}
      />
      <div
        className="header"
        style={{
          "--background": highlightButtonBg ?? "var(--truffle-gradient)",
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
          {(hasChannelPoints || hasBattlePass || true) && (
            // <Timer timerSeconds={timeWatchedSeconds} message={"Time watched"} />
            <Timer timerSeconds={10} message={"Time watched"} />
          )}
          {(hasChannelPoints || hasBattlePass || true) && (
            // <Timer
            //   timerSeconds={secondsRemaining}
            //   message={"Time until reward"}
            // />
            <Timer timerSeconds={10} message={"Time until reward"} />
          )}
        </div>
      </div>
    </root.div>
  );
}