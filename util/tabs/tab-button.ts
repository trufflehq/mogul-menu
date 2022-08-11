import { createContext, createSubject, useContext, useMemo } from "../../deps.ts";

export const TabButtonContext = createContext();

export function useTabButtonManager() {
  const buttonMapSubject = useMemo(() => createSubject({}), []);

  const addButton = (key: string, Component: any) => {
    const buttonMap = buttonMapSubject.getValue();
    buttonMapSubject.next({
      ...buttonMap,
      [key]: Component,
    });
  };

  const removeButton = (key: string) => {
    const newButtonMap = { ...buttonMapSubject.getValue() };
    delete newButtonMap[key];
    buttonMapSubject.next(newButtonMap);
  };

  const clearButtons = () => {
    buttonMapSubject.next({});
  };

  return {
    addButton,
    removeButton,
    clearButtons,
    buttonMapSubject,
  };
}

export function useTabButton() {
  const { addButton, removeButton, clearButtons } = useContext(TabButtonContext);
  return { addButton, removeButton, clearButtons };
}
