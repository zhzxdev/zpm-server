import { DeviceEntity } from './device'
export * from './device'
import { KVEntity } from './kv'
export * from './kv'
import { UserEntity, UserTokenEntity } from './user'
export * from './user'

export const entities = [KVEntity, DeviceEntity, UserEntity, UserTokenEntity]
