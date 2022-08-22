import Dialog from "../../base/dialog/dialog.tsx";
import DefaultDialogContentFragment from "../content-fragments/default/default-dialog-content-fragment.tsx";

export default function SingleRewardLevelUpDialog() {
  return (
    <Dialog>
      <DefaultDialogContentFragment
        primaryText="Ludbud flair unlocked!"
        secondaryText="Spice up your username with the Ludbud flair for 31 days"
      />
    </Dialog>
  );
}
