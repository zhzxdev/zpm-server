import { Column, Entity } from 'typeorm'
import { BasicEntity } from './base'

@Entity()
export class DeviceEntity extends BasicEntity {
  @Column()
  ip!: string
}
