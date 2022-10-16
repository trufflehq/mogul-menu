import {
  _,
  abbreviateNumber,
  Computed,
  formatNumber,
  Icon,
  ImageByAspectRatio,
  Memo,
  Observable,
  OperationContext,
  React,
  updateSignalOnChange,
  useMutation,
  useObserve,
  usePollingQuerySignal,
  useSelector,
  useSignal,
  useStyleSheet,
  useUpdateSignalOnChange,
} from "../../deps.ts";
import {
  CRYSTAL_BALL_ICON,
  CRYSTAL_BALL_ICON_VIEWBOX,
  DELETE_POLL_MUTATION,
  hasPermission,
  useOrgUserWithRoles$,
} from "../../shared/mod.ts";
import { ChannelPoints, Poll } from "../../types/mod.ts";
import Prediction from "../prediction/prediction.tsx";
import {
  ACTIVE_PREDICTION_QUERY,
  CHANNEL_POINTS_QUERY,
  END_PREDICTION_MUTATION,
  POLL_QUERY,
  REFUND_PREDICTION_MUTATION,
} from "../prediction/gql.ts";
import {
  getIsRefund,
  getTimeInfo,
  getTotalVotes,
  getWinningInfo,
} from "../prediction/prediction.tsx";
import SelectOutcomeDialog from "./select-outcome-dialog/select-outcome-dialog.tsx";
import { Page, usePageStack } from "../page-stack/mod.ts";
import { useDialog } from "../base/dialog-container/dialog-service.ts";

import Button from "../base/button/button.tsx";
import styleSheet from "./prediction-page.scss.js";

const CHANNEL_POINTS_SRC =
  "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";

function usePollingChannelPoints$(
  { interval = 1000 }: { interval?: number },
) {
  const channelPoints$ = useSignal<{ channelPoints: { orgUserCounter: ChannelPoints } }>(
    undefined!,
  );

  const { signal$: channelPointsData$, reexecuteQuery: reexecuteChannelPointsQuery } =
    usePollingQuerySignal({ interval, query: CHANNEL_POINTS_QUERY });

  // only update the channelPoits$ if the channel points data has changed
  useUpdateSignalOnChange(channelPoints$, channelPointsData$.data);

  return { channelPoints$, reexecuteChannelPointsQuery };
}

// polls for a specific poll by id
function usePollingPrediction$(
  { interval = 2000, pollId }: { interval?: number; pollId: string },
) {
  const prediction$ = useSignal<{ poll: Poll }>(undefined!);

  const { signal$: predictionResponse$, reexecuteQuery: reexecutePredictionQuery } =
    usePollingQuerySignal({ interval, query: POLL_QUERY, variables: { id: pollId } });

  // only update the prediction$ if the poll has changed
  useUpdateSignalOnChange(prediction$, predictionResponse$.data);

  return { prediction$, predictionResponse$, reexecutePredictionQuery };
}

// polling for poll connection and converts to a poll observable
function usePollingActivePrediction$(
  { interval = 2000 }: { interval?: number },
) {
  const prediction$ = useSignal<{ poll: Poll }>(undefined!);

  const { signal$: predictionConnection$, reexecuteQuery: reexecutePredictionQuery } =
    usePollingQuerySignal({ interval, query: ACTIVE_PREDICTION_QUERY });

  // we use the setter directly here because we want to convert from a PollConnection to a Poll
  useObserve(() => {
    const activePrediction = predictionConnection$.data?.get()?.pollConnection.nodes[0];

    if (activePrediction) {
      updateSignalOnChange(prediction$, { poll: activePrediction });
    }
  });

  return { predictionConnection$, prediction$, reexecutePredictionQuery };
}

export default function PredictionPage({ pollId }: { pollId?: string }) {
  useStyleSheet(styleSheet);

  return pollId ? <PredictionByIdPage pollId={pollId} /> : <ActivePredictionPage />;
}

