import { BeforeInsert, Column, PrimaryGeneratedColumn } from 'typeorm'

export abstract class BasicEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column()
  readonly created!: number

  @BeforeInsert()
  private setCreated() {
    // @ts-expect-error
    this.created = Date.now()
  }
}
