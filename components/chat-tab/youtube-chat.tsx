import {
  Client,
  computed,
  ExtensionInfo,
  For,
  // getClient,
  // For,
  getClient as _getClient,
  gql,
  jumper,
  Memo,
  Observable,
  observable,
  ObservableArray,
  ObservableBaseFns,
  ObservableComputed,
  ObservableObject,
  PageIdentifier,
  React,
  signal,
  useComputed,
  useMemo,
  useObservable,
  useObserve,
  useRef,
  useSelector,
  useSignal,
  useStyleSheet,
  useSubscription,
} from "../../deps.ts";

import { pipe, subscribe } from "https://npm.tfl.dev/wonka@4.0.15";

import { DEFAULT_CHAT_COLORS, getStringHash } from "./utils.ts";

// import {
//   For,
//   useComputed,
//   useObservable,
//   useObserve,
//   useSelector,
// } from "https://npm.tfl.dev/@legendapp/state@~0.21.0/react";
// import { observable, ObservableObject } from "https://npm.tfl.dev/@legendapp/state@~0.21.0";
import styleSheet from "./youtube-chat.scss.js";

const getClient = _getClient as () => Client;

export function extractYoutubeId(url: string) {
  const regex = /(?:[?&]v=|\/embed\/|\/1\/|\/v\/|(https?:\/\/)?(?:www\.)?youtu\.be\/)([^&\n?#]+)/;
  const id = url.match(regex);
  return id?.[2];
}

function getVideoId(pageIdentifiers: PageIdentifier[]) {
  const urlIdentifier = pageIdentifiers.find((identifier) => identifier.sourceType === "url");

  if (!urlIdentifier) {
    return "";
  }

  return extractYoutubeId(urlIdentifier.sourceId) ?? "";
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

interface YouTubeChatMessage {
  id: string | number;
  youtubeUserId: string;
  data: {
    id: string;
    message: string;
    formattedMessage: React.ReactNode;
    type: string;
    unix: number;
    author: {
      id: string;
      name: string;
      badges: {
        badge: string; // this is the url for the badge
        tooltip: string; // this is the tooltip for the badge
        type: string; // this is the type of badge
      }[];
    };
  };
  connection: {
    id: string;
    orgUser: {
      keyValueConnection: {
        nodes: {
          key: string;
          value: string;
        }[];
      };
      user: {
        name: string;
      };
      activePowerupConnection: {
        totalCount: number;
        nodes: {
          id: string;
          userId: string;
          data: {
            rgba: string;
            value: string;
          };
          powerup: {
            id: string;
            slug: string;

            componentRels: {
              props: Record<string, unknown>;
            }[];
          };
        }[];
      };
    };
  };
}

export function getUsernameColor(message: YouTubeChatMessage) {
  const orgUserNameColor = message.connection?.orgUser?.keyValueConnection?.nodes?.find((kv) =>
    kv.key === "nameColor"
  )?.value;

  if (orgUserNameColor) {
    return orgUserNameColor;
  }

  const authorName = message.data?.author?.name;

  const hash = getStringHash(authorName ?? "base name");
  return DEFAULT_CHAT_COLORS[
    ((hash % DEFAULT_CHAT_COLORS.length) + DEFAULT_CHAT_COLORS.length) % DEFAULT_CHAT_COLORS.length
  ];
}

export function getAuthorName(message: YouTubeChatMessage) {
  const orgUserName = message.connection?.orgUser?.user?.name;

  if (orgUserName) {
    return orgUserName;
  }

  return message.data?.author?.name;
}

const YOUTUBE_CHAT_MESSAGE_ADDED = gql<{ youtubeChatMessageAdded: YouTubeChatMessage }>
  `subscription YouTubeChatMessages($videoId: String!) {
  youtubeChatMessageAdded(youtubeVideoId: $videoId)
  {
    id
    youtubeUserId
    data
    connection {
      id
      orgUser
       {
          name
          keyValueConnection {
            nodes {
              key
              value
            }
          }
          user {
            name
          }
        }
    }
  }
}`;

function getBadge(badge: string | "MODERATOR" | "OWNER") {
  const badgeSrc = badge === "MODERATOR"
    ? "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1"
    : badge === "OWNER"
    ? "https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1"
    : badge;

  return badgeSrc ? <img className="badge" src={badgeSrc} /> : null;
}

export enum EmoteProvider {
  Twitch,
  FFZ,
  BTTV,
  Custom,
  Spore,
  SevenTV,
}
export type Emote = {
  provider: EmoteProvider;
  id: string;
  name: string;
  ext?: string;
  bitIndex?: number;
  channelId?: string;
};

function getEmoteUrl(emote: Emote) {
  if (emote.provider === EmoteProvider.Twitch) {
    return `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/static/dark/1.0`;
  } else if (emote.provider === EmoteProvider.FFZ) {
    return `https://cdn.frankerfacez.com/emote/${emote.id}/1`;
  } else if (emote.provider === EmoteProvider.BTTV) {
    return `https://cdn.betterttv.net/emote/${emote.id}/1x`;
  } else if (emote.provider === EmoteProvider.SevenTV) {
    return `https://cdn.7tv.app/emote/${emote.id}/1x`;
  } else if (emote.provider === EmoteProvider.Spore && emote?.ext) {
    return `https://cdn.bio/ugc/collectible/${emote.id}.tiny.${emote.ext}`;
  } else if (emote.provider === EmoteProvider.Custom) {
    return `https://v2.truffle.vip/emotes/${emote.id}`;
  } else {
    return undefined;
  }
}

const splitPattern = /[\s.,?!]/;
function splitWords(string: string): string[] {
  const result: string[] = [];
  let startOfMatch = 0;
  for (let i = 0; i < string.length - 1; i++) {
    if (splitPattern.test(string[i]) !== splitPattern.test(string[i + 1])) {
      result.push(string.substring(startOfMatch, i + 1));
      startOfMatch = i + 1;
    }
  }
  result.push(string.substring(startOfMatch));
  return result;
}

function formatMessage(text: string, emoteMap: Map<string, string>) {
  const words = splitWords(text);
  let msg = "";
  for (const word of words) {
    const emote = emoteMap.get(word);
    if (emote) {
      msg += `<img class="truffle-emote" src="${emote}" />`;
    } else {
      msg += word;
    }
  }

  // console.log("msg", msg);
  return msg;
}

// const messages$ = observable<YouTubeChatMessage[]>([]);
const messages$ = signal<YouTubeChatMessage[]>([]);

// const extensionInfo$ = signal(jumper.call("context.getInfo"));
// const videoId$ = computed(() => {
//   const extensionInfo = extensionInfo$.get();
//   console.log('ext. info', extensionInfo);
//   extensionInfo?.pageInfo ? getChannelId(extensionInfo.pageInfo) : null;
// });

function useMessageAddedSubscription() {
  const extensionInfo$ = useSignal<ExtensionInfo>(jumper.call("context.getInfo"));
  const videoId$ = useComputed(() => {
    const extensionInfo = extensionInfo$.get();
    console.log("get video id");
    return "TCIFqaxYFAs"; // myth
    // return "qH0b92JIPQQ";
    // return "m4u4EKzebFQ"; // riley
    // return "W23qQlhqepo"; // lupo
    return extensionInfo?.pageInfo ? getVideoId(extensionInfo.pageInfo) : null;
    // return "tdfuwM-Ntu0";s
  });

  const channelId$ = useComputed(() => {
    const extensionInfo = extensionInfo$.get();
    // jumper.call("platform.log", `extensionInfo compute ${JSON.stringify(extensionInfo)}`);

    const channelId = extensionInfo?.pageInfo ? getChannelId(extensionInfo.pageInfo) : null;
    // jumper.call("platform.log", `extensionInfo compute channelId ${channelId}`);

    return "UCvQczq3aHiHRBGEx-BKdrcg"; // myth
    // return channelId;
    // return channelId ?? "UCNF0LEQ2abMr0PAX3cfkAMg";
    // return "UCNF0LEQ2abMr0PAX3cfkAMg";
  });

  useObserve(() => {
    const videoId = videoId$.get();
    const { unsubscribe } = pipe(
      getClient().subscription(YOUTUBE_CHAT_MESSAGE_ADDED, { videoId }),
      subscribe((response) => {
        if (response.data?.youtubeChatMessageAdded) {
          // console.log("response.youtubeChatMessageAdded", response.data?.youtubeChatMessageAdded);
          messages$.set((prev) => {
            let newMessages = response.data?.youtubeChatMessageAdded
              ? [response.data?.youtubeChatMessageAdded, ...prev]
              : prev;
            if (newMessages.length > 75) {
              // newMessages = newMessages.slice(-50);
              console.log("old newMessages", newMessages);

              newMessages = newMessages.slice(0, newMessages?.length - 50);

              console.log("sliced newMessages", newMessages);
            }
            // console.log("newMessages", newMessages);
            return newMessages;
          });
        } else {
          console.error("ERRROR", response);
        }
      }),
    );
  });

  return { videoId$, channelId$ };
}

function useEmoteMap$(channelId$: ObservableComputed<string>) {
  const emoteMap$ = useSignal<Map<string, string>>(new Map());

  useObserve(async () => {
    const channelId = channelId$.get();
    const emoteMap = new Map<string, string>();

    const baseEmotesUrl = `https://v2.truffle.vip/gateway/emotes`;

    const url = channelId ? `${baseEmotesUrl}/c/${channelId}` : baseEmotesUrl;
    jumper.call("platform.log", `emotes channelId ${channelId} ${url}`);
    console.log(`emotes channelId ${channelId} ${url}`);
    const res = await fetch(url);
    const emotes = await res.json();

    // console.log("emotes", emotes);
    // jumper.call("platform.log", `emotes: ${JSON.stringify(emotes)}`);
    for (const emote of emotes) {
      // const emoji = generateYoutubeEmoji(emote);
      const url = getEmoteUrl(emote);
      if (url) {
        emoteMap.set(emote.name, url);
      }
    }

    emoteMap$.set(emoteMap);
  });

  return { emoteMap$ };
}

export default function YoutubeChat() {
  // const renderCount = ++useRef(0).current;
  useStyleSheet(styleSheet);
  const iframeRef = useRef<HTMLIFrameElement>(undefined!);
  const { videoId$, channelId$ } = useMessageAddedSubscription();

  const { emoteMap$ } = useEmoteMap$(channelId$);

  const videoId = useSelector(() => videoId$.get());

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const isPinnedToBottom = scrollTop < 0;
    if (isPinnedToBottom) {
      console.log("not bottom");
    } else {
      console.log("pinned to bottom");
    }
  };

  return (
    <div className="c-youtube-chat" data-swipe-ignore>
      <div className="messages">
        {/* {renderCount} */}
        <div className="inner" onScroll={handleScroll}>
          <For<YouTubeChatMessage, { emoteMap: Map<string, string> }>
            itemProps={{ emoteMap: emoteMap$.peek() }}
            each={messages$}
            item={ChatMessage}
            optimized
          />
        </div>
      </div>
      <div className="youtube">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/live_chat?is_popout=1&v=${videoId}&embed_domain=${location.hostname}`}
        />
      </div>
    </div>
  );
}

function ChatMessage(
  { item, emoteMap }: { item: ObservableObject<YouTubeChatMessage> } & {
    emoteMap: Map<string, string>;
  },
) {
  return <MemoizedMessage item={item.peek()} emoteMap={emoteMap} />;
}

const MemoizedMessage = React.memo(Message, (prev, next) => {
  return prev.item.id === next.item.id;
});

function Message({ item, emoteMap }: { item: YouTubeChatMessage; emoteMap: Map<string, string> }) {
  // const renderCount = ++useRef(0).current;

  return (
    <div className="message">
      <span className="author">
        {item.data?.author.badges.map((badge) => getBadge(badge.badge))}
        <span
          className="name"
          style={{
            color: getUsernameColor(item),
          }}
        >
          {getAuthorName(item)}
          {/* {renderCount} */}
          <span className="separator">
            :
          </span>
        </span>
      </span>
      <span
        className="message-text"
        dangerouslySetInnerHTML={{
          __html: formatMessage(item.data?.message, emoteMap),
        }}
      >
      </span>
    </div>
  );
}
