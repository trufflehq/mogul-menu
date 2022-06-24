import React from "https://npm.tfl.dev/react";
import { formatCountdown } from "https://tfl.dev/@truffle/utils@0.0.1/format/format.js";

export default function Timer({ timerSeconds, message }) {
  return (
    <div className="timer">
      {
        <>
          <div className="time">
            {timerSeconds !== undefined
              ? formatCountdown(timerSeconds, { shouldAlwaysShowHours: false })
              : ""}
          </div>
          <div className="title">{message}</div>
        </>
      }
    </div>
  );
}
