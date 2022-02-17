import { Entity } from 'typeorm'
import { Column } from 'typeorm'
import { ObjectIdColumn } from 'typeorm'
import { ObjectID } from 'mongodb'

@Entity()
export class User {
  @ObjectIdColumn()
  id!: typeof ObjectID

  @Column()
  name!: string
}
