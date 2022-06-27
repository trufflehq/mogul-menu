import ChannelPointsShop from "../channel-points-shop/channel-points-shop.tsx";

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
    <>
      <ChannelPointsShop />
    </>
  );
}
