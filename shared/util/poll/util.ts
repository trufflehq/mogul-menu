import { _ } from "../../../deps.ts";
import { Poll, PollOption } from "../../../types/mod.ts";
type IntermediateRound = {
  floor: number;
  remainder: number;
  index: number;
};

export function largestRemainderRound(
  numbers: number[] | undefined,
  desiredTotal: number,
) {
  if (!numbers?.length) return;

  const result = numbers.map(function (number, index) {
    const intermediate: IntermediateRound = {
      floor: Math.floor(number),
      remainder: getRemainder(number),
      index: index,
    };

    return intermediate;
  }).sort(function (a: IntermediateRound, b: IntermediateRound) {
    return b.remainder - a.remainder;
  });

  const lowerSum = result.reduce(function (sum, current) {
    return sum + current.floor;
  }, 0);

  const delta = desiredTotal - lowerSum;

  if (delta !== desiredTotal) {
    for (let i = 0; i < delta; i++) {
      result[i].floor++;
    }
  }

  return result.sort(function (a, b) {
    return a.index - b.index;
  }).map(function (result) {
    return result.floor;
  });
}

function getRemainder(number: number) {
  const remainder = number - Math.floor(number);
  return parseInt(remainder.toFixed(4));
}

export function getPollTimeRemaining(pollEndTime: Date | undefined) {
  if (!pollEndTime) return;
  const start = new Date().getTime();
  const end = new Date(pollEndTime).getTime();
  const timeRemaining = (end - start) / 1000;

  return timeRemaining;
}

export function getHasPollEnded(pollEndTime: Date | undefined) {
  const timeRemaining = getPollTimeRemaining(pollEndTime);
  const hasPollEnded = timeRemaining && timeRemaining < 0;

  return hasPollEnded;
}

export function getRoundedPollPercentages(pollOptions: PollOption[]) {
  const totalVotes = pollOptions?.reduce((acc: number, curr) => {
    acc = acc + curr.count;
    return acc;
  }, 0) || 0;
  const rawPollOptionVotes = pollOptions?.map((option) =>
    option.count ? Math.floor((option.count / totalVotes) * 100) : 0
  );
  const roundedVotePercentages = largestRemainderRound(rawPollOptionVotes, 100);

  return roundedVotePercentages;
}

export function getPollInfo(poll: Poll) {
  const hasPollEnded = getHasPollEnded(poll?.endTime);
  const pollQuestion = poll?.question;
  const pollStartTime = poll?.time;
  const pollEndTime = poll?.endTime;
  const myVote = poll?.myVote;
  const myVoteOptionIndex = myVote?.optionIndex;
  const hasVoted = myVoteOptionIndex !== undefined;
  const totalVotes = _.sumBy(poll.options, "count");
  const winningOptionIndex = poll?.data?.winningOptionIndex;
  const winningOption = typeof winningOptionIndex !== "undefined"
    ? poll?.options?.find((option) => option?.index === winningOptionIndex)
    : undefined;
  const didWin = winningOption?.index === myVoteOptionIndex;
  const winningVotes = typeof winningOptionIndex !== "undefined"
    ? poll?.options[winningOptionIndex]?.count
    : 1;
  const myPlacedVotes = myVote?.count;

  const myWinningShare = didWin && myPlacedVotes
    ? Math.floor((myPlacedVotes / winningVotes) * totalVotes)
    : 0;

  const isRefund = poll?.data?.isRefund;
  return {
    hasPollEnded,
    winningOption,
    pollQuestion,
    pollStartTime,
    pollEndTime,
    myVote,
    hasVoted,
    isRefund,
    didWin,
    myPlacedVotes,
    myWinningShare,
  };
}

export function isPrediction(
  poll: unknown & { data?: { type?: string } },
): poll is Poll {
  return poll?.data?.type === "prediction";
}
