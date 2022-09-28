import { JSX } from "https://npm.tfl.dev/react";
import { createSubject } from "https://tfl.dev/@truffle/utils@~0.0.17/obs/subject.ts";

interface DialogStackItem {
  element: JSX.Element;
  isModel: boolean;
}

type DialogStackItemParam = DialogStackItem | JSX.Element;

class DialogService {
  dialogStackSubject: ReturnType<typeof createSubject>;

  constructor() {
    this.dialogStackSubject = createSubject([]);
  }

  public pushDialog(nextDialog: DialogStackItemParam) {
    const currentStack = this.dialogStackSubject.getValue();
    if (nextDialog?.element) {
      this.dialogStackSubject.next(
        currentStack.concat({ element: nextDialog.element, isModal: nextDialog.isModal ?? false }),
      );
    } else {
      this.dialogStackSubject.next(currentStack.concat({ element: nextDialog, isModal: false }));
    }
  }

  public popDialog() {
    const currentStack = this.dialogStackSubject.getValue();
    this.dialogStackSubject.next(currentStack.slice(0, -1));
  }
}

export const dialogService = new DialogService();

export function useDialog() {
  return {
    pushDialog: dialogService.pushDialog.bind(dialogService),
    popDialog: dialogService.popDialog.bind(dialogService),
  };
}
