import {
  getPreviewSrc,
  gql,
  Observable,
  React,
  useMutation,
  useObserve,
  useSelector,
  useSignal,
  useStyleSheet,
} from "../../../deps.ts";
import { useSnackBar } from "../../snackbar/mod.ts";
import RaidCreatedSnackbar from "../raid-created-snackbar/raid-created-snackbar.tsx";
import { Page, usePageStack } from "../../page-stack/mod.ts";
import Button from "../../base/button/button.tsx";
import Input from "../../base/input/input.tsx";
import TextArea from "../../base/text-area/text-area.tsx";

import stylesheet from "./create-raid-page.scss.js";

const CREATE_RAID_MUTATION_QUERY = gql`
mutation CreateRaidMutation($title: String, $url: String, $description: String) {
  alertUpsert(
    input: {
      type: "raid-stream"
      message: $title
      data: {
        url: $url,
        title: $title,
        description: $description
      },
    }
  ) {
    alert {
      id
    }
  }
}
`;

interface RaidInput {
  link: string;
  title: string;
  description: string;
}

export default function CreateRaidPage() {
  useStyleSheet(stylesheet);
  const previewSrc$ = useSignal<string | null>("");
  const raidError$ = useSignal("");
  const raid$ = useSignal<RaidInput>({
    link: "",
    title: "",
    description: "",
  });

  const [, executeCreateRaidMutation] = useMutation(CREATE_RAID_MUTATION_QUERY);
  const { popPage } = usePageStack();
  const enqueueSnackBar = useSnackBar();

  useObserve(() => {
    const src = getPreviewSrc(raid$.link.get());
    previewSrc$.set(src);
  });

  const onClick = async () => {
    const result = await executeCreateRaidMutation({
      title: raid$.title.get(),
      description: raid$.description.get(),
      url: raid$.link.get(),
    });

    if (result.error?.graphQLErrors?.length) {
      raidError$.set(result.error.graphQLErrors[0].message);
    } else {
      popPage();
      enqueueSnackBar(<RaidCreatedSnackbar />);
    }
  };

  const canSubmit = useSelector(() => {
    return Boolean(raid$.link.get());
  });

  const raidError = useSelector(() => raidError$.get());
  return (
    <Page
      title="Start a raid"
      shouldShowHeader
      footer={
        <div className="c-create-raid-page__footer">
          <Button
            style={"primary"}
            onClick={onClick}
            shouldHandleLoading
            isDisabled={!canSubmit}
          >
            Start raid
          </Button>
        </div>
      }
    >
      <div className="c-create-raid-page">
        <div className="description">
          Send viewers to a video, streamer, or site after your stream ends
        </div>
        {raidError && <div className="error">{raidError}</div>}
        <div className="inputs">
          <RaidPreview previewSrc$={previewSrc$} raid$={raid$} />
          <Input
            label="Raid title"
            placeholder={`Add a title like "Check out this video"`}
            value$={raid$.title}
          />
          <TextArea
            label="Raid description"
            placeholder="Write a description that will get viewers excited about the raid"
            value$={raid$.description}
          />
        </div>
      </div>
    </Page>
  );
}

function RaidPreview(
  { previewSrc$, raid$ }: { previewSrc$: Observable<string | null>; raid$: Observable<RaidInput> },
) {
  const previewSrc = useSelector(() => previewSrc$.get());

  const onRemove = () => {
    raid$.link.set("");
  };

  return previewSrc
    ? (
      <div className="c-raid-preview">
        <RaidIframe previewSrc={previewSrc} />
        <div className="remove" onClick={onRemove}>
          Remove
        </div>
      </div>
    )
    : <Input label="Link" value$={raid$.link} />;
}

export function RaidIframe({ previewSrc }: { previewSrc: string }) {
  return (
    <iframe
      src={previewSrc}
      frameBorder={0}
      allowFullScreen={true}
      title="creator-frame"
      allow="autoplay"
    />
  );
}
