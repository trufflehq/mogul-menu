import React, {
  useContext,
  useMemo,
  useRef,
  useState,
} from "https://npm.tfl.dev/react";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import {
  abbreviateNumber,
  formatNumber,
} from "https://tfl.dev/@truffle/utils@0.0.1/format/format.js";
import _ from "https://npm.tfl.dev/lodash?no-check";

import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@0.0.1/components/image-by-aspect-ratio/image-by-aspect-ratio.js";
import Spinner from "https://tfl.dev/@truffle/ui@0.0.1/components/spinner/spinner.js";
import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.js";
import classKebab from "https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js";
import TruffleDialog from "https://tfl.dev/@truffle/ui@0.0.2/components/dialog/dialog.entry.js";
import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.js";
import { getModel } from "https://tfl.dev/@truffle/api@0.0.1/legacy/index.js";
import {
  useQuery,
  gql,
  useMutation,
} from "https://tfl.dev/@truffle/api@0.0.1/client.js";

// TODO pull from EconomyTrigger model once we set that up
const CP_PURCHASE_ECONOMY_TRIGGER_ID = "4246f070-6f68-11ec-b706-956d4fcf75c0";

const CHANNEL_POINTS_SHOP_QUERY = gql`
  query ChannelPointsShopQuery {
    productConnection(input: { sourceType: "collectible" }) {
      nodes {
        id
        source
        productVariants {
          nodes {
            amountType
            amountId
            amountValue
          }
        }
      }
    }
  }
`;

const CHANNEL_POINTS_QUERY = gql`
  query ChannelPointsQuery {
    channelPoints: orgUserCounterType(input: { slug: "channel-points" }) {
      orgUserCounter {
        count
      }
    }
  }
`;

const CHANNEL_POINTS_SHOP_PURCHASE_MUTATION = gql`
  mutation ChannelPointsShopPurchase($productId: String!) {
    economyTransactionCreate(
      input: {
        economyTriggerSlug: "channel-points-store-purchase"
        amountSourceId: $productId
      }
    ) {
      economyTransaction {
        id
      }
    }
  }
`;

const testImg = {
  cdn: "cdn.bio",
  data: {
    name: "3.0",
    aspectRatio: 1,
    width: 112,
    height: 112,
    length: 16420,
  },
  prefix: "collectible/73035c80-bae5-11ec-bc90-7b62339255c4",
  contentType: "image/png",
  type: "image",
  variations: [
    {
      postfix: ".tiny",
      width: 32,
      height: 32,
    },
    {
      postfix: ".small",
      width: 128,
      height: 128,
    },
    {
      postfix: ".large",
      width: 256,
      height: 256,
    },
  ],
  ext: "png",
};

const MESSAGE = {
  INVALIDATE_USER: "user.invalidate",
};

