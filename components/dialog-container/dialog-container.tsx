import React from "https://npm.tfl.dev/react";
import { dialogService } from "./dialog-service.ts";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import ScopedStylesheet from "../base/stylesheet/stylesheet.tsx";

export default function DialogContainer() {
  const { dialogStack } = useObservables(() => ({
    dialogStack: dialogService.dialogStackSubject.obs,
  }));

  const topDialog =
    dialogStack.length > 0 ? dialogStack[dialogStack.length - 1] : null;

  if (topDialog === null) return <></>;

  const handleBgClick = (e: Event) => {
    if (!topDialog?.isModal && e.target === e.currentTarget) {
      dialogService.popDialog();
    }
  };

  return (
    <ScopedStylesheet url={new URL("dialog-container.css", import.meta.url)}>
      <div className="c-dialog-container" onClick={handleBgClick}>
        {topDialog.element}
      </div>
    </ScopedStylesheet>
  );
}
