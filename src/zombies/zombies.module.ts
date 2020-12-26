import { Module } from '@nestjs/common'
import { ZombiesController } from './zombies.controller'
import { ZombiesService } from './services/zombies.service'

@Module({
  controllers: [ZombiesController],
  providers: [ZombiesService]
})
export class ZombiesModule {}
