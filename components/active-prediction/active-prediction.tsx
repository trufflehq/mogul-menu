import {
  _,
  abbreviateNumber,
  classKebab,
  createSubject,
  formatNumber,
  formatPercentage,
  Icon,
  op,
  pollingQueryObservable,
  React,
  TextField,
  useEffect,
  useMemo,
  useMutation,
  useObservables,
  useRef,
  useState,
  useStyleSheet,
} from "../../deps.ts";

import { ACTIVE_POLL_QUERY, CHANNEL_POINTS_QUERY, VOTE_MUTATION } from "./gql.ts";
import { COIN_ICON_PATH, ONE_MINUTE_MS, ONE_SECOND_MS, TROPHY_ICON } from "../../shared/mod.ts";
import { Poll, PollConnection } from "../../types/mod.ts";
import Time from "../time/time.tsx";
import Button from "../base/button/button.tsx";

import styleSheet from "./active-prediction.scss.js";

const POLL_INTERVAL = 2 * ONE_SECOND_MS;

export default function ActivePrediction({ isForm }: { isForm: boolean }) {
  useStyleSheet(styleSheet);
  const [_voteResult, executeVoteMutation] = useMutation(VOTE_MUTATION);

  const {
    errorStream,
    activePollObs,
    orgUserCounterObs,
    pollMsLeftObs,
    voteCountStream,
    isExpiredObs,
    hiddenPollIdsStream,
    myVoteObs,
    msSinceStartObs,
  } = useMemo(() => {
    const activePollConnectionObs = pollingQueryObservable(
      POLL_INTERVAL,
      ACTIVE_POLL_QUERY,
      {},
    ).pipe(
      op.map(({ data }: { data: { pollConnection?: PollConnection } }) => data?.pollConnection),
    );
    const activePollObs = activePollConnectionObs.pipe(
      op.map((activePollConnection) => {
        return activePollConnection?.nodes?.find(
          (poll: Poll) => poll?.data?.type === "prediction",
        );
      }),
    );

    const orgUserCounterObs = pollingQueryObservable(
      POLL_INTERVAL,
      CHANNEL_POINTS_QUERY,
      {},
    ).pipe(op.map(({ data }: any) => data?.channelPoints?.orgUserCounter));

    const pollMsLeftObs = activePollObs.pipe(
      op.map(
        (activePoll) => new Date(activePoll?.endTime || Date.now()).getTime() - Date.now(),
      ),
    );

    const msSinceStartObs = activePollObs.pipe(
      op.map(
        (activePoll) => (new Date(activePoll?.time || Date.now()).getTime() - Date.now()) * -1,
      ),
    );

    return {
      errorStream: createSubject(null),
      activePollObs,
      orgUserCounterObs,
      pollMsLeftObs,
      msSinceStartObs,
      isPredictingStream: createSubject(false),
      voteCountStream: createSubject("0"),
      isExpiredObs: pollMsLeftObs.pipe(op.map((msLeft) => msLeft <= 0)),
      myVoteObs: activePollObs.pipe(op.map((poll) => poll?.myVote)),
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
    myVote,
    pollMsLeft,
    msSinceStart,
  } = useObservables(() => ({
    error: errorStream.obs,
    activePoll: activePollObs,
    orgUserCounter: orgUserCounterObs,
    isExpired: isExpiredObs,
    hiddenPollIds: hiddenPollIdsStream.obs,
    voteCount: voteCountStream.obs,
    myVote: myVoteObs,
    pollMsLeft: pollMsLeftObs,
    msSinceStart: msSinceStartObs,
  }));

  const totalVotes = _.sumBy(activePoll?.options ?? [], "count");
  const votedOptionIndex = myVote?.optionIndex;
  const hasVoted = votedOptionIndex !== undefined;
  const hasWinner = activePoll?.data?.winningOptionIndex !== undefined;
  const winningOptionIndex = activePoll?.data?.winningOptionIndex;
  const isWinner = votedOptionIndex === winningOptionIndex;
  const myVotes = myVote?.count;
  const winningVotes = activePoll?.options[winningOptionIndex]?.count || 1;
  const myWinningShare = isWinner ? Math.floor((myVotes / winningVotes) * totalVotes) : 0;
  const isRefund = activePoll?.data?.isRefund;

  const predictionLock = useRef(false);
  const [isPredicting, setIsPredicting] = useState(false);

  // reset isPredicting when the active poll gets updated
  useEffect(() => {
    if (!predictionLock.current && hasVoted) {
      setIsPredicting(false);
    }
  }, [myVote]);

  if (!activePoll || hiddenPollIds.indexOf(activePoll.id) !== -1) {
    return [];
  }

  const predict = async ({ option, optionIndex }) => {
    // prevent accidental double clicking
    if (predictionLock.current) return;
    predictionLock.current = true;
    setIsPredicting(true);

    console.log("predict", option, optionIndex, voteCount);
    try {
      errorStream.next(null);
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

    // release the prediction lock
    predictionLock.current = false;
  };

  return (
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
                <TextField
                  type="number"
                  placeholder="0"
                  value={voteCount}
                  onInput={(e) => voteCountStream.next(e.target.value)}
                />
              </div>
              <div
                className="current-amount"
                title={formatNumber(orgUserCounter?.count)}
              >
                of {abbreviateNumber(orgUserCounter?.count || 0, 1)} channel points
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
            const isWinner = activePoll?.data?.winningOptionIndex === optionIndex;
            const hasVotedOnOtherOption = (hasVoted && votedOptionIndex !== optionIndex);
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
                      {totalVotes ? formatPercentage((option.count || 0) / totalVotes) : "0%"}
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
                  {!isPredicting && !isExpired && isForm && (
                    <div className="vote">
                      <Button
                        isDisabled={!(voteCount > 0)}
                        style={{
                          "--background": optionIndex === 0 ? "#419BEE" : "#EE416B",
                          "visibility": hasVotedOnOtherOption ? "hidden" : "visible",
                        }}
                        onClick={() => {
                          return predict({ option, optionIndex });
                        }}
                      >
                        <div className="vote-button-content">
                          {voteCount}
                          <Icon icon={COIN_ICON_PATH} color="#EBC564" />
                        </div>
                      </Button>
                    </div>
                  )}
                  {isPredicting &&
                    (
                      <div
                        className="loading"
                        style={{ visibility: hasVotedOnOtherOption ? "hidden" : "visible" }}
                      >
                        . . .
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
          {!hasWinner
            ? (
              // before the winner is selected
              <div className="status">
                <TimeSince msSince={msSinceStart} />
              </div>
            )
            : // after the winner is selected
              isWinner
              ? (
                // if the user voted for the winner
                <div className="status">
                  {formatNumber(totalVotes)}{" "}
                  <span>
                    <ChannelPoints />
                  </span>{" "}
                  go to you and {activePoll?.options[activePoll?.data?.winningOptionIndex]
                    .unique - 1} others
                </div>
              )
              : (
                // if the user voted for the loser
                <div className="status">
                  {formatNumber(totalVotes)}{" "}
                  <span>
                    <ChannelPoints />
                  </span>{" "}
                  go to {activePoll?.options[activePoll?.data?.winningOptionIndex].unique} users
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
  );
}

function ChannelPoints() {
  return (
    <div className="z-channel-points-icon">
      <Icon icon={COIN_ICON_PATH} color="#EBC564" />
    </div>
  );
}

function TimeSince({ msSince }: { msSince: number }) {
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

  return <>Prediction started {timeSince}. Waiting for results</>;
}

function Winner({ isWinner }: { isWinner?: boolean }) {
  return (
    <div className={`z-winner${isWinner ? " is-visible" : ""}`}>
      <Icon icon={TROPHY_ICON} color="#EBAD64" size="20px" />
      <div className="text">Winner</div>
    </div>
  );
}

function pad(num: number | string, size = 2) {
  num = num.toString();
  while (num.length < size) num = `0${num}`;
  return num;
}
