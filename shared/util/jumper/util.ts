import { globalContext, jumper } from "../../../deps.ts";
import { MESSAGES } from './messages.ts'
export function invalidateExtensionUser() {
  const context = globalContext.getStore();
  jumper.call("user.invalidateSporeUser", { orgId: context?.orgId });
  jumper.call("comms.postMessage", MESSAGES.INVALIDATE_USER);
}
