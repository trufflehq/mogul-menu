import React, {
  createContext,
  useContext,
  useEffect,
} from "https://npm.tfl.dev/react";
import root from "https://npm.tfl.dev/react-shadow@19";

import {
  createSubject,
  op,
} from "https://tfl.dev/@truffle/utils@~0.0.2/obs/subject.ts";
import useObservables from "https://tfl.dev/@truffle/utils@~0.0.2/obs/use-observables-react.ts";
import Stylesheet from "../stylesheet/stylesheet.tsx";

class SnackBarSerivce {
  _queueSubject;

  constructor() {
    this._queueSubject = createSubject([]);
  }

  get queueSubject() {
    return this._queueSubject;
  }

  enqueueSnackBar(snackBar) {
    const currentQueue = this._queueSubject.getValue();
    this._queueSubject.next(currentQueue.concat(snackBar));
  }
}

export const snackBarContext = createContext(new SnackBarSerivce());

const DEFAULT_VISIBILITY_DURATION_MS = 5000;

export default function SnackBarProvider({
  children,
  visibilityDuration = DEFAULT_VISIBILITY_DURATION_MS,
}) {
  const snackBarService = useContext(snackBarContext);
  const snackBarQueueSubject = snackBarService.queueSubject;

  const { snackBarQueue, currentSnackBar: $currentSnackBar } = useObservables(
    () => ({
      snackBarQueue: snackBarQueueSubject.obs,
      currentSnackBar: snackBarQueueSubject.obs.pipe(
        op.map((queue) => queue?.[0])
      ),
    })
  );

  const shouldRenderSnackBar = snackBarQueue.length > 0;

  useEffect(() => {
    let cancel = false;
    console.log("snackbarQueue", snackBarQueue);

    if (snackBarQueue.length > 0) {
      setTimeout(() => {
        // If the queue has changed by the time we reach this,
        // we want to cancel removing anything from the queue
        // and let the new version of the effect do it instead.
        if (cancel) return;

        // remove item from the front of the queue
        // and schedule the next item to be removed
        snackBarQueueSubject.next(snackBarQueue.slice(1));
      }, visibilityDuration);
    }

    return () => {
      cancel = true;
    };
  }, [snackBarQueue]);

  return (
    <Stylesheet url={new URL("snack-bar-provider.css", import.meta.url)}>
      <div className="c-snack-bar-container">
        {shouldRenderSnackBar && <$currentSnackBar />}
      </div>
      {children}
    </Stylesheet>
  );
}
