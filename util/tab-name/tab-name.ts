import { useContext, createContext } from 'react'

export const TabNameContext = createContext({
  tabNames: [] as number[],
  setTabNames: (() => undefined) as ((names: string[]) => void)
})

export function useTabName (tabIdx: number) {
  const {tabNames, setTabNames} = useContext(TabNameContext)
  
  const setTabName = (tabName: string) => {
    const newTabNames = Array.from(tabNames)
    newTabNames[tabIdx] = tabName
    setTabNames(newTabNames)
  }

  return [tabNames[tabIdx], setTabName]
}