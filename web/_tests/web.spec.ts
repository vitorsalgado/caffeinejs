import { Factory } from '@caffeinejs/application'
import Supertest from 'supertest'
import { WebAdapter } from '../WebAdapter.js'
import { Controller } from '../decorators/Controller.js'
import { Post } from '../decorators/Post.js'
import { Body } from '../decorators/Body.js'

describe('Web', function () {
  class App {}

  @Controller()
  class Ctrl {
    @Post('/message')
    test(@Body() body: any) {
      return { message: 'hello world - ' + body.message }
    }
  }

  it('should work', async function () {
    const factory = new Factory(App, new WebAdapter())
    const ctx = await factory.create()
    const srv = await ctx.listen(0)

    try {
      await Supertest(srv)
        .post('/message')
        .send({ message: 'hi' })
        .expect(200)
        .expect(res => expect(res.body).toEqual({ message: 'hello world - hi' }))
    } catch (e) {
      throw e
    } finally {
      await ctx.close()
    }
  })
})
