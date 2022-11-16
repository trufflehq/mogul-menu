import {
  Client,
  // ExtensionInfo,
  For,
  getClient as _getClient,
  gql,
  jumper,
  ObservableComputed,
  ObservableObject,
  PageIdentifier,
  React,
  signal,
  useComputed,
  useEffect,
  useObserve,
  useSelector,
  useSignal,
  useStyleSheet,
  useSubscription,
} from "../../deps.ts";

import { pipe, subscribe } from "https://npm.tfl.dev/wonka@4.0.15";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";

import { DEFAULT_CHAT_COLORS, getStringHash } from "./utils.ts";

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
}

interface NormalizedYoutubeChatMessage extends YouTubeChatMessage {
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
      truffleBadges: {
        src: string;
      }[];
    };
  };
}

interface TruffleYouTubeChatMessage extends YouTubeChatMessage {
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
      activePowerupConnection?: {
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
              props: {
                imageSrc: string;
              };
            }[];
          };
        }[];
      };
    };
  };
}

export function getUsernameColor(message: NormalizedYoutubeChatMessage) {
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

export function getAuthorName(message: NormalizedYoutubeChatMessage) {
  const orgUserName = message.connection?.orgUser?.user?.name;

  if (orgUserName) {
    return orgUserName;
  }

  return message.data?.author?.name;
}

const YOUTUBE_CHAT_MESSAGE_ADDED = gql<{ youtubeChatMessageAdded: TruffleYouTubeChatMessage }>
  `subscription YouTubeChatMessages($channelId: String) {
  youtubeChatMessageAdded(youtubeChannelId: $channelId)
  {
    id
    youtubeUserId
    data
    connection {
      id
      orgUser {
        name
        orgId
        userId
        keyValueConnection {
          nodes {
            key
            value
          }
        }
        user {
          name
        }
        activePowerupConnection {
          nodes {
            id
            orgId
            powerup {
              id
              slug
              componentRels {
                  props
              }
            }
          }
        }

      }
    }
  }
}`;

// FIXME: For whatever reason we run into network errors when we add this to the query. Might be related to the message size? Not super sure
// activePowerupConnection {
//   nodes {
//     id
//     orgId
//     powerup {
//       id
//       slug
//       componentRels {
//           props
//       }
//     }
//   }
// }

const URL_REGEX = /^(http|https):\/\/*/;
function getBadge(badge: string | "MODERATOR" | "OWNER") {
  const badgeSrc = badge === "MODERATOR"
    ? "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1"
    : badge === "OWNER"
    ? "https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1"
    : badge;

  return URL_REGEX.test(badgeSrc) ? <img className="badge" src={badgeSrc} /> : undefined;
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

  return msg;
}

function normalizeTruffleYoutubeChatMessage(
  message: TruffleYouTubeChatMessage,
): NormalizedYoutubeChatMessage {
  const truffleBadges = message.connection?.orgUser?.activePowerupConnection?.nodes
    ?.map((activePowerup) => activePowerup?.powerup?.componentRels?.[0]?.props?.imageSrc)
    .filter((src) => src !== undefined)
    .map((src) => ({ src })) ?? [];

  if (message?.connection?.orgUser?.activePowerupConnection) {
    delete message.connection.orgUser.activePowerupConnection;
  }

  const newMessage = {
    ...message,
    connection: {
      ...message?.connection,
      orgUser: {
        ...message?.connection?.orgUser,
        truffleBadges,
      },
    },
  } as NormalizedYoutubeChatMessage;

  return newMessage;
}

// const messages$ = observable<YouTubeChatMessage[]>([]);
const messages$ = signal<NormalizedYoutubeChatMessage[]>([]);

function useMessageAddedSubscription() {
  const extensionInfo$ = useSignal(jumper.call("context.getInfo"));

  const channelId$ = useComputed(() => {
    const extensionInfo = extensionInfo$.get();
    console.log("EXTENSION INFO", extensionInfo);

    // jumper.call("platform.log", `extensionInfo compute ${JSON.stringify(extensionInfo)}`);
    console.log("PAGE INFO", extensionInfo?.pageInfo);
    const channelId = extensionInfo?.pageInfo ? getChannelId(extensionInfo.pageInfo) : null;

    console.log("CHANNELID", channelId);
    // jumper.call("platform.log", `extensionInfo compute channelId ${channelId}`);

    // return "UCrPseYLGpNygVi34QpGNqpA"; // lud
    // return "UCXBE_QQSZueB8082ml5fslg"; // tim
    // return "UCZaVG6KWBuquVXt63G6xopg"; // riley
    // return "UCvQczq3aHiHRBGEx-BKdrcg"; // myth
    return channelId;
    // return channelId ?? "UCNF0LEQ2abMr0PAX3cfkAMg";
    // return "UCNF0LEQ2abMr0PAX3cfkAMg";
  });

  useObserve(() => {
    const channelId = channelId$.get();
    const { unsubscribe } = pipe(
      getClient().subscription(YOUTUBE_CHAT_MESSAGE_ADDED, { channelId }),
      subscribe((response) => {
        if (response.data?.youtubeChatMessageAdded) {
          messages$.set((prev) => {
            const normalizedChatMessage = normalizeTruffleYoutubeChatMessage(
              response.data?.youtubeChatMessageAdded!,
            );
            let newMessages = response.data?.youtubeChatMessageAdded
              ? [normalizedChatMessage, ...prev]
              : prev;
            if (newMessages.length > 75) {
              console.log("old newMessages", newMessages);

              newMessages = newMessages.slice(0, newMessages?.length - 50);

              console.log("sliced newMessages", newMessages);
            }
            return newMessages;
          });
        } else {
          console.error("ERRROR", response);
        }
      }),
    );
  });

  return { channelId$ };
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

  // tracks emoteMap
  const emoteMap = useSelector(() => emoteMap$.get());
  return { emoteMap };
}

export default function YoutubeChat() {
  // const renderCount = ++useRef(0).current;
  useStyleSheet(styleSheet);
  const { channelId$ } = useMessageAddedSubscription();

  const { emoteMap } = useEmoteMap$(channelId$);

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const isPinnedToBottom = scrollTop < 0;
    if (isPinnedToBottom) {
      console.log("not bottom");
    } else {
      console.log("pinned to bottom");
    }
  };

  useEffect(() => {
    const styles = {
      width: "100%",
      height: "100%",
      background: "transparent",
      "z-index": 2000,
      overflow: "hidden",
      "margin-top": "4px",
      transition: "clip-path .25s cubic-bezier(.4,.71,.18,.99)",
    };
    jumper.call("layout.applyLayoutConfigSteps", {
      layoutConfigSteps: [
        { action: "useSubject" }, // start with our iframe
        { action: "setStyle", value: styles },
      ],
    });
  }, []);

  return (
    <div className="c-youtube-chat" data-swipe-ignore>
      <ThemeComponent />
      <div className="messages">
        <div className="inner" onScroll={handleScroll}>
          {
            /* <For<NormalizedYoutubeChatMessage, { emoteMap: Map<string, string> }>
            itemProps={{ emoteMap }}
            each={messages$}
            item={ChatMessage}
            optimized
          /> */
          }
          <For
            itemProps={{ emoteMap }}
            each={messages$}
            item={ChatMessage}
            optimized
          />
        </div>
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

function getTruffleBadges(item: NormalizedYoutubeChatMessage) {
  const badgeSrcArr = item.connection?.orgUser?.truffleBadges.map((badge) => badge.src)
    .slice(0, 2) ?? [];

  if (!badgeSrcArr.length) {
    return;
  }

  return badgeSrcArr.map((badgeSrc) => getBadge(badgeSrc));
}

function Message(
  { item, emoteMap }: { item: NormalizedYoutubeChatMessage; emoteMap: Map<string, string> },
) {
  return (
    <div className="message">
      <span className="author">
        {item.data?.author.badges.map((badge) => getBadge(badge.badge))}
        {getTruffleBadges(item)}
        <span
          className="name"
          style={{
            color: getUsernameColor(item),
          }}
        >
          {getAuthorName(item)}
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
