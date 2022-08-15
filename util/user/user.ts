import { MeUser } from "../../types/mod.ts";

export const isMemberMeUser = (user: MeUser) => user && (user.email || user.phone);
