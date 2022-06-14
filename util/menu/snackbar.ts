import { JSX } from 'react'
import { createSubject } from 'https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js'
import globalContext from 'https://tfl.dev/@truffle/global-context@1.0.0/index.js'

class SnackBarService {

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

export function getSnackbarService () {
  const context = globalContext.getStore()
  // TODO: we need to somehow namespace this properly, so other libs don't override our global context
  if (!context.snackBarService) {
    context.snackBarService = new SnackBarService()
  }
  return context.snackBarService
}

export function useSnackBar () {
  const snackbarService = getSnackbarService()
  return snackbarService.enqueueSnackBar.bind(snackbarService)
}