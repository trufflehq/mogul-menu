import React, { useContext } from 'react'
import {
  context,
  Component
} from '@spore/platform'

export default function Page ({ title, headerTopRight, onBack, content }) {
  const { cssVars } = useContext(context)

  return <div className="c-page">
      <div className='header'>
        <div className='left'>
          <div className='back-icon'>
            <Component slug="icon"
              props={{
                icon: 'back',
                color: cssVars.$bgBaseText,
                onclick: onBack
              }}
            />
          </div>
          <div className='text'>{ title }</div>
        </div>
        { headerTopRight && <div className='right'>
          { headerTopRight }
        </div> }
      </div>
      <div className="content">
        { content }
      </div>
    </div>
}
