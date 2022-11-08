import {
  Client,
  Computed,
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

export default function ChatTab() {
  useStyleSheet(styleSheet);

  return (
    <Memo>
      <YoutubeChat />
    </Memo>
  );
}
