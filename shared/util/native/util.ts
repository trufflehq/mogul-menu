import { jumper, signal, useSelector } from "../../../deps.ts";

const extensionInfo$ = signal(jumper.call("context.getInfo"));

export function isNative() {
  const isNative = useSelector(() => {
    const info = extensionInfo$.get();

    return info?.platform === "native-ios" || info?.platform === "native-android";
  });

  return isNative;
}
