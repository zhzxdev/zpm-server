import { BaseEntity, Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm'

@Entity()
export class UserEntity extends BaseEntity {
  @Column({ select: false })
  hash!: string

  @Column({ select: false })
  salt!: string

  @OneToMany(() => UserTokenEntity, (e) => e.user)
  tokens?: UserTokenEntity[]
}

@Entity()
export class UserTokenEntity extends BaseEntity {
  @Column({ select: false })
  @Index({ unique: true })
  token!: string

  @ManyToOne(() => UserEntity, (e) => e.tokens)
  user?: UserEntity
}
