import React, { useEffect, useMemo } from 'react'

import { createSubject } from 'https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js'
import useObservables from 'https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js'

const DEFAULT_VISIBILITY_DURATION_MS = 5000

export default function SnackBarContainer ({ snackBarQueueSubject, visibilityDuration = DEFAULT_VISIBILITY_DURATION_MS }) {
  const { currentSnackBarSubject } = useMemo(() => ({
    currentSnackBarSubject: createSubject(undefined)
  }), [])

  const { snackBarQueue, currentSnackBar: $currentSnackBar } = useObservables(() => ({
    snackBarQueue: snackBarQueueSubject.obs,
    currentSnackBar: currentSnackBarSubject.obs
  }))

  const shouldRenderSnackBar = snackBarQueue.length > 0

  useEffect(() => {
    if (!shouldRenderSnackBar) {
      currentSnackBarSubject.next(undefined)
      return
    }

    // set the current snackbar to the one that's at the front of the queue
    currentSnackBarSubject.next(snackBarQueue[0])

    // after a specified duration, pop off the snackbar at the front of the queue;
    // this will trigger another execution of this function by useEffect
    setTimeout(() => snackBarQueueSubject.next(snackBarQueue.slice(1)), visibilityDuration)
  }, [snackBarQueue])

  return (
    <div className='z-snack-bar-container'>{ shouldRenderSnackBar && <$currentSnackBar /> }</div>
  )
}
