import { React, useStyleSheet } from "../../../deps.ts";
import Button from "../../base/button/button.tsx";
import { useDialog } from "../../base/dialog-container/dialog-service.ts";
import Dialog from "../../base/dialog/dialog.tsx";
import Reward from "../../season-pass-reward/season-pass-reward.tsx";
import DefaultDialogContentFragment from "../content-fragments/default/default-dialog-content-fragment.tsx";

import styleSheet from "./single-reward-level-up-dialog.scss.js";

export default function SingleRewardLevelUpDialog({
  reward,
  levelNum,
  onClose,
}: {
  reward: any;
  levelNum: number;
  onClose?: () => void;
}) {
  useStyleSheet(styleSheet);

  const { popDialog } = useDialog();
  const closeHandler = onClose ?? popDialog;

  return (
    <div className="c-single-reward-level-up-dialog">
      <Dialog
        actions={[
          <Button onClick={closeHandler} style="bg-tertiary">
            Close
          </Button>,
          <Button style="gradient">Activate</Button>,
        ]}
        onClose={closeHandler}
      >
        <div className="level-unlock-text mm-text-header-caps">
          Level {levelNum} unlocked
        </div>
        <div className="reward-container">
          <Reward isUnlocked reward={reward} />
        </div>
        <DefaultDialogContentFragment
          primaryText={<>{reward?.source?.name} unlocked!</>}
          secondaryText={reward?.description}
        />
      </Dialog>
    </div>
  );
}
