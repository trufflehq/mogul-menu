import {
  gql,
  jumper,
  React,
  useEffect,
  useMutation,
  usePollingQuery,
  useSelector,
  useStyleSheet,
} from "../../deps.ts";
import {
  ACTIVE_POLL_QUERY,
  CRYSTAL_BALL_ICON,
  CRYSTAL_BALL_ICON_VIEWBOX,
  hasPermission,
  MOGUL_MENU_JUMPER_MESSAGES,
  ONE_SECOND_MS,
  OrgUserQuerySignal,
  DELETE_POLL_MUTATION,
} from "../../shared/mod.ts";
import { usePageStack } from "../page-stack/mod.ts";
import { Poll } from "../../types/mod.ts";
import PredictionPage from "../prediction-page/prediction-page.tsx";
import { useMenu } from "../menu/mod.ts";
import Tile, { RemoveButton } from "../tile/tile.tsx";
import Time from "../time/time.tsx";
import styleSheet from "./prediction-tile.scss.js";


const POLL_INTERVAL = 2 * ONE_SECOND_MS;
const RESULTS_TIMOUT = 100 * ONE_SECOND_MS;
// NOTE: we don't currently have a way to clean up onMessage listeners
// in the extension so we'll need to be cognizant that the prediction tile
// component will be mounted for the lifetime of the embed
// listens for messages through jumper to open the prediction page
function useListenForOpenPrediction(showPredictionPage: () => void) {
  useEffect(() => {
    jumper.call("comms.onMessage", (message: string) => {
      if (message === MOGUL_MENU_JUMPER_MESSAGES.OPEN_PREDICTION) {
        showPredictionPage();
      }
    });
  }, []);
}

export default function PredictionTile(
  { orgUserWithRoles$ }: { orgUserWithRoles$: OrgUserQuerySignal },
) {
  useStyleSheet(styleSheet);
  const { setIsOpen } = useMenu();
  const { pushPage } = usePageStack();
  const [_deletePollResult, executeDeletePollResult] = useMutation(DELETE_POLL_MUTATION);
  const { data: activePollData } = usePollingQuery(POLL_INTERVAL, {
    query: ACTIVE_POLL_QUERY,
  });

  const hasPollDeletePermission = useSelector(() =>
    hasPermission({
      orgUser: orgUserWithRoles$.orgUser.get!(),
      actions: ["delete"],
      filters: {
        poll: { isAll: true, rank: 0 },
      },
    })
  );

  const activePoll: Poll = activePollData?.pollConnection?.nodes?.find(
    (poll: Poll) => poll?.data?.type === "prediction",
  );

  const onDelete = async () => {
    await executeDeletePollResult({ id: activePoll.id });
  };

  const pollMsLeft = new Date(activePoll?.endTime || Date.now()).getTime() - Date.now();
  const hasPredictionEnded = pollMsLeft <= 0;
  const hasWinner = activePoll?.data?.winningOptionIndex !== undefined;
  const timeSinceWinnerSelection = activePoll?.data?.winnerSelectedTime
    ? new Date(activePoll?.data?.winnerSelectedTime).getTime() - Date.now()
    : undefined;
  const hasResultsExpired = hasWinner && timeSinceWinnerSelection
    ? RESULTS_TIMOUT + timeSinceWinnerSelection < 0
    : false;

  let Content: React.ReactNode;

  if (hasResultsExpired) {
    Content = (
      <div className="content">
        <div className="primary-text">
          No current prediction
        </div>
      </div>
    );
  } else if (hasPredictionEnded && hasWinner) {
    Content = (
      <div className="content">
        <div className="primary-text">{activePoll?.question}</div>
        <div className="secondary-text">The results are in!</div>
      </div>
    );
  } else if (hasPredictionEnded) {
    Content = (
      <div className="content">
        <div className="primary-text">{activePoll?.question}</div>
        <div className="secondary-text">Submissions closed</div>
      </div>
    );
  } else {
    Content = (
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

  const showPredictionPage = () => {
    setIsOpen();
    pushPage(<PredictionPage />);
  };

  useListenForOpenPrediction(showPredictionPage);

  if (!activePoll) return <></>;

  return (
    <Tile
      className="c-prediction-tile"
      icon={CRYSTAL_BALL_ICON}
      iconViewBox={CRYSTAL_BALL_ICON_VIEWBOX}
      headerText="Prediction"
      color="#AB8FE9"
      shouldHandleLoading={true}
      removeTooltip="Delete"
      onClick={hasResultsExpired ? null : () => pushPage(<PredictionPage />)}
      content={() => Content}
      action={hasPollDeletePermission && !hasResultsExpired &&
        (
          <RemoveButton
            onRemove={onDelete}
            shouldHandleLoading={true}
            removeTooltip="Delete"
          />
        )}
    />
  );
}
