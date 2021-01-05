import { Module } from '@nestjs/common'
import { ZombiesController } from './zombies.controller'
import { ZombiesService } from './services/zombies.service'

@Module({
  controllers: [ZombiesController],
  providers: [ZombiesService],
  exports: [ZombiesService]
})
export class ZombiesModule {}
