import { signal, useObserve, useSelector } from "../../deps.ts";

// TODO: move to utils package?
export default function useTimer({ timerMs$ }) {
  const timerMs = useSelector(() => timerMs$.get());

  useObserve(() => {
    const timerMs = timerMs$.get();
    const startTimeMs = Date.now();
    // time diff because setTimeout stops when browser tab isn't active
    const timeout = setTimeout(() => {
      const curVal = timerMs;
      const nowMs = Date.now();
      if (curVal > 0) {
        const timeDiffMs = nowMs - startTimeMs;
        let newVal = curVal - timeDiffMs;
        if (newVal < 0) {
          newVal = 0;
        }
        timerMs$.set(newVal);
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  });

  return timerMs;
}
