import React, { useEffect, useMemo } from "https://npm.tfl.dev/react";
import {
  gql,
  pollingQueryObservable,
  useMutation,
} from "https://tfl.dev/@truffle/api@0.0.1/client.js";
import {
  op,
  Obs,
  createSubject,
} from "https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import _ from "https://npm.tfl.dev/lodash?no-check";
import {
  abbreviateNumber,
  formatNumber,
  formatPercentage,
} from "https://tfl.dev/@truffle/utils@0.0.1/format/format.js";
import classKebab from "https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js";
import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.js";

import Icon from "https://tfl.dev/@truffle/ui@0.0.1/components/icon/icon.js";
import Input from "https://tfl.dev/@truffle/ui@0.0.1/components/input/input.js";
import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.js";

import { COIN_ICON_PATH, TROPHY_ICON } from "../../util/icon/paths.ts";
import { ONE_SECOND_MS, ONE_MINUTE_MS } from "../../util/general.ts";
import Time from "../time/time.tsx";

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

const CHANNEL_POINTS_QUERY = gql`
  query ChannelPointsQuery {
    channelPoints: orgUserCounterType(input: { slug: "channel-points" }) {
      orgUserCounter {
        count
      }
    }
  }
`;

const VOTE_MUTATION = gql`
  mutation PollVote($additionalData: JSON!, $voteCount: Float!) {
    economyTransactionCreate(
      input: {
        economyTriggerSlug: "prediction-vote"
        additionalData: $additionalData
        amountValue: $voteCount
      }
    ) {
      economyTransaction {
        id
      }
    }
  }
`;

const POLL_INTERVAL = ONE_SECOND_MS;

