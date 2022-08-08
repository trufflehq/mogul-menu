import {
  React,
  createContext,
  useContext,
  useEffect,
  createSubject,
  op,
  useObservables,
  useStyleSheet,
} from "../../../deps.ts";
import styleSheet from "./snack-bar-provider.scss.js";

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
  useStyleSheet(styleSheet);
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
    <>
      <div className="c-snack-bar-container">
        {shouldRenderSnackBar && <$currentSnackBar />}
      </div>
      {children}
    </>
  );
}
