import React from 'react'
import useObservables from 'https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js'

export default function ActionBannerContainer ({ actionBannerObjSubject }) {

  const { actionBannerObj } = useObservables(() => ({
    actionBannerObj: actionBannerObjSubject.obs
  }))

  return (
    <div className="c-action-banner-container">
      {Object.entries(actionBannerObj).map(([id, Component]) =>
        <div key={id} className="action-banner-container">{typeof Component === 'function' ? <Component /> : Component}</div>
      )}
    </div>
  )
}