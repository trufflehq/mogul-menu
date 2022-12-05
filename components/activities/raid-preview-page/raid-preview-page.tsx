import {
  getPreviewSrc,
  gql,
  React,
  useMutation,
  useObserve,
  useSelector,
  useSignal,
  useStyleSheet,
  useSubscriptionSignal,
} from "../../../deps.ts";
import { Page, usePageStack } from "../../page-stack/mod.ts";
import Button from "../../base/button/button.tsx";
import DeleteDialog from "../../delete-dialog/delete-dialog.tsx";
import { useDialog } from "../../base/dialog-container/dialog-service.ts";

import { RaidIframe } from "../create-raid-page/create-raid-page.tsx";
import stylesheet from "./raid-preview-page.scss.js";

const END_RAID_MUTATION_QUERY = gql`
mutation EndRaidMutation($id: ID!) {
  alertMarkShown(
    input: {
      id: $id
    }
  ) {
    alert {
      id
    }
  }
}
`;

const DELETE_RAID_MUTATION_QUERY = gql`
mutation DeleteRaidMutation($id: ID!) {
  alertDeleteById(
    input: {
      id: $id
    }
  ) {
    alert {
      id
    }
  }
}
`;

export const RAID_SUBSCRIPTION = gql`
  subscription RaidSubscription($id: ID) {
    alert(input: { id:$id }) {
      id
      status
      time
      data
    }
  }
`;

export default function RaidPreviewPage({ alertId }: { alertId: string }) {
  useStyleSheet(stylesheet);
  const [, executeEndRaidMutation] = useMutation(END_RAID_MUTATION_QUERY);
  const [, executeDeleteRaidMutation] = useMutation(DELETE_RAID_MUTATION_QUERY);
  const { pushDialog, popDialog } = useDialog();
  const previewSrc$ = useSignal("");

  const raidError$ = useSignal("");
  const { signal$: raid$ } = useSubscriptionSignal(RAID_SUBSCRIPTION, { id: alertId });
  const { popPage } = usePageStack();
  const onEndRaid = async () => {
    const result = await executeEndRaidMutation({ id: alertId });

    if (result.error?.graphQLErrors?.length) {
      raidError$.set(result.error.graphQLErrors[0].message);
    } else {
      popPage();
    }
  };

  const onDeleteRaid = async () => {
    const result = await executeDeleteRaidMutation({ id: alertId });

    if (result.error?.graphQLErrors?.length) {
      raidError$.set(result.error.graphQLErrors[0].message);
    } else {
      popPage();
      popDialog();
    }
  };

  const onDelete = () => {
    pushDialog(
      <DeleteDialog
        title="Are you sure you want to delete this raid?"
        onDelete={onDeleteRaid}
        error$={raidError$}
      />,
    );
  };

  const title = useSelector(() => raid$.data.alert.data.title?.get());
  const description = useSelector(() => raid$.data.alert.data.description?.get());
  const isReady = useSelector(() => raid$.data.alert.status?.get() === "ready");

  useObserve(() => {
    const src = getPreviewSrc(raid$.data.alert.data.url?.get());
    // needed to add this check since is was updating the previewSrc$ even when the src was the same
    // and causing the YT embed to refire its loading animation
    const previewSrc = previewSrc$.get();
    if (src && src !== previewSrc) {
      previewSrc$.set(src);
    }
  });

  const previewSrc = useSelector(() => previewSrc$.get());
  const raidError = useSelector(() => raidError$.get());
  const raidCreatedAt = useSelector(() => new Date(raid$.data.alert.time?.get()));
  return (
    <Page
      title="Start a raid"
      shouldShowHeader
      footer={
        <div className="c-raid-preview-page__footer">
          <Button
            style="bg-tertiary"
            onClick={onDelete}
            shouldHandleLoading
          >
            Delete
          </Button>
          {isReady
            ? (
              <Button
                style="bg-tertiary"
                onClick={onEndRaid}
                shouldHandleLoading
              >
                End raid
              </Button>
            )
            : null}
        </div>
      }
    >
      <div className="c-raid-preview-page">
        {title ? <div className="title">{title}</div> : null}
        {description ? <div className="description">{description}</div> : null}
        <div className="info">
          {isReady ? "Raid active" : getFormattedDate(raidCreatedAt)}
        </div>
        {raidError ? <div className="error">{raidError}</div> : null}
        {previewSrc
          ? (
            <div className="preview">
              <RaidIframe previewSrc={previewSrc} />
            </div>
          )
          : null}
      </div>
    </Page>
  );
}

function getFormattedDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