function ActivePredictionPage() {
  const { prediction$, reexecutePredictionQuery, predictionConnection$ } =
    usePollingActivePrediction$({ interval: 1000 });
  const hasFetched$ = useSignal(false);
  const isFetching$ = useSignal(false);

  // we use this to ensure we only render the empty state if the prediction page has already fetched data
  useObserve(() => {
    const isFetching = predictionConnection$.fetching.get();
    isFetching$.set(isFetching);
    if (isFetching && !hasFetched$.get()) {
      hasFetched$.set(true);
    }
  });

  return (
    <PredictionPageBase
      prediction$={prediction$}
      reexecutePredictionQuery={reexecutePredictionQuery}
      hasFetched$={hasFetched$}
      isFetching$={isFetching$}
      emptyStateMessage="No active predictions"
    />
  );
}

function PredictionByIdPage({ pollId }: { pollId: string }) {
  const { prediction$, reexecutePredictionQuery, predictionResponse$ } = usePollingPrediction$({
    interval: 1000,
    pollId,
  });

  const hasFetched$ = useSignal(false);
  const isFetching$ = useSignal(false);

  // we use this to ensure we only render the empty state if the prediction page has already fetched data
  useObserve(() => {
    const isFetching = predictionResponse$.fetching.get();
    isFetching$.set(isFetching);

    if (isFetching && !hasFetched$.get()) {
      hasFetched$.set(true);
    }
  });

  return (
    <PredictionPageBase
      prediction$={prediction$}
      reexecutePredictionQuery={reexecutePredictionQuery}
      isFetching$={isFetching$}
      hasFetched$={hasFetched$}
    />
  );
}

function PredictionPageBase(
  {
    prediction$,
    reexecutePredictionQuery,
    hasFetched$,
    isFetching$,
    emptyStateMessage = "Missing prediction",
  }: {
    prediction$: Observable<{ poll: Poll }>;
    reexecutePredictionQuery: (opts?: Partial<OperationContext> | undefined) => void;
    hasFetched$: Observable<boolean>;
    isFetching$: Observable<boolean>;
    emptyStateMessage?: string;
  },
) {
  const { channelPoints$ } = usePollingChannelPoints$({});
  const orgUserWithRoles$ = useOrgUserWithRoles$();
  const { popPage } = usePageStack();

  const hasPollPermissions = useSelector(() =>
    hasPermission({
      orgUser: orgUserWithRoles$.orgUser.get!(),
      actions: ["update", "delete"],
      filters: {
        poll: { isAll: true, rank: 0 },
      },
    })
  );

  return (
    <Page
      title="Prediction"
      headerTopRight={<PredictionHeader channelPoints$={channelPoints$} />}
      onBack={popPage}
      footer={hasPollPermissions
        ? (
          <Memo>
            {() => (
              <PredictionFooter
                prediction$={prediction$}
                reexecutePredictionQuery={reexecutePredictionQuery}
              />
            )}
          </Memo>
        )
        : null}
    >
      {prediction$.get()
        ? (
          <Computed>
            {() => (
              <Prediction
                prediction$={prediction$}
                refetchPrediction={reexecutePredictionQuery}
              />
            )}
          </Computed>
        )
        : !isFetching$.get() && hasFetched$.get()
        ? <EmptyPrediction message={emptyStateMessage} />
        : null}
    </Page>
  );
}

function PredictionHeader(
  { channelPoints$ }: {
    channelPoints$: Observable<{ channelPoints: { orgUserCounter: ChannelPoints } }>;
  },
) {
  return (
    <div className="c-predictions-page_channel-points">
      <div className="icon">
        <ImageByAspectRatio
          imageUrl={CHANNEL_POINTS_SRC}
          aspectRatio={1}
          widthPx={16}
          height={16}
        />
      </div>
      <div
        className="amount"
        title={formatNumber(channelPoints$.channelPoints.orgUserCounter.count.get())}
      >
        {abbreviateNumber(channelPoints$.channelPoints.orgUserCounter.count.get() || 0, 1)}
      </div>
    </div>
  );
}

