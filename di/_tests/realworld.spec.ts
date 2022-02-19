import { v4 } from 'uuid'
import { jest } from '@jest/globals'
import { expect } from '@jest/globals'
import { Named } from '../decorators/Named.js'
import { Configuration } from '../decorators/Configuration.js'
import { DI } from '../DI.js'
import { InjectAll } from '../decorators/InjectAll.js'
import { Provides } from '../decorators/Provides.js'
import { ScopedAs } from '../decorators/ScopedAs.js'
import { Bean } from '../decorators/Bean.js'
import { ConditionalOn } from '../decorators/ConditionalOn.js'
import { Primary } from '../decorators/Primary.js'
import { PreDestroy } from '../decorators/PreDestroy.js'
import { PostConstruct } from '../decorators/PostConstruct.js'
import { ValueProvider } from '../internal/ValueProvider.js'
import { Injectable } from '../decorators/Injectable.js'
import { Lifecycle } from '../Lifecycle.js'
import { Inject } from '../decorators/Inject.js'
import { Lookup } from '../decorators/Lookup.js'
import { lookup } from '../lookup.js'

describe('Real World', function () {
  const initSpy = jest.fn()
  const destroySpy = jest.fn()
  const sendSpy = jest.fn()
  const userSpy = jest.fn()

  const kEmail = Symbol('mail')
  const kSms = 'sms' //Symbol('sms')
  const kAm = Symbol('am')
  const kAf = Symbol('af')
  const kAs = Symbol('as')
  const kRegions = Symbol('regions')

  class GenericRepository<T> {
    constructor(protected readonly model: T) {}

    name() {
      return (this.model as any).name
    }
  }

  class User {}

  @Provides(new ValueProvider(new GenericRepository(Product)))
  class Product {}

  abstract class EventSender {
    abstract type: string

    abstract send(): void
  }

  @Injectable()
  class KafkaEventSender extends EventSender {
    type = 'kafka'

    send(): void {
      sendSpy()
    }
  }

  @Injectable()
  class RabbitMqEventSender extends EventSender {
    type = 'rabbitmq'

    send(): void {}
  }

  @Configuration()
  class Events {
    @Bean(EventSender)
    @ConditionalOn(() => process.env.NODE_ENV !== 'test')
    rabbitEventSender(): EventSender {
      return new RabbitMqEventSender()
    }

    @Bean(EventSender)
    @ConditionalOn(() => process.env.NODE_ENV === 'test')
    kafkaEventSender(): EventSender {
      return new KafkaEventSender()
    }
  }

  @Configuration()
  class RegionsConfig {
    @Bean(kAm)
    @Named(kRegions)
    am() {
      return 'am'
    }

    @Bean(kAf)
    @Named(kRegions)
    af() {
      return 'af'
    }

    @Bean(kAs)
    @Named(kRegions)
    as() {
      return 'as'
    }
  }

  interface NotificationService {
    notify(): string
  }

  @Injectable()
  @Named(kEmail)
  class EmailNotificationService implements NotificationService {
    notify(): string {
      return 'mail'
    }
  }

  @Injectable()
  @Named(kSms)
  class SmsNotificationService implements NotificationService {
    @InjectAll(kRegions)
    regions!: string[]
    message = 'sms'

    notify(): string {
      return this.message
    }

    @PostConstruct()
    init() {
      initSpy()
      this.message = this.message + ' - ' + this.regions.join(', ')
    }
  }

  abstract class UserRepository {
    abstract save(user: User): void
  }

  @Injectable()
  class UserMongoRepository extends UserRepository {
    constructor(private readonly eventSender: EventSender) {
      super()
    }

    save(user: User): void {
      this.eventSender.send()
      userSpy()
    }

    @PreDestroy()
    dispose(): Promise<void> {
      destroySpy()
      return Promise.resolve()
    }
  }

  class ViewEngine {
    render() {
      return 'rendered'
    }
  }

  @Injectable()
  class LegacyViewEngine extends ViewEngine {
    render(): string {
      return super.render() + ' - legacy'
    }
  }

  @Injectable()
  @Primary()
  class ActualViewEngine extends ViewEngine {
    render(): string {
      return super.render() + ' - actual'
    }
  }

  @Injectable()
  class UserService {
    constructor(
      private readonly userRepository: UserRepository,
      @Inject(kSms) private readonly notificationService: NotificationService
    ) {}

    save() {
      this.userRepository.save(new User())
    }

    send() {
      return this.notificationService.notify()
    }
  }

  @Injectable()
  class ProductService {
    constructor(@Inject(Product) private readonly repository: GenericRepository<Product>) {}

    name() {
      return this.repository.name()
    }
  }

  @ScopedAs(Lifecycle.TRANSIENT)
  @Injectable()
  class IdGenerator {
    readonly id: string = v4()

    newId() {
      return this.id
    }
  }

  @Injectable()
  class Controller {
    constructor(
      private readonly userService: UserService,
      private readonly productService: ProductService,
      private readonly viewEngine: ViewEngine
    ) {}

    saveUser() {
      this.userService.save()
    }

    sendMessage() {
      return this.userService.send()
    }

    productName() {
      return this.productService.name() + ' - ' + this.idGen.newId()
    }

    render() {
      return this.viewEngine.render()
    }

    @Lookup(IdGenerator)
    get idGen(): IdGenerator {
      return lookup()
    }
  }

  it('should ensure everything resolves and works properly', async function () {
    const di = DI.setup()
    const controller = di.get(Controller)

    di.bootstrap()

    expect(controller).toBeInstanceOf(Controller)
    expect(controller.idGen).not.toEqual(controller.idGen)
    expect(controller.render()).toEqual('rendered - actual')
    expect(controller.productName()).toContain(Product.name)
    expect(controller.productName()).not.toEqual(controller.productName())
    expect(() => controller.saveUser()).not.toThrow()
    expect(controller.sendMessage()).toContain('sms')
    expect(controller.sendMessage()).toContain('am')
    expect(controller.sendMessage()).toContain('as')
    expect(controller.sendMessage()).toContain('af')

    await di.dispose()

    expect(initSpy).toHaveBeenCalledTimes(1)
    expect(destroySpy).toHaveBeenCalledTimes(1)
    expect(sendSpy).toHaveBeenCalledTimes(1)
    expect(userSpy).toHaveBeenCalledTimes(1)
  })
})
