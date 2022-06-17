import React, { useState } from 'react'
import { useSnackBar } from 'https://tfl.dev/@truffle/ui@0.0.1/util/snack-bar.js'

import Button from 'https://tfl.dev/@truffle/ui@0.0.1/components/button/button.jsx'
import SnackBar from 'https://tfl.dev/@truffle/ui@0.0.1/components/snack-bar/snack-bar.jsx'

import { useTabState } from '../../util/tabs/tab-state.ts'

export default function HomeTab ({ tabId }) {

  const enqueueSnackBar = useSnackBar()
  const [count, setCount] = useState(0)
  const [isSelected, setSelected] = useState(false)

  const tabState = useTabState(tabId)

  const snackBarHandler = () => {
    console.log('enqueueing snackbar')
    enqueueSnackBar(() => <SnackBar message={`Congrats! You won. ${count}`} messageBgColor="lightblue" />)
    setCount(prev => prev + 1)
    setSelected(prev => !prev)
  }

  const tabNameHandler = () => {
    tabState.setTabText(`Home (${count})`)
    tabState.setTabBadge(isSelected)
    setCount(prev => prev + 1)
    setSelected(prev => !prev)
  }

  return (
    <div className="z-home-tab">
      <div className="truffle-text-header-1">Tab id: {tabId}</div>
      <div className="truffle-text-header-1">Tab name: {tabState.text}</div>
      <div className="truffle-text-header-1">Tab isActive: {String(tabState.isActive)}</div>
      <div>
        <Button
          onClick={snackBarHandler}
          isSelected={isSelected}
          text="Enqueue snackbar"
          transformHover="scale(103%)"
          backgroundSelected="var(--truffle-gradient)"
          transformSelected="scale(103%)"
          icon="https://cdn.bio/assets/images/features/browser_extension/gamepad.svg"
        />
        <Button
          onClick={tabNameHandler}
          text="Set tab name"
        />
      </div>
    </div>
  )
}