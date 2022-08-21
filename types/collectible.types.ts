import { FileRel }  from './file.types.ts'

export type CollectibleType = 'emote' | 'redeemable' | 'ticket'
export type CollectibleTargetType = 'article'
export type CollectibleCategory = 'flair' | 'chatMessageHighlight' | 'chatUsernameGradient'
export type CollectibleRedeemType = 'powerup' | 'discordRole' | 'kingOfTheHill' | 'alertCustomMessage' | 'collectiblePack'

export interface CollectibleData {
  category: CollectibleCategory
  redeemType: CollectibleRedeemType
  redeemButtonText: string
  redeemData: Record<string, unknown>
  description: string
}

export interface Collectible {
  id: string
  orgId: string
  slug: string
  name: string
  fileRel: FileRel
  type: CollectibleType
  targetType: CollectibleTargetType
  data: CollectibleData
}