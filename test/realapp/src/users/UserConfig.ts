import { getCustomRepository } from 'typeorm'
import { Configuration } from '@caffeinejs/di'
import { Bean } from '@caffeinejs/di'
import { UserRepository } from './UserRepository.js'

@Configuration()
export class UserConfig {
  @Bean(UserRepository)
  userRepository() {
    return getCustomRepository(UserRepository, 'test')
  }
}
