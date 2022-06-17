import { createContext, useContext } from 'react'

export const PageStackContext = createContext()

export function usePageStack () {
  return useContext(PageStackContext)
}