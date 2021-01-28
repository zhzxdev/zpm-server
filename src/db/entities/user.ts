import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm'
import { BasicEntity } from './base'
import { LogEntity } from './log'

@Entity()
export class UserEntity extends BasicEntity {
  @Column()
  @Index({ unique: true })
  login!: string

  @Column()
  disabled!: boolean

  // User level
  // 0 - common operator (student)
  // 1 - advanced operator (student)
  // 2 - teacher
  // 127 - developer
  @Column('tinyint')
  level!: number

  @Column({ select: false })
  hash?: string

  @Column({ select: false })
  salt?: string

  @OneToMany(() => UserTokenEntity, (e) => e.user)
  tokens?: UserTokenEntity[]

  @OneToMany(() => LogEntity, (e) => e.user)
  logs?: LogEntity[]
}

@Entity()
export class UserTokenEntity extends BasicEntity {
  @Column({ select: false })
  @Index({ unique: true })
  token?: string

  @ManyToOne(() => UserEntity, (e) => e.tokens, { onDelete: 'CASCADE' })
  user?: UserEntity
}
