import React, { useContext } from "https://npm.tfl.dev/react";
import { setActiveTab } from "../../util/tabs/active-tab.ts";
import { useDialog } from "../dialog-container/dialog-service.ts";
import ItemDialog from "../item-dialog/item-dialog.tsx";

export default function UnlockedEmoteDialog({
  reward,
  $title,
  $children,
  headerText,
  highlightBg,
}) {
  const collectible = reward?.source ?? reward;

  const { popDialog } = useDialog();
  return (
    <div className="z-unlocked-emote-reward-dialog use-css-vars-creator">
      <ItemDialog
        displayMode="center"
        $children={$children}
        imgRel={collectible?.fileRel}
        $title={$title}
        highlightBg={highlightBg}
        headerText={headerText}
        primaryText={`${collectible?.name} emote unlocked!`}
        buttons={[
          {
            text: "Close",
            borderRadius: "4px",
            bg: "var(--tfl-color-surface-fill)",
            textColor: "var(--tfl-color-on-surface-fill)",
            onClick: popDialog,
          },
          {
            text: "View collection",
            borderRadius: "4px",
            bg: highlightBg ?? "var(--tfl-color-surface-fill)",
            textColor: "var(--tfl-color-on-surface-fill)",
            onClick: () => {
              popDialog();
              setActiveTab("collection");
            },
          },
        ]}
        onExit={popDialog}
      />
    </div>
  );
}
