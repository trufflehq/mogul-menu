import {
  Client,
  ExtensionInfo,
  getClient as _getClient,
  gql,
  jumper,
  Memo,
  PageIdentifier,
  React,
  useComputed,
  useSignal,
  useStyleSheet,
} from "../../deps.ts";
import YoutubeChat from "./youtube-chat.tsx";
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

function getChannelId(pageIdentifiers: PageIdentifier[]) {
  jumper.call("platform.log", `getChannelId`);

  const channelIdentifier = pageIdentifiers.find((identifier) =>
    identifier.sourceType === "youtubeLive"
  );

  jumper.call("platform.log", `channelIdentifier ${JSON.stringify(channelIdentifier)}`);

  if (!channelIdentifier) {
    return null;
  }

  return channelIdentifier.sourceId;
}

export default function ChatTab() {
  const extensionInfo$ = useSignal<ExtensionInfo>(jumper.call("context.getInfo"));

  useStyleSheet(styleSheet);

  const videoId$ = useComputed(() => {
    const extensionInfo = extensionInfo$.get();

    return extensionInfo?.pageInfo ? getVideoId(extensionInfo.pageInfo) : null;
    // return "tdfuwM-Ntu0";
  });

  const channelId$ = useComputed(() => {
    const extensionInfo = extensionInfo$.get();
    jumper.call("platform.log", `extensionInfo compute ${JSON.stringify(extensionInfo)}`);

    const channelId = extensionInfo?.pageInfo ? getChannelId(extensionInfo.pageInfo) : null;
    jumper.call("platform.log", `extensionInfo compute channelId ${channelId}`);

    return channelId;
    // return "UCvWU1K29wCZ8j1NsXsRrKnA";
  });

  // console.log("chatMessages", chatMessages);

  const videoId = videoId$.get();
  jumper.call("platform.log", `channel id${channelId$.get()}`);

  console.log("channelId$", channelId$.get());

  return <YoutubeChat videoId$={videoId$} channelId$={channelId$} />;
  // return videoId ? <MemoizedChatFrame videoId={videoId} /> : null;
  // return <MemoizedChatFrame videoId={"nIekFLJXbJg"} />; // pointcrow
  // return <MemoizedChatFrame videoId={"m4u4EKzebFQ"} />; // test stream
}
