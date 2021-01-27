import { Column, Entity, getManager, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserEntity } from './user'

@Entity()
export class OperationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  type!: string

  @Column()
  details!: string

  @ManyToOne(() => UserEntity, (e) => e.operations, { onDelete: 'SET NULL' })
  user?: UserEntity
}

export async function fireOperation(type: string, details: string, user?: UserEntity): Promise<string> {
  const oper = new OperationEntity()
  oper.type = type
  oper.details = details
  if (user) {
    oper.user = user
  }
  await getManager().save(oper)
  return oper.id
}
