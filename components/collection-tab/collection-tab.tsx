import React, { useEffect } from 'react'
import { useTabId } from "../../util/tabs/tab-id.ts";

export default function CollectionTab () {

  const tabId = useTabId()

  useEffect(() => {
    console.log('collection tab id', tabId)
  }, [tabId])

  return (
    <div className="c-collection-tab">
      
    </div>
  )
}