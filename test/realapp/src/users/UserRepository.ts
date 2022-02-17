import { MongoRepository } from 'typeorm'
import { EntityRepository } from 'typeorm'
import { User } from './User.js'

@EntityRepository(User)
export class UserRepository extends MongoRepository<User> {}
