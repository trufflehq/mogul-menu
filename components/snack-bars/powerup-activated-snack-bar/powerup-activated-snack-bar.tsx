import {
  Avatar,
  getSrcByImageObj,
  ImageByAspectRatio,
  Obs,
  React,
  useObservables,
} from "../../../deps.ts";
import AccountAvatar from "../../account-avatar/account-avatar.tsx";
import SnackBar from "../../base/snack-bar/snack-bar.tsx";

export function PowerupActivatedSnackBar({ collectible }) {
  const powerupSrc = getSrcByImageObj(collectible?.fileRel?.fileObj);

  return (
    <SnackBar
      message={collectible?.name ? `${collectible?.name} activated!` : ""}
      style="flat"
      value={
        <>
          <AccountAvatar />
          <ImageByAspectRatio
            imageUrl={powerupSrc}
            aspectRatio={collectible?.fileRel?.fileObj?.data?.aspectRatio ?? 1}
            widthPx={24}
            height={24}
          />
        </>
      }
    />
  );
}