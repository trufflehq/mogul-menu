import { React, useEffect, useMemo, classKebab, useStyleSheet } from "../../../deps.ts";
import { getSnackBars, getTopSnackbar, useMenu, getMenuPosition, getPositionPrefix } from "../../../util/mod.ts";
import styleSheet from "./snack-bar-provider.scss.js";

const DEFAULT_VISIBILITY_DURATION_MS = 5000;

export default function SnackBarProvider({
  children,
  visibilityDuration = DEFAULT_VISIBILITY_DURATION_MS,
}: {
  children?: React.ReactNode;
  visibilityDuration?: number;
}) {
  useStyleSheet(styleSheet);
  const { store, popSnackBar } = useMenu();
  const menuPosition = getMenuPosition(store)
  const prefix = getPositionPrefix(menuPosition)
  const $currentSnackBar = getTopSnackbar(store);
  const snackBarQueue = useMemo(() => getSnackBars(store), [JSON.stringify(store.snackBars)])

  const shouldRenderSnackBar = snackBarQueue.length > 0;

  useEffect(() => {
    let cancel = false;

    if (snackBarQueue.length > 0) {
      setTimeout(() => {
        // If the queue has changed by the time we reach this,
        // we want to cancel removing anything from the queue
        // and let the new version of the effect do it instead.
        if (cancel) return;

        // remove item from the front of the queue
        // and schedule the next item to be removed
        popSnackBar();
      }, visibilityDuration);
    }

    return () => {
      cancel = true;
    };
  }, [snackBarQueue]);

  return (
    <>
      <div className={`c-snack-bar-container position-${prefix}`}>
        {shouldRenderSnackBar && $currentSnackBar}
      </div>
      {children}
    </>
  );
}
