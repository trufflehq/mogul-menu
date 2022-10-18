import {
  classKebab,
  getConnectionSourceType as getChannelSourceType,
  gql,
  LabelPrimitive,
  RadioGroup,
  React,
  useExtensionInfo$,
  useMutation,
  useObserve,
  usePollingQuerySignal,
  useSelector,
  useSignal,
  useStyleSheet,
  useUpdateSignalOnChange,
} from "../../../deps.ts";

import { Page } from "../../page-stack/mod.ts";
import styleSheet from "./admin-settings-page.scss.js";

interface Channel {
  id: string;
  isLive: boolean;
  isManual: boolean;
  sourceType: string;
}

const CHANNEL_QUERY = gql`
  query ChannelQuery($sourceType: String, $sourceId: String) {
    channel(input: { sourceType: $sourceType, sourceId: $sourceId }) {
      id
      isLive
      isManual
      sourceType
    }
  }
`;

const CHANNEL_UPSERT_MUTATION_QUERY = gql`
  mutation ChannelUpsertMutation($sourceType: String, $isLive: Boolean, $isManual: Boolean) {
    channelUpsert(input: { sourceType: $sourceType, isLive: $isLive, isManual: $isManual }) {
      channel {
        isLive
        isManual
      }
    }
  }
`;

function usePollingChannel$(
  { interval = 1000 }: { interval?: number },
) {
  const channel$ = useSignal<{ channel: Channel }>(
    undefined!,
  );

  const { signal$: channelData$, reexecuteQuery: reexecuteChannelQuery } = usePollingQuerySignal({
    interval,
    query: CHANNEL_QUERY,
  });

  // only update the channel$ if the channel data has changed
  useUpdateSignalOnChange(channel$, channelData$.data);

  return { channel$, reexecuteChannelQuery };
}

type ChannelStatusSelectionValue = "auto" | "manual-online" | "manual-offline";

const getChannelStatusSelectionValue = ({ channel }: { channel: Channel }) => {
  if (!channel?.isManual) {
    return "auto";
  } else if (channel?.isLive) {
    return "manual-online";
  } else {
    return "manual-offline";
  }
};

function getChannelStatusBySelectionValue(
  { selectionValue }: { selectionValue: ChannelStatusSelectionValue },
) {
  switch (selectionValue) {
    case "auto":
      return { isLive: undefined, isManual: false };
    case "manual-online":
      return { isLive: true, isManual: true };
    case "manual-offline":
      return { isLive: false, isManual: true };
  }
}
export default function AdminSettingsPage() {
  useStyleSheet(styleSheet);
  const [, executeChannelUpsertMutation] = useMutation(CHANNEL_UPSERT_MUTATION_QUERY);
  const { channel$ } = usePollingChannel$({ interval: 2000 });
  const error$ = useSignal("");
  const channelInfo = useSignal<{
    sourceType: string;
    isLive: boolean;
    selectionValue: ChannelStatusSelectionValue | undefined;
  }>({
    sourceType: "",
    isLive: false,
    selectionValue: undefined,
  });
  const extensionInfo$ = useExtensionInfo$();

  useObserve(() => {
    const extensionInfo = extensionInfo$.get();
    const sourceType = extensionInfo?.pageInfo
      ? getChannelSourceType(extensionInfo.pageInfo)
      : "youtube";

    if (sourceType) {
      channelInfo.sourceType.set(sourceType);
    }

    const channel = channel$.get();
    if (channel?.channel) {
      // convert the channel model into the radio group status value
      const selectionValue = getChannelStatusSelectionValue({ channel: channel?.channel });
      channelInfo.selectionValue.set(selectionValue);

      // set the isLive value
      const isLive = channel?.channel?.isLive;
      channelInfo.isLive.set(isLive);
    }
  });

  useObserve(async () => {
    const selectionValue = channelInfo.selectionValue.get();
    const channel = channel$.get();
    const upstreamSelectionValue = getChannelStatusSelectionValue({ channel: channel?.channel });
    const hasChannelStatusChanged = selectionValue && upstreamSelectionValue &&
      selectionValue !== upstreamSelectionValue;

    // if the selection value doesn't match the upstream channel status, update the channel status
    if (hasChannelStatusChanged) {
      const { isLive, isManual } = getChannelStatusBySelectionValue({ selectionValue });
      error$.set("");
      try {
        const channelUpsertResult = await executeChannelUpsertMutation({
          sourceType: channelInfo.sourceType.get(),
          isLive,
          isManual,
        }, {
          additionalTypenames: ["Channel"],
        });

        if (channelUpsertResult.error) {
          console.error("error updating channel status", channelUpsertResult.error);
          error$.set(channelUpsertResult.error.graphQLErrors[0]?.message);
          return;
        }
      } catch (err) {
        error$.set(err.message);
      }
    }
  });

  const onValueChange = (value: ChannelStatusSelectionValue) => {
    channelInfo.selectionValue.set(value);
  };

  const selectionValue = useSelector(() => channelInfo.selectionValue.get());
  const isLive = useSelector(() => channelInfo.isLive.get());
  const error = useSelector(() => error$.get());
  return (
    <Page title="Admin Settings">
      <div className="c-admin-settings-page-body">
        <div className="status mm-text-header-caps">Channel Status</div>
        {error && <div className="error">{error}</div>}
        <RadioGroup.Root
          className="radio-group"
          value={selectionValue}
          onValueChange={onValueChange}
        >
          <ChannelStatusRadioButton value="auto" id="auto" label="Auto" isLive={isLive} />
          <ChannelStatusRadioButton
            value="manual-online"
            id="manual-online"
            label="Manual"
            isLive={true}
          />
          <ChannelStatusRadioButton
            value="manual-offline"
            id="manual-offline"
            label="Manual"
            isLive={false}
          />
        </RadioGroup.Root>
      </div>
    </Page>
  );
}

function ChannelStatusRadioButton(
  { value, id, label, isLive }: { value: string; id: string; label: string; isLive: boolean },
) {
  return (
    <div className="c-channel-status-radio-button">
      <RadioGroup.Item className="item" id={id} value={value}>
        <RadioGroup.Indicator className="indicator" />
      </RadioGroup.Item>
      <LabelPrimitive.Root htmlFor={id} className="label">
        {`${label} : `}
        <span className={`status ${classKebab({ isLive, isOffline: !isLive })}`}>
          {isLive ? "Online" : "Offline"}
        </span>
      </LabelPrimitive.Root>
    </div>
  );
}
