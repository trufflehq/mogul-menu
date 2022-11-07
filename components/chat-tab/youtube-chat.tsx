import {
  For,
  getClient as _getClient,
  gql,
  jumper,
  ObservableArray,
  ObservableBaseFns,
  React,
  useComputed,
  useObservable,
  useObserve,
  useRef,
  useSelector,
  useSignal,
  useStyleSheet,
  useSubscription,
} from "../../deps.ts";
import { getUsernameColor } from "./utils.ts";

import styleSheet from "./youtube-chat.scss.js";

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

  console.log("msg", msg);
  return msg;
}

export default function YoutubeChat(
  { videoId$, channelId$ }: {
    videoId$: ObservableBaseFns<string | null | undefined>;
    channelId$: ObservableBaseFns<string | null | undefined>;
  },
) {
  useStyleSheet(styleSheet);
  const iframeRef = useRef<HTMLIFrameElement>(undefined!);
  // const messages$ = useObservable<YouTubeChatMessage[]>(new Set([]));
  const messages$ = useSignal<YouTubeChatMessage[]>(new Set([]));

  // const
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

  useSubscription({
    query: YOUTUBE_CHAT_MESSAGE_ADDED,
    variables: {
      videoId: videoId$.get(),
    },
  }, (state, response: { youtubeChatMessageAdded: YouTubeChatMessage }) => {
    if (response.youtubeChatMessageAdded) {
      messages$.set((prev) => {
        let newMessages = [response.youtubeChatMessageAdded, ...prev];
        if (newMessages.length > 250) {
          newMessages = newMessages.slice(-50);
        }
        return newMessages;
      });
    } else {
      console.error("ERRROR", response);
    }
  });

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
        <div className="inner" onScroll={handleScroll}>
          <For each={messages$}>
            {(message) => (
              <div className="message">
                <span className="author">
                  {message.data?.peek().author.badges.map((badge) => getBadge(badge.badge))}
                  <span
                    className="name"
                    style={{
                      color: getUsernameColor(message.data?.peek()?.author?.name),
                    }}
                  >
                    {message.data?.peek()?.author?.name}
                    <span className="separator">
                      :
                    </span>
                  </span>
                </span>
                {/* <span className="message-text">{message.data?.peek()?.message}</span> */}
                <span
                  className="message-text"
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(message.data?.peek()?.message, emoteMap$.peek()),
                  }}
                >
                  {/* {formatMessage(message.data?.peek()?.message, emoteMap$.peek())} */}
                </span>
              </div>
            )}
          </For>
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
