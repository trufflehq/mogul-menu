import React, { useState } from 'react'
import { useSnackBar } from 'https://tfl.dev/@truffle/ui@0.0.1/util/snack-bar.js'

import Button from 'https://tfl.dev/@truffle/ui@0.0.1/components/button/button.jsx'
import SnackBar from 'https://tfl.dev/@truffle/ui@0.0.1/components/snack-bar/snack-bar.jsx'

export default function HomeTab () {

  const enqueueSnackBar = useSnackBar()
  const [count, setCount] = useState(0)

  const clickHandler = () => {
    console.log('enqueueing snackbar')
    enqueueSnackBar(() => <SnackBar message={`Congrats! You won. ${count}`} messageBgColor="lightblue" />)
    setCount(prev => prev + 1)
  }

  return (
    <div className="z-home-tab">
      <Button onclick={clickHandler} text="click me" />
    </div>
  )
}