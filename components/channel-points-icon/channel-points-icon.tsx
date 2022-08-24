import { React, ImageByAspectRatio } from "../../deps.ts";

export default function ChannelPointsIcon({ size = 20 }: { size?: number }) {
  const channelPointsSrc =
    "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  return (
    <ImageByAspectRatio
      imageUrl={channelPointsSrc}
      aspectRatio={1}
      width={size}
      height={size}
    />
  );
}
