import { JSX } from 'react'
import { createSubject } from 'https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js'

class SnackBarSerivce {

  private _queueSubject: ReturnType<typeof createSubject>

  constructor () {
    this._queueSubject = createSubject([])
  }

  get queueSubject () {
    return this._queueSubject
  }

  enqueueSnackBar (snackBar: () => JSX.Element) {
    const currentQueue = this._queueSubject.getValue()
    this._queueSubject.next(currentQueue.concat(snackBar))
  }
}

export const snackBarService = new SnackBarSerivce()

export function useSnackBar () {
  return snackBarService.enqueueSnackBar.bind(snackBarService)
}