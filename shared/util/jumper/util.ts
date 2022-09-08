import { globalContext, jumper, GLOBAL_JUMPER_MESSAGES } from "../../../deps.ts";

export function invalidateExtensionUser() {
  const context = globalContext.getStore();
  jumper.call("user.invalidateSporeUser", { orgId: context?.orgId });
  jumper.call("comms.postMessage", GLOBAL_JUMPER_MESSAGES.INVALIDATE_USER);
}
