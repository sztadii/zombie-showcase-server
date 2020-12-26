import { Module } from '@nestjs/common'
import { ZombiesItemsService } from './zombies-items.service'
import { ZombiesItemsController } from './zombies-items.controller'

@Module({
  controllers: [ZombiesItemsController],
  providers: [ZombiesItemsService]
})
export class ZombiesItemsModule {}
