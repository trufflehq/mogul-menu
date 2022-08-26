import { User } from './user.types.ts'
import { ActivePowerupConnection } from './active-powerup.types.ts'

export interface KOTHOrgUser {
  name?: string
  activePowerupConnection?: ActivePowerupConnection
  user?: User
}