import { _, React, createContext, createSubject, useState, useContext, useMemo } from "../../deps.ts";

interface TabButtonContext {
  addButton: (key: string, Component: React.ReactNode) => void
  removeButton: (key: string) => void
  clearButtons: () => void
  buttonMap: Record<string, React.ReactNode>
}

export const TabButtonContext = createContext<TabButtonContext>(undefined!);

export function useTabButtonManager() {
  const { addButton, removeButton, clearButtons, buttonMap } = useContext(TabButtonContext);

  return {
    addButton,
    removeButton,
    clearButtons,
    buttonMap
  };
}

export function TabButtonProvider({ children }: { children: React.ReactNode}) {
  const [buttonMap, setButtonMap] = useState<Record<string, React.ReactNode>>({})

  const addButton = (key: string, Component: React.ReactNode) => {
    setButtonMap((oldButtonMap) => ({
      ...oldButtonMap,
      [key]: Component,
    }))
  };

  const removeButton = (key: string) => {
    setButtonMap((oldButtonMap) => {
      const newButtonMap = { ...oldButtonMap };
      delete newButtonMap[key];

      return newButtonMap
    })
  };

  const clearButtons = () => {
    setButtonMap({})
  };

  return <TabButtonContext.Provider
      value={{
        addButton,
        removeButton,
        clearButtons,
        buttonMap
      }}
    >
    {
      children
    }
  </TabButtonContext.Provider>
}