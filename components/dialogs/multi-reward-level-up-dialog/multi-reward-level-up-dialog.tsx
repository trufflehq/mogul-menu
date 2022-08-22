import { React } from "../../../deps.ts";
import Dialog from "../../base/dialog/dialog.tsx";
import DefaultDialogContentFragment from "../content-fragments/default/default-dialog-content-fragment.tsx";

export default function MultiRewardLevelUpDialog() {
  return (
    <Dialog>
      <DefaultDialogContentFragment primaryText="Level 2 rewards unlocked" />
    </Dialog>
  );
}
