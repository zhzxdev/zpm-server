import { Column, Entity, getManager, PrimaryColumn } from 'typeorm'

type KVKey = 'db_ver'

@Entity()
export class KVEntity {
  @PrimaryColumn()
  key!: KVKey

  @Column('simple-json')
  value!: any
}

export async function getKV<T = any>(key: KVKey): Promise<T | null> {
  const kv = await getManager().findOne(KVEntity, key)
  return kv ? kv.value : null
}

export async function getKVOrFail<T = any>(key: KVKey): Promise<T> {
  const kv = await getManager().findOneOrFail(KVEntity, key)
  return kv.value
}

export async function setKV<T = any>(key: KVKey, value: T): Promise<void> {
  const manager = getManager()
  let kv = await manager.findOne(KVEntity, key)
  if (!kv) {
    kv = new KVEntity()
    kv.key = key
  }
  kv.value = value
  await manager.save(kv)
}

export async function removeKV(key: KVKey): Promise<boolean> {
  const manager = getManager()
  const kv = await manager.findOne(KVEntity, key)
  if (!kv) return false
  await manager.remove(kv)
  return true
}
