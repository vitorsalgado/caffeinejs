import { Injectable } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

@Injectable()
class NestRep {}

@Injectable()
class NestSvc {
  constructor(readonly repo: NestRep) {}
}

@Injectable()
export class NestRoot {
  constructor(readonly svc: NestSvc) {}
}

@Module({
  providers: [NestRep, NestSvc, NestRoot]
})
export class App {}

export async function bootstrap() {
  return await NestFactory.createApplicationContext(App, { logger: false })
}
