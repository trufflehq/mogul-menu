import {
  _,
  abbreviateNumber,
  Computed,
  formatNumber,
  Icon,
  ImageByAspectRatio,
  Memo,
  Observable,
  React,
  useEffect,
  useMutation,
  useObserve,
  useSelector,
  useSignal,
  useStyleSheet,
  useUrqlQuerySignal,
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
import { ACTIVE_PREDICTION_QUERY, CHANNEL_POINTS_QUERY, POLL_QUERY } from "../prediction/gql.ts";
import { Page, usePageStack } from "../page-stack/mod.ts";
import Button from "../base/button/button.tsx";
import styleSheet from "./prediction-page.scss.js";

const CHANNEL_POINTS_SRC =
  "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";

function usePollingChannelPoints$(
  { interval = 1000 }: { interval?: number },
) {
  const channelPoints$ = useSignal<ChannelPoints>(undefined!);
  const { signal$: channelPointsData$, reexecuteQuery: reexecuteChannelPointsQuery } =
    useUrqlQuerySignal(
      CHANNEL_POINTS_QUERY,
    );

  useEffect(() => {
    const id = setInterval(() => {
      reexecuteChannelPointsQuery({ requestPolicy: "network-only" });
    }, interval);

    return () => clearInterval(id);
  }, []);

  // we use this to cut down rerenders in the prediction component by only updating the observable
  // if the response has changed vs. on every interval
  useObserve(() => {
    const channelPoints = channelPointsData$.data?.get()?.channelPoints.orgUserCounter;
    const existingChannelPoints = channelPoints$.get();
    if (channelPoints && !_.isEqual(channelPoints, existingChannelPoints)) {
      channelPoints$.set(channelPoints);
    }
  });

  return { channelPoints$, reexecuteChannelPointsQuery };
}

function usePollingPrediction$(
  { interval = 2000, pollId }: { interval?: number; pollId: string },
) {
  const prediction$ = useSignal<Poll>(undefined!);

  const { signal$: predictionResponse$, reexecuteQuery: reexecutePredictionQuery } =
    useUrqlQuerySignal(
      POLL_QUERY,
      {
        id: pollId,
      },
    );

  useEffect(() => {
    const id = setInterval(() => {
      reexecutePredictionQuery({ requestPolicy: "network-only" });
    }, interval);

    return () => clearInterval(id);
  }, []);

  // we use this to cut down rerenders in the prediction component by only updating the observable
  // if the response has changed vs. on every interval
  useObserve(() => {
    const currentPrediction = predictionResponse$.data?.get()?.poll;
    const pastPrediction = prediction$.get();

    // only update if the prediction has changed
    if (currentPrediction && !_.isEqual(currentPrediction, pastPrediction)) {
      prediction$.set(currentPrediction);
    }
  });

  return { prediction$, predictionResponse$, reexecutePredictionQuery };
}

function usePollingActivePrediction$(
  { interval = 2000 }: { interval?: number },
) {
  const prediction$ = useSignal<Poll>(undefined!);
  const { signal$: predictionConnection$, reexecuteQuery: reexecutePredictionQuery } =
    useUrqlQuerySignal(
      ACTIVE_PREDICTION_QUERY,
    );

  useEffect(() => {
    const id = setInterval(() => {
      reexecutePredictionQuery({ requestPolicy: "network-only" });
    }, interval);

    return () => clearInterval(id);
  }, []);

  // we use this to cut down rerenders in the prediction component by only updating the observable
  // if the response has changed vs. on every interval
  useObserve(() => {
    const activePrediction = predictionConnection$.data?.get()?.pollConnection.nodes[0];
    const pastPrediction = prediction$.get();

    // only update if the prediction has changed
    if (activePrediction && !_.isEqual(activePrediction, pastPrediction)) {
      prediction$.set(activePrediction);
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
    if (predictionConnection$.fetching.get()) {
      isFetching$.set(true);
      if (!hasFetched$.get()) {
        hasFetched$.set(true);
      }
    } else {
      isFetching$.set(false);
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
    if (predictionResponse$.fetching.get()) {
      isFetching$.set(true);
      if (!hasFetched$.get()) {
        hasFetched$.set(true);
      }
    } else {
      isFetching$.set(false);
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
    prediction$: Observable<Poll>;
    reexecutePredictionQuery: () => void;
    hasFetched$: Observable<boolean>;
    isFetching$: Observable<boolean>;

    emptyStateMessage?: string;
  },
) {
  const { channelPoints$ } = usePollingChannelPoints$({});
  const [, executeDeletePollMutation] = useMutation(DELETE_POLL_MUTATION);
  const error$ = useSignal("");
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

  const onDelete = async () => {
    error$.set("");
    try {
      const deleteResult = await executeDeletePollMutation({
        id: prediction$.id.get(),
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

  return (
    <Memo>
      {() => {
        return (
          <Page
            title="Prediction"
            headerTopRight={<PredictionHeader channelPoints$={channelPoints$} />}
            onBack={popPage}
            footer={hasPollPermissions
              ? (
                <div className="c-predictions-page_footer">
                  {error$.get() && <div className="error">{error$.get()}</div>}
                  <Button onClick={onDelete} shouldHandleLoading style="bg-tertiary">
                    Delete
                  </Button>
                </div>
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
      }}
    </Memo>
  );
}

function PredictionHeader({ channelPoints$ }: { channelPoints$: Observable<ChannelPoints> }) {
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
      <div className="amount" title={formatNumber(channelPoints$.count.get())}>
        {abbreviateNumber(channelPoints$.count.get() || 0, 1)}
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
