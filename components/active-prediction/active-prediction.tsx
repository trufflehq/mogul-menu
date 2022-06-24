import React, {
  useContext,
  useEffect,
  useMemo,
} from "https://npm.tfl.dev/react";

const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = 60 * 1000;
const ONE_HOUR_MS = 3600 * 1000;
// TODO: better way to do this
const COIN_ICON_PATH =
  "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM13.5652 10.071L12.5776 7.40215C12.3792 6.86595 11.6208 6.86595 11.4224 7.40215L10.4348 10.071C10.3725 10.2395 10.2395 10.3725 10.071 10.4348L7.40215 11.4224C6.86595 11.6208 6.86595 12.3792 7.40215 12.5776L10.071 13.5652C10.2395 13.6275 10.3725 13.7605 10.4348 13.929L11.4224 16.5979C11.6208 17.1341 12.3792 17.134 12.5776 16.5979L13.5652 13.929C13.6275 13.7605 13.7605 13.6275 13.929 13.5652L16.5979 12.5776C17.1341 12.3792 17.134 11.6208 16.5979 11.4224L13.929 10.4348C13.7605 10.3725 13.6275 10.2395 13.5652 10.071Z";
const TROPHY_ICON =
  "M10.6667 1.33333H9.33333V0.666667C9.33333 0.3 9.03333 0 8.66667 0H3.33333C2.96667 0 2.66667 0.3 2.66667 0.666667V1.33333H1.33333C0.6 1.33333 0 1.93333 0 2.66667V3.33333C0 5.03333 1.28 6.42 2.92667 6.62667C3.34667 7.62667 4.24667 8.38 5.33333 8.6V10.6667H3.33333C2.96667 10.6667 2.66667 10.9667 2.66667 11.3333C2.66667 11.7 2.96667 12 3.33333 12H8.66667C9.03333 12 9.33333 11.7 9.33333 11.3333C9.33333 10.9667 9.03333 10.6667 8.66667 10.6667H6.66667V8.6C7.75333 8.38 8.65333 7.62667 9.07333 6.62667C10.72 6.42 12 5.03333 12 3.33333V2.66667C12 1.93333 11.4 1.33333 10.6667 1.33333ZM1.33333 3.33333V2.66667H2.66667V5.21333C1.89333 4.93333 1.33333 4.2 1.33333 3.33333ZM10.6667 3.33333C10.6667 4.2 10.1067 4.93333 9.33333 5.21333V2.66667H10.6667V3.33333Z";
