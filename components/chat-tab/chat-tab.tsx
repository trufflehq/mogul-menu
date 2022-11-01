import {
  ExtensionInfo,
  jumper,
  PageIdentifier,
  React,
  useComputed,
  useSignal,
  useStyleSheet,
} from "../../deps.ts";

import styleSheet from "./chat-tab.scss.js";

export function extractYoutubeId(url: string) {
  const regex = /(?:[?&]v=|\/embed\/|\/1\/|\/v\/|(https?:\/\/)?(?:www\.)?youtu\.be\/)([^&\n?#]+)/;
  const id = url.match(regex);
  return id?.[2];
}

function getVideoId(pageIdentifiers: PageIdentifier[]) {
  const urlIdentifier = pageIdentifiers.find((identifier) => identifier.sourceType === "url");

  if (!urlIdentifier) {
    return null;
  }

  return extractYoutubeId(urlIdentifier.sourceId);
}

export default function ChatTab() {
  const extensionInfo$ = useSignal<ExtensionInfo>(jumper.call("context.getInfo"));

  useStyleSheet(styleSheet);

  const videoId$ = useComputed(() => {
    const extensionInfo = extensionInfo$.get();
    return extensionInfo?.pageInfo ? getVideoId(extensionInfo.pageInfo) : null;
  });

  const videoId = videoId$.get();

  return videoId ? <MemoizedChatFrame videoId={videoId} /> : null;
}

const MemoizedChatFrame = React.memo(YoutubeLiveIframe);

function YoutubeLiveIframe({ videoId }: { videoId: string }) {
  return (
    <div className="c-chat-tab">
      <iframe
        src={`https://www.youtube.com/live_chat?is_popout=1&v=${videoId}&embed_domain=${location.hostname}`}
      />
    </div>
  );
}
