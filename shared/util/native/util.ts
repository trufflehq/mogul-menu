import { jumper, signal, useSelector, useSignal } from "../../../deps.ts";

const extensionInfo$ = signal(jumper.call("context.getInfo"));

export function isNative() {
  // return Boolean(window?.ReactNativeWebView);

  const isNative = useSelector(() => {
    const info = extensionInfo$.get();
    console.log('extensionInfo', info)

    return info?.platform === "native-ios" || info?.platform === "native-android";
  });


  console.log('isNative', isNative)
  return isNative;
}