function PredictionFooter({
  prediction$,
  reexecutePredictionQuery,
}: {
  prediction$: Observable<{ poll: Poll }>;
  reexecutePredictionQuery: (opts?: Partial<OperationContext> | undefined) => void;
}) {
  const [, executeDeletePollMutation] = useMutation(DELETE_POLL_MUTATION);
  const [, executeRefundPredictionMutation] = useMutation(REFUND_PREDICTION_MUTATION);
  const [, executeEndPredictionMutation] = useMutation(END_PREDICTION_MUTATION);
  const error$ = useSignal("");
  const { popPage } = usePageStack();
  const { pushDialog } = useDialog();

  const onDelete = async () => {
    error$.set("");
    try {
      const deleteResult = await executeDeletePollMutation({
        id: prediction$.poll.id.get(),
      });

      if (deleteResult.error) {
        console.error("error deleting poll", deleteResult.error);
        error$.set(deleteResult.error.graphQLErrors[0]?.message);
        return;
      }
      popPage();
    } catch (err) {
      console.error("error deleting poll", err);
      error$.set(err.message);
    }
  };

  const onRefund = async () => {
    error$.set("");
    try {
      const refundResult = await executeRefundPredictionMutation({
        id: prediction$.poll.id.get(),
      });

      if (refundResult.error) {
        console.error("error refunding poll", refundResult.error);
        error$.set(refundResult.error.graphQLErrors[0]?.message);
        return;
      }

      await reexecutePredictionQuery({ requestPolicy: "network-only" });
    } catch (err) {
      console.error("error refunding poll", err);
      error$.set(err.message);
    }
  };

  const onEndTime = async () => {
    error$.set("");
    try {
      const endPredictionResult = await executeEndPredictionMutation({
        id: prediction$.poll.id.get(),
      });

      if (endPredictionResult.error) {
        console.error("error ending poll", endPredictionResult.error);
        error$.set(endPredictionResult.error.graphQLErrors[0]?.message);
        return;
      }

      if (endPredictionResult.data?.pollUpsert) {
        prediction$.set({ poll: endPredictionResult.data?.pollUpsert.poll });
      }

      await reexecutePredictionQuery({ requestPolicy: "network-only" });
    } catch (err) {
      console.error("error ending poll", err);
      error$.set(err.message);
    }
  };

  const onSelectOutcome = () => {
    pushDialog(<SelectOutcomeDialog prediction$={prediction$} />);
  };

  const { isRefund } = useSelector(() => getIsRefund({ prediction$ }));
  const { winningOption } = useSelector(() => getWinningInfo({ prediction$ }));
  const { totalVotes } = useSelector(() => getTotalVotes({ prediction$ }));
  const { hasPredictionEnded } = useSelector(() => getTimeInfo({ prediction$ }));

  return (
    <div className="c-predictions-page_footer">
      <div className="delete">
        <Button onClick={onDelete} shouldHandleLoading style="bg-tertiary">
          Delete
        </Button>
      </div>
      <div className="manage">
        <div className="error">
          {error$.get() && <div className="error">{error$.get()}</div>}
        </div>
        {(!isRefund && !winningOption && totalVotes > 0)
          ? (
            <Button onClick={onRefund} shouldHandleLoading style="bg-tertiary">
              Refund
            </Button>
          )
          : null}
        {!hasPredictionEnded
          ? (
            <Button style="primary" onClick={onEndTime} shouldHandleLoading>
              End prediction
            </Button>
          )
          : !isRefund && !winningOption
          ? (
            <Button style="primary" onClick={onSelectOutcome}>
              Select outcome
            </Button>
          )
          : null}
      </div>
    </div>
  );
}

function EmptyPrediction({ message }: { message: string }) {
  return (
    <div className="c-prediction-page_empty-predictions">
      <div>
        <Icon
          icon={CRYSTAL_BALL_ICON}
          color="var(--mm-color-text-bg-primary)"
          size="40px"
          viewBox={CRYSTAL_BALL_ICON_VIEWBOX}
        />
      </div>
      <div className="text">{message}</div>
    </div>
  );
}
