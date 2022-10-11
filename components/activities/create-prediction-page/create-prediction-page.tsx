import {
  classKebab,
  gql,
  LabelPrimitive,
  Observable,
  observer,
  React,
  useComputed,
  useMutation,
  useSelector,
  useSignal,
  useStyleSheet,
} from "../../../deps.ts";
import { useSnackBar } from "../../snackbar/mod.ts";
import PredictionCreatedSnackbar from "../prediction-created-snackbar/prediction-created-snackbar.tsx";
import { Page, usePageStack } from "../../page-stack/mod.ts";
import Button from "../../base/button/button.tsx";
import Input, { InputProps } from "../../base/input/input.tsx";
import stylesheet from "./create-prediction-page.scss.js";

function getOptionColor(index: number) {
  const colors = [
    "var(--mm-color-opt-1)",
    "var(--mm-color-opt-2)",
    "var(--mm-color-opt-3)",
    "var(--mm-color-opt-4)",
  ];
  return colors[index % colors.length];
}

const CREATE_PREDICTION_QUERY = gql`
mutation CreatePrediction($question: String, $options: JSON, $durationSeconds: Int) {
  pollUpsert(
    input: {
      question: $question
      options: $options
      durationSeconds: $durationSeconds,
      data: { type: "prediction" }
    }
  ) {
    poll {
      id
      question
      endTime
      options {
        text
        index
      }
      data
    }
  }
}
`;

interface PollOptionInput {
  text: string;
  index: number;
}

const CreatePredictionPage = observer(function CreatePredictionPage() {
  useStyleSheet(stylesheet);
  const [, executeCreatePredictionMutation] = useMutation(CREATE_PREDICTION_QUERY);
  const { popPage } = usePageStack();
  const enqueueSnackBar = useSnackBar();
  const predictionError$ = useSignal("");
  const prediction$ = useSignal<{
    question: string;
    options: PollOptionInput[];
    durationMinutes: string;
  }>({
    question: "",
    options: [{ text: "", index: 0 }, { text: "", index: 0 }],
    durationMinutes: "0",
  });

  const onClick = async () => {
    const result = await executeCreatePredictionMutation({
      question: prediction$.question.get(),
      options: prediction$.options.get(),
      durationSeconds: parseInt(prediction$.durationMinutes.get()) * 60, // TODO constant
    });

    if (result.error?.graphQLErrors?.length) {
      predictionError$.set(result.error.graphQLErrors[0].message);
    } else {
      popPage();
      enqueueSnackBar(<PredictionCreatedSnackbar />);
    }
  };

  const canSubmit = useComputed(() => {
    const hasQuestion = Boolean(prediction$.question.get().length);
    const hasDuration = parseInt(prediction$.durationMinutes.get()) > 0;
    const hasOptions = prediction$.options.get().every((option) => option.text.length);

    return hasQuestion && hasDuration && hasOptions;
  });

  return (
    <Page
      title="Start a prediction"
      shouldShowHeader
      footer={
        <div className="c-create-prediction-page__footer">
          <Button
            style={"primary"}
            onClick={onClick}
            shouldHandleLoading
            isDisabled={!canSubmit.get()}
          >
            Start prediction
          </Button>
        </div>
      }
    >
      <div className="c-create-prediction-page">
        {predictionError$.get() && <div className="error">{predictionError$.get()}</div>}
        <Input label="Question" value$={prediction$.question} />
        <CreatePollOptions options$={prediction$.options} />
        <SubmissionPeriod durationMinutes$={prediction$.durationMinutes} />
      </div>
    </Page>
  );
});

function SubmissionPeriod({ durationMinutes$ }: { durationMinutes$: Observable<string> }) {
  const error$ = useComputed(() => {
    const duration = parseInt(durationMinutes$.get());
    return duration < 0 ? "Must be a positive value" : "";
  });

  return (
    <div className="c-submission-period">
      <div className="title">
        SUBMISSION PERIOD
      </div>
      <div className="duration">
        <DurationInput
          suffix="min"
          value$={durationMinutes$}
          error$={error$}
        />
      </div>
    </div>
  );
}

interface DurationInputProps extends InputProps {
  suffix?: string;
}

function DurationInput({ value$, error$, suffix = "min" }: DurationInputProps) {
  const error = useSelector(() => error$?.get());

  return (
    <div
      className={`c-number-input ${
        classKebab({
          hasSuffix: !!suffix,
          hasError: !!error,
        })
      }`}
    >
      <LabelPrimitive.Root className="label">
        How long do viewers have submit their guess?
      </LabelPrimitive.Root>
      <div className="input">
        <Input value$={value$} error$={error$} type="number" />
        {suffix && (
          <div className="suffix">
            {suffix}
          </div>
        )}
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

function CreatePollOptions({ options$ }: { options$: Observable<PollOptionInput[]> }) {
  return (
    <div className="c-create-poll-options">
      <div className="title">
        POSSIBLE OUTCOMES
      </div>
      <div className="options">
        {options$.map((option, i) => (
          <PollOptionInput
            color={getOptionColor(i)}
            placeholder={`Option ${i + 1}`}
            value$={option.text}
          />
        ))}
      </div>
    </div>
  );
}

interface PollOptionInputProps extends InputProps {
  color: string;
}

function PollOptionInput(
  { color, ...props }: PollOptionInputProps,
) {
  return (
    <div className="c-poll-option-input">
      <div className="block" style={{ backgroundColor: color }} />
      <Input
        css={{
          border: "none",
          backgroundColor: "var(--mm-color-bg-tertiary)",
        }}
        {...props}
      />
    </div>
  );
}

export default CreatePredictionPage;
