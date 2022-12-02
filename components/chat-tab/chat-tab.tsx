import {
  getClient as _getClient,
  jumper,
  Memo,
  React,
  useStyleSheet,
  YoutubeChat,
} from "../../deps.ts";
import ChannelPoints from "../channel-points/channel-points.tsx";
import styleSheet from "./chat-tab.scss.js";

export default function ChatTab() {
  useStyleSheet(styleSheet);

  const onSend = (message: string) => {
    jumper.call("chat.sendMessage", { message, sourceType: "youtube" });
  };

  return (
    <Memo>
      <YoutubeChat
        onSend={onSend}
        hasChatInput
        inputControls={
          <ChannelPoints
            highlightButtonBg="var(--mm-gradient)"
            isStandalone={false}
            style="expanded"
          />
        }
      />
    </Memo>
  );
}
