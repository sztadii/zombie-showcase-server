import { Module } from '@nestjs/common'
import { ZombiesController } from './zombies.controller'
import { ZombiesService } from './services/zombies.service'
import { ZombiesItemsService } from '../zombies-items/services/zombies-items.service'

@Module({
  controllers: [ZombiesController],
  providers: [ZombiesService, ZombiesItemsService],
  exports: [ZombiesService],
  imports: [ZombiesItemsService]
})
export class ZombiesModule {}
