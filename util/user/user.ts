import { MeUser } from '../../types/mod.ts'

export const isMemberMeUser = (user: MeUser) => user && (user.name || user.email || user.phone);
