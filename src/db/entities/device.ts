import { Column, Entity, Index } from 'typeorm'
import { BasicEntity } from './base'

@Entity()
export class DeviceEntity extends BasicEntity {
  @Column()
  @Index({ unique: true })
  ip!: string
}
