import HomeTab from "../../components/home-tab/home-tab.tsx";
import TestTab from "../../components/test-tab/test-tab.tsx";
import CollectionTab from "../../components/collection-tab/collection-tab.tsx";
import SeasonPassTab from "../../components/season-pass-tab/season-pass-tab.tsx";
import ChannelPointsShopTab from "../../components/channel-points-shop-tab/channel-points-shop-tab.tsx";

export const DEFAULT_TABS = [
  // {
  //   text: "Test",
  //   slug: "test",
  //   imgUrl: "",
  //   $el: TestTab,
  // },
  {
    text: "Home",
    slug: "home",
    imgUrl: "https://cdn.bio/assets/images/features/browser_extension/home.svg",
    $el: HomeTab,
  },
  {
    text: "Collection",
    slug: "collection",
    imgUrl: "https://cdn.bio/assets/images/features/browser_extension/collection.svg",
    $el: CollectionTab,
  },
  {
    text: "Battle Pass",
    slug: "battle-pass",
    imgUrl: "https://cdn.bio/assets/images/features/browser_extension/gamepad.svg",
    $el: SeasonPassTab,
  },
  {
    text: "Shop",
    slug: "shop",
    imgUrl: "https://cdn.bio/assets/images/features/browser_extension/store.svg",
    $el: ChannelPointsShopTab,
  },
];
