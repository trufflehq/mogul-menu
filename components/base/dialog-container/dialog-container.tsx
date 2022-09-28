import { React, useEffect, useStyleSheet } from "../../../deps.ts";
import { dialogService } from "./dialog-service.ts";
import useObservables from "https://tfl.dev/@truffle/utils@~0.0.17/obs/use-observables-react.ts";
import styleSheet from "./dialog-container.scss.js";

export default function DialogContainer() {
  useStyleSheet(styleSheet);
  const { dialogStack } = useObservables(() => ({
    dialogStack: dialogService.dialogStackSubject.obs,
  }));

  const topDialog = dialogStack.length > 0 ? dialogStack[dialogStack.length - 1] : null;

  const handleEscape = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      dialogService.popDialog();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscape, false);

    return () => {
      document.removeEventListener("keydown", handleEscape, false);
    };
  }, []);

  if (topDialog === null) return <></>;

  const handleBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!topDialog?.isModal && e.target === e.currentTarget) {
      dialogService.popDialog();
    }
  };

  return (
    <div className="c-dialog-container" onClick={handleBgClick}>
      {topDialog.element}
    </div>
  );
}
