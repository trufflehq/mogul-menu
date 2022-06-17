import { useMemo } from 'react'
import { createSubject } from 'https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js'

export function usePageStackManager () {

  const pageStackSubject = useMemo(() => createSubject([]), [])

  // pushes a component onto the page stack;
  // used for creating pages that take over
  // the whole extension UI (like the
  // prediction page, for example)
  const pushPage = (Component) => {
    const currentPageStack = pageStackSubject.getValue()
    pageStackSubject.next(currentPageStack.concat(Component))
  }

  const popPage = () => {
    const currentPageStack = pageStackSubject.getValue()
    pageStackSubject.next(currentPageStack.slice(0, -1))
  }

  const clearPageStack = () => {
    pageStackSubject.next([])
  }

  return {
    pushPage,
    popPage,
    clearPageStack,
    pageStackSubject
  }

}