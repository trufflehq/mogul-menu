import React from "https://npm.tfl.dev/react";
import ChannelPointsShop from "../channel-points-shop/channel-points-shop.tsx";
import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.js";

export default function ChannelPointsShopTab(props) {
  // const channelPointsSrc = channelPointsImageObj
  //   ? getModel().image.getSrcByImageObj(channelPointsImageObj)
  //   : "https://cdn.bio/assets/images/features/browser_extension/channel-points.svg";
  const channelPointsSrc =
    "https://cdn.bio/assets/images/features/browser_extension/channel-points.svg";

  const onHowToEarnClick = () => {
    // overlay.open(() => (
    //   <ChannelPointsActionsDialog channelPointsSrc={channelPointsSrc} />
    // ));
  };

  return (
    <ScopedStylesheet
      url={new URL("channel-points-shop-tab.css", import.meta.url)}
    >
      <div className="c-channel-points-shop-tab">
        <ChannelPointsShop />
      </div>
    </ScopedStylesheet>
  );
}
