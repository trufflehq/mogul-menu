import React from 'react'
import useObservables from 'https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js'

export default function PageStack ({ pageStackSubject, background = 'var(--truffle-color-bg-primary)' }) {

  const { pageStack } = useObservables(() => ({
    pageStack: pageStackSubject.obs
  }))

  const isPageStackEmpty = pageStack.length === 0

  return (
    <>
      { isPageStackEmpty
        ? <></>
        : <div className="c-page-stack" style={{ '--background': background }}>
            <div className="container">
              {pageStack.map((Component, idx) =>
                <div key={idx} className="page">{typeof Component === 'function' ? <Component /> : Component}</div>
              )}
            </div>
          </div>
      }
    </>
  )
}