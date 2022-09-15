import { jumper, React } from "../../../deps.ts";
import {
  CRYSTAL_BALL_ICON,
  getPollInfo,
  isPrediction,
  MOGUL_MENU_JUMPER_MESSAGES,
} from "../../../shared/mod.ts";
import ChannelPointsIcon from "../../../components/channel-points-icon/channel-points-icon.tsx";
import ActivityBannerFragment, {
  ContinueActionIcon,
  DismissActionIcon,
  ActivityBannerInfo,
  ActivityBannerSecondaryInfo,
} from "../activity-banner-fragment/activity-banner-fragment.tsx";
import { Poll, PollOption } from "../../../types/mod.ts";

export default function PredictionBanner({ poll }: { poll: Poll }) {
  const {
    hasPollEnded: hasPredictionEnded,
    pollQuestion,
    winningOption,
    pollStartTime: predictionStartTime,
    pollEndTime: predictionEndTime,
    hasVoted,
    didWin,
    myWinningShare,
    myPlacedVotes,
  } = getPollInfo(
    poll,
  );

  const onContinue = () => {
    // emit a message through jumper to tell the  menu to open to the prediction page
    jumper.call("comms.postMessage", MOGUL_MENU_JUMPER_MESSAGES.OPEN_PREDICTION);
  };

  return (
    <ActivityBannerFragment
      title={hasPredictionEnded ? "Prediction ended" : "Current prediction"}
      startTime={predictionStartTime}
      endTime={predictionEndTime}
      color={"#AF7AF2"}
      icon={{
        path: CRYSTAL_BALL_ICON,
      }}
      action={hasPredictionEnded
        ? <DismissActionIcon />
        : <ContinueActionIcon onContinue={onContinue} />}
    >
      {!hasPredictionEnded
        ? <CurrentPrediction pollQuestion={pollQuestion} />
        : (winningOption && hasVoted)
        ? <PredictionEndedVoted amount={didWin ? myWinningShare : myPlacedVotes} didWin={didWin} />
        : <PredictionEndedNoVote pollQuestion={pollQuestion} winningOption={winningOption} />}
    </ActivityBannerFragment>
  );
}

function CurrentPrediction({ pollQuestion }: { pollQuestion: string }) {
  return <ActivityBannerInfo text={pollQuestion} />;
}

function PredictionEndedVoted(
  { amount, didWin = false }: { amount?: number; didWin?: boolean },
) {
  return (
    <ActivityBannerInfo
      text={didWin ? `You won ${amount}` : `You lost ${amount}`}
    >
      {amount ? <ChannelPointsIcon /> : null}
    </ActivityBannerInfo>
  );
}

function PredictionEndedNoVote(
  { pollQuestion, winningOption }: { pollQuestion: string; winningOption?: PollOption },
) {
  return (
    <ActivityBannerInfo text={pollQuestion}>
      {winningOption ? <ActivityBannerSecondaryInfo text={winningOption?.text} /> : null}
    </ActivityBannerInfo>
  );
}