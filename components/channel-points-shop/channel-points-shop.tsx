import React, { useContext, useMemo, useRef } from "https://npm.tfl.dev/react";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import {
  abbreviateNumber,
  formatNumber,
} from "https://tfl.dev/@truffle/utils@0.0.1/format/format.js";
import _ from "https://npm.tfl.dev/lodash?no-check";

import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@0.0.1/components/image-by-aspect-ratio/image-by-aspect-ratio.jsx";
import Spinner from "https://tfl.dev/@truffle/ui@0.0.1/components/spinner/spinner.jsx";
import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.jsx";
import classKebab from "https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js";
import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.jsx";
import { getModel } from "https://tfl.dev/@truffle/api@0.0.1/legacy/index.js";

// TODO pull from EconomyTrigger model once we set that up
const CP_PURCHASE_ECONOMY_TRIGGER_ID = "4246f070-6f68-11ec-b706-956d4fcf75c0";

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
  // const {
  //   channelPointsOrgUserCounterObs,
  //   channelPointsImageObj,
  //   onViewCollection,
  //   buttonBg,
  //   onHowToEarnClick,
  //   enqueueSnackBar,
  // } = props;
  // const { model } = useContext(context);

  // const { storeCollectibleItemsObs } = useMemo(() => {
  //   return {
  //     storeCollectibleItemsObs: model.product
  //       .getAll({
  //         sourceType: "collectible",
  //       })
  //       .pipe(
  //         Stream.op.map(({ nodes }) => {
  //           const sorted = ._.sortBy(nodes, (node) => {
  //             return node?.productVariants?.nodes?.[0]?.amountValue;
  //           });

  //           return sorted;
  //         })
  //       ),
  //   };
  // }, []);

  // const { channelPoints, storeCollectibleItems } = useObservables(() => ({
  //   channelPoints: channelPointsOrgUserCounterObs,
  //   storeCollectibleItems: storeCollectibleItemsObs,
  // }));

  const channelPointsImageObj = undefined;
  const channelPoints = { count: 1000 };
  const storeCollectibleItems: any[] = [
    {
      source: {
        name: "Cool thing",
        fileRel: { fileObj: testImg },
      },
      productVariants: {
        nodes: [
          {
            amountValue: 1000,
          },
        ],
      },
    },
  ];

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

  const onPurchaseRequestHandler = () => {
    // open confirmation dialog
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

// function ConfirmPurchaseDialog({
//   collectibleItem,
//   channelPointsImageObj,
//   onViewCollection,
//   buttonBg,
//   enqueueSnackBar,
// }) {
//   const { model, cssVars, overlay, browserComms } = useContext(context);

//   const { org } = useStream(() => ({
//     org: model.org.getMe(),
//   }));

//   const file = collectibleItem?.source?.fileRel;
//   const amount = collectibleItem.productVariants.nodes[0].amountValue;

//   // const channelPointsSrc =
//   //   model.image.getSrcByImageObj(channelPointsImageObj) ??
//   //   "https://cdn.bio/assets/images/features/chrome_extension/channel-points.svg";
//   const channelPointsSrc =
//     "https://cdn.bio/assets/images/features/chrome_extension/channel-points.svg";

//   const onPurchaseHandler = async () => {
//     // await model.economyTransaction.create({
//     //   economyTriggerSlug: "channel-points-store-purchase",
//     //   amountSourceId: collectibleItem.id,
//     // });

//     // browserComms.call("user.invalidateSporeUser", { orgId: org?.id });
//     // browserComms.call("comms.postMessage", MESSAGE.INVALIDATE_USER);

//     // // close confirmation dialog
//     // overlay.close();
//     // // open purchase notification dialog
//     // overlay.open(NotifyPurchaseDialog, {
//     //   onViewCollection,
//     //   collectibleItem,
//     //   buttonBg,
//     //   enqueueSnackBar,
//     // });
//   };

//   return (
//     <div className="confirm-purchase-dialog">
//       <Component
//         slug="dialog"
//         props={{
//           $content: (
//             <div className="body">
//               <div className="image">
//                 <Component
//                   slug="image-by-aspect-ratio"
//                   props={{
//                     imageUrl: model.image.getSrcByImageObj(file?.fileObj),
//                     aspectRatio: file?.fileObj?.data?.aspectRatio,
//                     heightPx: 56,
//                     widthPx: 56,
//                   }}
//                 />
//               </div>
//               <div className="info">
//                 <div className="name">
//                   {collectibleItem?.source?.name ?? ""}
//                 </div>
//                 <div className="cost">
//                   <div className="value">
//                     {Legacy.FormatService.number(amount)}
//                   </div>
//                   <Component
//                     slug="image-by-aspect-ratio"
//                     props={{
//                       imageUrl: channelPointsSrc,
//                       aspectRatio: 1,
//                       widthPx: 15,
//                       height: 15,
//                     }}
//                   />
//                 </div>
//                 {(collectibleItem?.source?.data?.description && (
//                   <div className="description">
//                     {collectibleItem?.source?.data?.description}
//                   </div>
//                 )) || (
//                   <div className="description">
//                     Add {collectibleItem?.source?.name ?? ""} to your collection
//                   </div>
//                 )}
//               </div>
//             </div>
//           ),
//           $actions: (
//             <div className="action">
//               <Component
//                 slug="button"
//                 props={{
//                   text: `Buy ${collectibleItem?.source?.name ?? ""}`,
//                   bg: buttonBg,
//                   isFullWidth: true,
//                   onclick: onPurchaseHandler,
//                 }}
//               />
//             </div>
//           ),
//           $topRightButton: (
//             <div className="close-button">
//               <Component
//                 slug="icon"
//                 props={{
//                   icon: "close",
//                   color: cssVars.$bgBaseText,
//                   onclick: () => overlay.close(),
//                 }}
//               />
//             </div>
//           ),
//         }}
//       />
//     </div>
//   );
// }

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
