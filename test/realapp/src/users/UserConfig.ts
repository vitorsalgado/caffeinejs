import { Configuration } from '@caffeinejs/di/decorators'
import { Bean } from '@caffeinejs/di/decorators'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from './UserRepository.js'

@Configuration()
export class UserConfig {
  @Bean(UserRepository)
  userRepository() {
    return getCustomRepository(UserRepository, 'test')
  }
}
