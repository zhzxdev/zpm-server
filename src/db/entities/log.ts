import { Column, Entity, getManager, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserEntity } from './user'

@Entity()
export class LogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  type!: string

  @Column()
  details!: string

  @Column()
  result!: string

  @Column()
  @Index()
  ts!: number

  @ManyToOne(() => UserEntity, (e) => e.logs, { onDelete: 'SET NULL' })
  user?: UserEntity
}

export async function fireLog(type: string, details: string, result: string, user?: UserEntity): Promise<string> {
  const log = new LogEntity()
  log.type = type
  log.details = details
  log.result = result
  log.ts = Date.now()
  if (user) {
    log.user = user
  }
  await getManager().save(log)
  return log.id
}