export default function $activePrediction({ isForm }) {
  const { model } = useContext(context);
  const {
    errorStream,
    activePollObs,
    orgUserCounterObs,
    pollMsLeftStream,
    isPredictingStream,
    voteCountStream,
    isExpiredObs,
    hiddenPollIdsStream,
    myVoteStream,
    msSinceStartStream,
  } = useMemo(() => {
    const orgObs = model.org.getMe();
    // specifying min/max time here is bad idea (screws with caching)
    const activePollConnectionObs = orgObs.pipe(
      Stream.op.switchMap((org) =>
        model.poll.getAllSmall({
          isStreamed: true,
        })
      ),
    );
    const activePollObs = activePollConnectionObs.pipe(
      Stream.op.map((activePollConnection) => {
        return activePollConnection?.nodes?.[0];
      }),
    );

    const orgUserCounterTypeObs = model.orgUserCounterType.getBySlug(
      "channel-points",
    );

    const orgUserCounterObs = orgUserCounterTypeObs.pipe(
      Stream.op.switchMap((orgUserCounterType) => {
        return orgUserCounterType
          ? model.orgUserCounter.getMeByCounterTypeId(orgUserCounterType.id)
          : Stream.Obs.of({ count: 0 });
      }),
    );

    const pollMsLeftStream = Stream.createStream(
      activePollObs.pipe(
        Stream.op.map(
          (activePoll) =>
            new Date(activePoll?.endTime || Date.now()) - new Date(),
        ),
      ),
    );

    const msSinceStartStream = Stream.createStream(
      activePollObs.pipe(
        Stream.op.map(
          (activePoll) =>
            (new Date(activePoll?.time ?? Date.now()) - new Date()) * -1,
        ),
      ),
    );

    return {
      errorStream: Stream.createStream(null),
      activePollObs,
      orgUserCounterObs,
      pollMsLeftStream,
      msSinceStartStream,
      isPredictingStream: Stream.createStream(false),
      voteCountStream: Stream.createStream("0"),
      isExpiredObs: pollMsLeftStream.obs.pipe(
        Stream.op.map((msLeft) => msLeft <= 0),
      ),
      myVoteStream: Stream.createStream(
        activePollObs.pipe(Stream.op.map((poll) => poll?.myVote)),
      ),
      hiddenPollIdsStream: Stream.createStream([]),
    };
  }, []);

  const {
    error,
    activePoll,
    orgUserCounter,
    isExpired,
    hiddenPollIds,
    voteCount,
    isPredicting,
    myVote,
  } = useStream(() => ({
    error: errorStream.obs,
    activePoll: activePollObs,
    orgUserCounter: orgUserCounterObs,
    isExpired: isExpiredObs,
    hiddenPollIds: hiddenPollIdsStream.obs,
    voteCount: voteCountStream.obs,
    isPredicting: isPredictingStream.obs,
    myVote: myVoteStream.obs,
  }));

  if (!activePoll || hiddenPollIds.indexOf(activePoll.id) !== -1) {
    return [];
  }

  const predict = async ({ option, optionIndex }) => {
    console.log("predict", option, optionIndex, voteCount);
    try {
      errorStream.next(null);
      await model.economyTransaction.create({
        // TODO: pull from slug instead of hardcoded
        // channel points prediction
        // economyActionId: '6c985980-7fb3-11ec-a5c9-01fed7cc1cdc', // ludwig
        economyTriggerSlug: "prediction-vote",
        additionalData: {
          optionIndex,
          pollId: activePoll.id,
        },
        amountValue: -1 * parseInt(voteCount),
      });
      voteCountStream.next("0");
    } catch (err) {
      errorStream.next(err?.info || "There was an error submitting");
    }
  };

  const totalVotes = Legacy._.sumBy(activePoll.options, "count");
  const votedOptionIndex = myVote?.optionIndex;
  const hasVoted = votedOptionIndex !== undefined;
  const hasWinner = activePoll?.data?.winningOptionIndex !== undefined;
  const winningOptionIndex = activePoll?.data?.winningOptionIndex;
  const isWinner = votedOptionIndex === winningOptionIndex;
  const myVotes = myVote?.count;
  const winningVotes = activePoll?.options[winningOptionIndex]?.count || 1;
  const myWinningShare = isWinner
    ? Math.floor((myVotes / winningVotes) * totalVotes)
    : 0;
  const isRefund = activePoll?.data?.isRefund;

  return (
    <div className="z-active-prediction">
      <div className="question-banner">
        <div className="question">{activePoll?.question}</div>
        <div className="status">
          {isExpired && isRefund && <div>Prediction canceled</div>}
          {isExpired && !isRefund && <div>Submissions closed</div>}
          {!isExpired && !isRefund && (
            <div>
              <span>Submissions closing in</span>
              <Component
                slug="timer"
                props={{
                  timerMsStream: pollMsLeftStream,
                  renderFn: (timerMs) => {
                    // console.log('timerms', timerMs)

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
              />
            </div>
          )}
        </div>
      </div>
      {!isExpired && isForm && (
        <div className="form">
          <div className="amount">
            <div className="text">
              Enter amount of channel points to predict
            </div>
            <div className="value">
              <div className="input">
                <ChannelPoints />
                <Component
                  slug="input"
                  props={{
                    valueStream: voteCountStream,
                  }}
                />
              </div>
              <div
                className="current-amount"
                title={Legacy.FormatService.number(orgUserCounter?.count)}
              >
                of {Legacy.FormatService.abbreviateNumber(
                  orgUserCounter?.count || 0,
                  1,
                )} channel points
              </div>
            </div>
          </div>
          {error && <div className="error">{error}</div>}
        </div>
      )}
      {!isRefund && (
        <div className="options bmargin-24">
          {activePoll.options?.map((option, optionIndex) => {
            const count = option.count || 0;
            const ratio = count && totalVotes - count
              ? Math.round(100 * (1 + (totalVotes - count) / count)) / 100
              : 1;
            const isWinner =
              activePoll?.data?.winningOptionIndex === optionIndex;
            return (
              <div
                className={`option option${optionIndex + 1} ${
                  classKebab({
                    isWinner,
                  })
                }`}
                key={optionIndex}
              >
                <div className="name">{option.text}</div>
                <div className="stats">
                  <div className="percentage">
                    <div>
                      {totalVotes
                        ? Legacy.FormatService.percentage(
                          (option.count || 0) / totalVotes,
                        )
                        : "0%"}
                    </div>
                  </div>
                  <div className="value">
                    {Legacy.FormatService.abbreviateNumber(option?.count || 0)}
                  </div>
                  <div className="label">total points</div>
                  <div className="value">1 : {ratio}</div>
                  <div className="label">return ratio</div>
                  <div className="value">
                    {Legacy.FormatService.abbreviateNumber(option.unique || 0)}
                  </div>
                  <div className="label">total voters</div>
                  {!isExpired && isForm && (
                    <div className="vote">
                      <Component
                        slug="button"
                        props={{
                          style: "inherit",
                          isFullWidth: true,
                          text: voteCount,
                          isDisabled: isPredicting ||
                            !(voteCount > 0) ||
                            (hasVoted && votedOptionIndex !== optionIndex),
                          shouldHandleLoading: true,
                          isLoadingStream: isPredictingStream,
                          icon: COIN_ICON_PATH,
                          iconColor: "#EBC564",
                          iconLocation: "right",
                          bgColor: optionIndex === 0 ? "#419BEE" : "#EE416B",
                          onclick: () => {
                            return predict({ option, optionIndex });
                          },
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="winner-container">
                  {hasWinner && <Winner isWinner={isWinner} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {(hasVoted || hasWinner) && isForm && !isRefund && (
        <div className="summary-info">
          {hasVoted && !hasWinner && (
            <>
              <div className="user-prediction-text">
                You predicted{" "}
                <span className={`option${myVote?.optionIndex + 1}`}>
                  {activePoll?.options[myVote?.optionIndex]?.text}
                </span>{" "}
                with
              </div>
              <div className="channel-point-count">
                <div className="text">
                  {Legacy.FormatService.number(myVote?.count)}
                </div>
                <ChannelPoints />
              </div>
            </>
          )}
          {hasVoted && hasWinner && isWinner && (
            <div className="user-prediction-text">
              You won {Legacy.FormatService.number(myWinningShare)}{" "}
              <span>
                <ChannelPoints />
              </span>
            </div>
          )}
          {hasVoted && hasWinner && !isWinner && (
            <div className="user-prediction-text">Better luck next time!</div>
          )}
          {!hasWinner
            ? (
              // before the winner is selected
              <div className="status">
                <TimeSince
                  msSinceStream={msSinceStartStream}
                  renderFn={(msSince) => {
                    const minutesSince = Math.floor(msSince / ONE_MINUTE_MS);
                    const secondsSince = Math.floor(msSince / ONE_SECOND_MS);

                    let timeSince;
                    if (minutesSince < 1) {
                      if (secondsSince > 1) {
                        timeSince = `${secondsSince} seconds ago`;
                      } else timeSince = `${secondsSince} second ago`;
                    } else {
                      if (minutesSince > 1) {
                        timeSince = `${minutesSince} minutes ago`;
                      } else timeSince = `${minutesSince} minute ago`;
                    }

                    return (
                      <>Prediction started {timeSince}. Waiting for results</>
                    );
                  }}
                />
              </div>
            )
            : // after the winner is selected
              isWinner
              ? (
                // if the user voted for the winner
                <div className="status">
                  {Legacy.FormatService.number(totalVotes)}{" "}
                  <span>
                    <ChannelPoints />
                  </span>{" "}
                  go to you and{" "}
                  {activePoll?.options[activePoll?.data?.winningOptionIndex]
                    .unique - 1} others
                </div>
              )
              : (
                // if the user voted for the loser
                <div className="status">
                  {Legacy.FormatService.number(totalVotes)}{" "}
                  <span>
                    <ChannelPoints />
                  </span>{" "}
                  go to{" "}
                  {activePoll?.options[activePoll?.data?.winningOptionIndex]
                    .unique} users
                </div>
              )}
        </div>
      )}
      {hasVoted && isRefund && (
        <div className="summary-info">
          <div className="user-prediction-text">
            {Legacy.FormatService.number(myVote?.count)}{" "}
            <span>
              <ChannelPoints />
            </span>{" "}
            refunded to your account
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelPoints() {
  return (
    <div className="z-channel-points-icon">
      <Component
        slug="icon"
        props={{
          icon: COIN_ICON_PATH,
          color: "#EBC564",
        }}
      />
    </div>
  );
}

function TimeSince({ msSinceStream, renderFn, interval = 1000 }) {
  const { timerMs } = useStream(() => ({
    timerMs: msSinceStream.obs,
  }));

  useEffect(() => {
    const startTimeMs = Date.now();

    const timeout = setTimeout(() => {
      const curVal = timerMs;
      const nowMs = Date.now();
      // time diff because setTimeout stops when browser tab isn't active
      const timeDiffMs = nowMs - startTimeMs;
      const newVal = curVal + timeDiffMs;
      msSinceStream.next(newVal);
    }, interval);

    return () => {
      clearTimeout(timeout);
    };
  }, [timerMs]);

  return renderFn ? renderFn(timerMs) : `${timerMs}`;
}

function Winner({ isWinner }) {
  return (
    <div className={`z-winner${isWinner ? " is-visible" : ""}`}>
      <Component
        slug="icon"
        props={{
          icon: TROPHY_ICON,
          color: "#EBAD64",
          viewBox: 12,
          size: "12px",
        }}
      />
      <div className="text">Winner</div>
    </div>
  );
}

function pad(num, size = 2) {
  num = num.toString();
  while (num.length < size) num = `0${num}`;
  return num;
}
