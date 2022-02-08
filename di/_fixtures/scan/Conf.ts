import { Bean } from '../../decorators/Bean.js'
import { Configuration } from '../../decorators/Configuration.js'
import { Ref2 } from './Ref2.js'

@Configuration()
export class Conf {
  @Bean(Ref2)
  ref2() {
    return new Ref2('created')
  }
}
