import {
  getClient as _getClient,
  gql,
  jumper,
  ObservableBaseFns,
  React,
  useComputed,
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
  id: string;
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

function formatMessage(text: string, emoteMap: Map<string, string>) {
}

export default function YoutubeChat(
  { videoId$, channelId$ }: {
    videoId$: ObservableBaseFns<string | null | undefined>;
    channelId$: ObservableBaseFns<string | null | undefined>;
  },
) {
  useStyleSheet(styleSheet);
  const iframeRef = useRef<HTMLIFrameElement>(undefined!);
  const messages$ = useSignal<YouTubeChatMessage[]>([]);

  const emoteMap$ = useComputed(async () => {
    const channelId = channelId$.get();
    const emoteMap = new Map<string, string>();

    const baseEmotesUrl = `https://v2.truffle.vip/gateway/emotes`;
    // NOTE: this fetches a *huge* array of users and doing
    // any serialization / unserialization of that is going to be slow
    // and eat up CPU. storing in cache is slow, as is postMessaging it
    const url = channelId ? `${baseEmotesUrl}/c/${channelId}` : baseEmotesUrl;
    const res = await fetch(url);
    const emotes = await res.json();

    console.log("emotes", emotes);
    jumper.call("platform.log", `emotes: ${JSON.stringify(emotes)}`);
    for (const emote of emotes) {
      // const emoji = generateYoutubeEmoji(emote);
      const url = getEmoteUrl(emote);
      if (url) {
        emoteMap.set(emote.name, url);
      }
    }

    return emoteMap;
  });

  // console.log("emoteMap$", emoteMap$.get());

  useSubscription({
    query: YOUTUBE_CHAT_MESSAGE_ADDED,
    variables: {
      videoId: videoId$.get(),
    },
  }, (state, response: { youtubeChatMessageAdded: YouTubeChatMessage }) => {
    if (response.youtubeChatMessageAdded) {
      // const formattedMessage = formatMessage(
      //   response.youtubeChatMessageAdded.data.message,
      //   emoteMap$.get(),
      // );

      messages$.set((prev) => {
        let newMessages = [response.youtubeChatMessageAdded, ...prev];
        if (newMessages.length > 150) {
          newMessages = newMessages.slice(-50);
        }
        return newMessages;
      });
    } else {
      console.error("ERRROR", response);
    }
  });

  const messages = messages$.get();
  // console.log("messages", messages);

  const videoId = useSelector(() => videoId$.get());
  return (
    <div className="c-youtube-chat" data-swipe-ignore>
      <div className="messages">
        {messages.map((message) => (
          <div className="message">
            <span className="author">
              {message.data?.author.badges.map((badge) => getBadge(badge.badge))}
              <span
                className="name"
                style={{
                  color: getUsernameColor(message.data?.author?.name),
                }}
              >
                {message.data?.author?.name}
                <span className="separator">
                  :
                </span>
              </span>
            </span>
            <span className="message-text">{message.data?.message}</span>
          </div>
        ))}
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