export default function ActivePrediction({ isForm }: { isForm: boolean }) {
  const [_voteResult, executeVoteMutation] = useMutation(VOTE_MUTATION);

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
    const activePollConnectionObs = pollingQueryObservable(
      POLL_INTERVAL,
      ACTIVE_POLL_QUERY
    ).pipe(op.map(({ data }: any) => data?.pollConnection));
    const activePollObs = activePollConnectionObs.pipe(
      op.map((activePollConnection) => {
        return activePollConnection?.nodes?.[0];
      })
    );

    const orgUserCounterObs = pollingQueryObservable(
      POLL_INTERVAL,
      CHANNEL_POINTS_QUERY
    ).pipe(op.map(({ data }: any) => data?.channelPoints?.orgUserCounter));

    const pollMsLeftStream = createSubject(
      activePollObs.pipe(
        op.map(
          (activePoll) =>
            new Date(activePoll?.endTime || Date.now()).getTime() - Date.now()
        )
      )
    );

    const msSinceStartStream = createSubject(
      activePollObs.pipe(
        op.map(
          (activePoll) =>
            (new Date(activePoll?.time || Date.now()).getTime() - Date.now()) *
            -1
        )
      )
    );

    return {
      errorStream: createSubject(null),
      activePollObs,
      orgUserCounterObs,
      pollMsLeftStream,
      msSinceStartStream,
      isPredictingStream: createSubject(false),
      voteCountStream: createSubject("0"),
      isExpiredObs: pollMsLeftStream.obs.pipe(op.map((msLeft) => msLeft <= 0)),
      myVoteStream: createSubject(
        activePollObs.pipe(op.map((poll) => poll?.myVote))
      ),
      hiddenPollIdsStream: createSubject([]),
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
    pollMsLeft,
  } = useObservables(() => ({
    error: errorStream.obs,
    activePoll: activePollObs,
    orgUserCounter: orgUserCounterObs,
    isExpired: isExpiredObs,
    hiddenPollIds: hiddenPollIdsStream.obs,
    voteCount: voteCountStream.obs,
    isPredicting: isPredictingStream.obs,
    myVote: myVoteStream.obs,
    pollMsLeft: pollMsLeftStream.obs,
  }));

  if (!activePoll || hiddenPollIds.indexOf(activePoll.id) !== -1) {
    return [];
  }

  const predict = async ({ option, optionIndex }) => {
    console.log("predict", option, optionIndex, voteCount);
    try {
      errorStream.next(null);
      // await model.economyTransaction.create({
      //   // TODO: pull from slug instead of hardcoded
      //   // channel points prediction
      //   // economyActionId: '6c985980-7fb3-11ec-a5c9-01fed7cc1cdc', // ludwig
      //   economyTriggerSlug: "prediction-vote",
      //   additionalData: {
      //     optionIndex,
      //     pollId: activePoll.id,
      //   },
      //   amountValue: -1 * parseInt(voteCount),
      // });
      await executeVoteMutation({
        voteCount: -1 * parseInt(voteCount),
        additionalData: {
          optionIndex,
          pollId: activePoll.id,
        },
      });
      voteCountStream.next("0");
    } catch (err) {
      errorStream.next(err?.info || "There was an error submitting");
    }
  };

  const totalVotes = _.sumBy(activePoll.options, "count");
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
    <ScopedStylesheet url={new URL("active-prediction.css", import.meta.url)}>
      <div className="c-active-prediction">
        <div className="question-banner">
          <div className="question">{activePoll?.question}</div>
          <div className="status">
            {isExpired && isRefund && <div>Prediction canceled</div>}
            {isExpired && !isRefund && <div>Submissions closed</div>}
            {!isExpired && !isRefund && (
              <div>
                <span>
                  Submissions closing in <Time ms={pollMsLeft} />
                </span>
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
                  <Input valueSubject={voteCountStream} />
                </div>
                <div
                  className="current-amount"
                  title={formatNumber(orgUserCounter?.count)}
                >
                  of {abbreviateNumber(orgUserCounter?.count || 0, 1)} channel
                  points
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
              const ratio =
                count && totalVotes - count
                  ? Math.round(100 * (1 + (totalVotes - count) / count)) / 100
                  : 1;
              const isWinner =
                activePoll?.data?.winningOptionIndex === optionIndex;
              return (
                <div
                  className={`option option${optionIndex + 1} ${classKebab({
                    isWinner,
                  })}`}
                  key={optionIndex}
                >
                  <div className="name">{option.text}</div>
                  <div className="stats">
                    <div className="percentage">
                      <div>
                        {totalVotes
                          ? formatPercentage((option.count || 0) / totalVotes)
                          : "0%"}
                      </div>
                    </div>
                    <div className="value">
                      {abbreviateNumber(option?.count || 0)}
                    </div>
                    <div className="label">total points</div>
                    <div className="value">1 : {ratio}</div>
                    <div className="label">return ratio</div>
                    <div className="value">
                      {abbreviateNumber(option.unique || 0)}
                    </div>
                    <div className="label">total voters</div>
                    {!isExpired && isForm && (
                      <div className="vote">
                        <Button
                          style="inherit"
                          isFullWidth={true}
                          text={voteCount}
                          isDisabled={
                            isPredicting ||
                            !(voteCount > 0) ||
                            (hasVoted && votedOptionIndex !== optionIndex)
                          }
                          shouldHandleLoading={true}
                          isLoadingStream={isPredictingStream}
                          icon={COIN_ICON_PATH}
                          iconColor="#EBC564"
                          iconLocation="right"
                          bgColor={optionIndex === 0 ? "#419BEE" : "#EE416B"}
                          onClick={() => {
                            return predict({ option, optionIndex });
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
                  <div className="text">{formatNumber(myVote?.count)}</div>
                  <ChannelPoints />
                </div>
              </>
            )}
            {hasVoted && hasWinner && isWinner && (
              <div className="user-prediction-text">
                You won {formatNumber(myWinningShare)}{" "}
                <span>
                  <ChannelPoints />
                </span>
              </div>
            )}
            {hasVoted && hasWinner && !isWinner && (
              <div className="user-prediction-text">Better luck next time!</div>
            )}
            {!hasWinner ? (
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
            ) : // after the winner is selected
            isWinner ? (
              // if the user voted for the winner
              <div className="status">
                {formatNumber(totalVotes)}{" "}
                <span>
                  <ChannelPoints />
                </span>{" "}
                go to you and{" "}
                {activePoll?.options[activePoll?.data?.winningOptionIndex]
                  .unique - 1}{" "}
                others
              </div>
            ) : (
              // if the user voted for the loser
              <div className="status">
                {formatNumber(totalVotes)}{" "}
                <span>
                  <ChannelPoints />
                </span>{" "}
                go to{" "}
                {
                  activePoll?.options[activePoll?.data?.winningOptionIndex]
                    .unique
                }{" "}
                users
              </div>
            )}
          </div>
        )}
        {hasVoted && isRefund && (
          <div className="summary-info">
            <div className="user-prediction-text">
              {formatNumber(myVote?.count)}{" "}
              <span>
                <ChannelPoints />
              </span>{" "}
              refunded to your account
            </div>
          </div>
        )}
      </div>
    </ScopedStylesheet>
  );
}

function ChannelPoints() {
  return (
    <div className="z-channel-points-icon">
      <Icon icon={COIN_ICON_PATH} color="#EBC564" />
    </div>
  );
}

function TimeSince({ msSinceStream, renderFn, interval = 1000 }) {
  const { timerMs } = useObservables(() => ({
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
      <Icon icon={TROPHY_ICON} color="#EBAD64" viewBox={12} size="12px" />
      <div className="text">Winner</div>
    </div>
  );
}

function pad(num, size = 2) {
  num = num.toString();
  while (num.length < size) num = `0${num}`;
  return num;
}