export default function ChannelPointsShop() {
  const channelPointsImageObj = undefined;

  // const {
  //   channelPointsOrgUserCounterObs,
  //   channelPointsImageObj,
  //   onViewCollection,
  //   buttonBg,
  //   onHowToEarnClick,
  //   enqueueSnackBar,
  // } = props;
  // const { model } = useContext(context);

  // shop items
  const [{ data: storeItemsData }] = useQuery({
    query: CHANNEL_POINTS_SHOP_QUERY,
  });
  const storeCollectibleItems = _.sortBy(
    storeItemsData?.productConnection?.nodes ?? [],
    (node) => {
      return node?.productVariants?.nodes?.[0]?.amountValue;
    }
  );

  // channel points
  const [{ data: channelPointsData }] = useQuery({
    query: CHANNEL_POINTS_QUERY,
  });
  const channelPoints = channelPointsData?.channelPoints?.orgUserCounter;

  const onViewCollection = () => null;
  const onHowToEarnClick = () => null;

  // const channelPointsSrc =
  //   model.image.getSrcByImageObj(channelPointsImageObj) ??
  //   "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  const channelPointsSrc =
    "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  const isLoading = !storeCollectibleItems;

  return (
    <ScopedStylesheet url={new URL("channel-points-shop.css", import.meta.url)}>
      <div className="c-channel-points-shop">
        <div className="header">
          <div className="title">Shop Items</div>
          <div className="channel-points">
            <div className="icon">
              <ImageByAspectRatio
                imageUrl={channelPointsSrc}
                aspectRatio={1}
                widthPx={16}
                height={16}
              />
            </div>
            <div className="amount">
              {abbreviateNumber(channelPoints?.count || 0, 1)}
            </div>
          </div>
        </div>
        {isLoading && <Spinner />}
        {!isLoading && (
          <>
            {!_.isEmpty(storeCollectibleItems) && (
              <div className="items">
                {_.map(storeCollectibleItems, (storeCollectibleItem: any) => {
                  return (
                    <CollectibleItem
                      channelPointsImageObj={channelPointsImageObj}
                      channelPoints={channelPoints}
                      collectibleItem={storeCollectibleItem}
                      onViewCollection={onViewCollection}
                    />
                  );
                })}
              </div>
            )}
            <div className="how-to-earn">
              <div className="title">Earn Channel points</div>
              <div className="description">
                Start earning channel points to spend in the shop
              </div>
              <div className="link">
                <Button
                  text={"How do I earn channel points?"}
                  size={"small"}
                  style={"link"}
                  onclick={onHowToEarnClick}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </ScopedStylesheet>
  );
}

function CollectibleItem(props) {
  const {
    channelPoints,
    collectibleItem,
    channelPointsImageObj,
    onViewCollection,
    buttonBg,
  } = props;
  const $$itemRef = useRef();

  const file = collectibleItem?.source?.fileRel;

  const amount = collectibleItem.productVariants.nodes[0].amountValue;

  const hasSufficientFunds = channelPoints?.count >= amount;
  // const channelPointsSrc =
  //   model.image.getSrcByImageObj(channelPointsImageObj) ??
  //   "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";

  const channelPointsSrc =
    "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";

  const [isConfirmDialogHidden, setConfirmDialogHiddenState] = useState(true);

  const onPurchaseRequestHandler = () => {
    // open confirmation dialog
    setConfirmDialogHiddenState(false);
    // overlay.open(ConfirmPurchaseDialog, {
    //   collectibleItem,
    //   channelPointsImageObj,
    //   onViewCollection,
    //   buttonBg,
    //   enqueueSnackBar,
    // });
  };

  return (
    <div
      className={`item ${classKebab({
        isDisabled: !hasSufficientFunds,
      })}`}
      ref={$$itemRef}
    >
      <div className="overlay" />
      <TruffleDialog hidden={isConfirmDialogHidden}>
        <ConfirmPurchaseDialog
          collectibleItem={collectibleItem}
          channelPointsImageObj={channelPointsImageObj}
          onViewCollection={() => setConfirmDialogHiddenState(true)}
          buttonBg="var(--truffle-gradient)"
        />
      </TruffleDialog>
      <div className="card">
        <div className="image">
          <ImageByAspectRatio
            imageUrl={getModel().image.getSrcByImageObj(file?.fileObj)}
            aspectRatio={file?.fileObj?.data?.aspectRatio}
            height={64}
            width={64}
          />
        </div>
        <div className="title">{collectibleItem?.source?.name ?? ""}</div>
        <div className="bottom" onClick={onPurchaseRequestHandler}>
          <div className="amount">{formatNumber(amount)}</div>
          <div className="icon">
            <ImageByAspectRatio
              imageUrl={channelPointsSrc}
              aspectRatio={1}
              width={18}
              height={18}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmPurchaseDialog({
  collectibleItem,
  channelPointsImageObj,
  onViewCollection,
  buttonBg,
  enqueueSnackBar,
}) {
  // const { org } = useStream(() => ({
  //   org: model.org.getMe(),
  // }));

  const file = collectibleItem?.source?.fileRel;
  const amount = collectibleItem.productVariants.nodes[0].amountValue;

  const [_purchaseResult, executePurchaseMutation] = useMutation(
    CHANNEL_POINTS_SHOP_PURCHASE_MUTATION
  );

  // const channelPointsSrc =
  //   model.image.getSrcByImageObj(channelPointsImageObj) ??
  //   "https://cdn.bio/assets/images/features/chrome_extension/channel-points.svg";
  const channelPointsSrc =
    "https://cdn.bio/assets/images/features/chrome_extension/channel-points.svg";

  const onPurchaseHandler = async () => {
    await executePurchaseMutation(
      { productId: collectibleItem.id },
      { additionalTypenames: ["OrgUserCounter", "OwnedCollectible"] }
    );
    alert(`You purchased a ${collectibleItem.source.name}!`);
    onViewCollection?.();
    // await model.economyTransaction.create({
    //   economyTriggerSlug: "channel-points-store-purchase",
    //   amountSourceId: collectibleItem.id,
    // });
    // browserComms.call("user.invalidateSporeUser", { orgId: org?.id });
    // browserComms.call("comms.postMessage", MESSAGE.INVALIDATE_USER);
    // // close confirmation dialog
    // overlay.close();
    // // open purchase notification dialog
    // overlay.open(NotifyPurchaseDialog, {
    //   onViewCollection,
    //   collectibleItem,
    //   buttonBg,
    //   enqueueSnackBar,
    // });
  };

  return (
    <div className="confirm-purchase-dialog">
      <div className="body">
        <div className="image">
          <ImageByAspectRatio
            imageUrl={getModel().image.getSrcByImageObj(file?.fileObj)}
            aspectRatio={file?.fileObj?.data?.aspectRatio}
            heightPx={56}
            widthPx={56}
          />
        </div>
        <div className="info">
          <div className="name">{collectibleItem?.source?.name ?? ""}</div>
          <div className="cost">
            <div className="value">{formatNumber(amount)}</div>
            <ImageByAspectRatio
              imageUrl={channelPointsSrc}
              aspectRatio={1}
              widthPx={15}
              height={15}
            />
          </div>
          {(collectibleItem?.source?.data?.description && (
            <div className="description">
              {collectibleItem?.source?.data?.description}
            </div>
          )) || (
            <div className="description">
              Add {collectibleItem?.source?.name ?? ""} to your collection
            </div>
          )}
        </div>
      </div>
      <div className="action">
        <Button
          text={`Buy ${collectibleItem?.source?.name ?? ""}`}
          bg={buttonBg}
          isFullWidth={true}
          onClick={onPurchaseHandler}
        />
      </div>
    </div>
  );
}

// function NotifyPurchaseDialog({
//   onViewCollection,
//   collectibleItem,
//   buttonBg,
//   enqueueSnackBar,
// }) {
//   const { overlay } = useContext(context);

//   const onViewCollectionHandler = () => {
//     overlay.close();
//     onViewCollection?.();
//   };

//   const file = collectibleItem?.source?.fileRel;
//   const actionMessage =
//     collectibleItem?.source?.data?.category === "flair"
//       ? "Redeem in Profile Tab"
//       : "View collection";
//   const isEmote = collectibleItem?.source?.type === "emote";
//   const isRedeemable = collectibleItem?.source?.type === "redeemable";

//   return (
//     <>
//       {isEmote ? (
//         <Component
//           slug="unlocked-emote-dialog"
//           props={{
//             reward: collectibleItem,
//             onViewCollection: onViewCollection,
//           }}
//         />
//       ) : isRedeemable ? (
//         <Component
//           slug="redeemable-dialog"
//           props={{
//             redeemableCollectible: collectibleItem,
//             onViewCollection: onViewCollection,
//             enqueueSnackBar,
//           }}
//         />
//       ) : (
//         <Component
//           slug="browser-extension-item-dialog"
//           props={{
//             imgRel: file,
//             onExit: () => overlay.close(),
//             primaryText: (
//               <div>
//                 <strong>{collectibleItem?.source?.name ?? ""}</strong> added to
//                 your collection!
//               </div>
//             ),
//             buttons: [
//               {
//                 text: actionMessage,
//                 bg: buttonBg,
//                 onClick: onViewCollectionHandler,
//               },
//             ],
//           }}
//         />
//       )}
//     </>
//   );
// }
