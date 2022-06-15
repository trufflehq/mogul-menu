import React, { useState } from 'react'
import { useSnackBar } from 'https://tfl.dev/@truffle/ui@0.0.1/util/snack-bar.js'

import Button from 'https://tfl.dev/@truffle/ui@0.0.1/components/button/button.jsx'
import SnackBar from 'https://tfl.dev/@truffle/ui@0.0.1/components/snack-bar/snack-bar.jsx'

import { useTabName } from '../../util/tab-name/tab-name.ts'

export default function HomeTab ({ tabIdx }) {

  const enqueueSnackBar = useSnackBar()
  const [count, setCount] = useState(0)
  const [isSelected, setSelected] = useState(false)

  const [tabName, setTabName] = useTabName(tabIdx)

  const snackBarHandler = () => {
    console.log('enqueueing snackbar')
    enqueueSnackBar(() => <SnackBar message={`Congrats! You won. ${count}`} messageBgColor="lightblue" />)
    setCount(prev => prev + 1)
    setSelected(prev => !prev)
  }

  const tabNameHandler = () => {
    setTabName(`Home (${count})`)
    setCount(prev => prev + 1)
  }

  return (
    <div className="z-home-tab">
      <div className="truffle-text-header-1">Tab idx: {tabIdx}</div>
      <div className="truffle-text-header-1">Tab name: {tabName}</div>
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