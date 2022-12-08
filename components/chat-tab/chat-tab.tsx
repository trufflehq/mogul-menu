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
import {
  ActivityBannerEmbed,
  AlertBanner,
  PollBanner,
} from "../../components/activities/mod.ts";
export default function ChatTab() {
  useStyleSheet(styleSheet);

  const onSend = (message: string) => {
    jumper.call("chat.sendMessage", { message, sourceType: "youtube" });
  };

  const banners = {
    poll: PollBanner,
    alert: AlertBanner,
  };

  return (
    <Memo>
      <YoutubeChat
        visibleBanners={[
          <ActivityBannerEmbed banners={banners} isStandalone={false} />
        ]}
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
