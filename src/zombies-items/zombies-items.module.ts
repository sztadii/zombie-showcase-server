import { Module } from '@nestjs/common'
import { ItemsService } from './items.service'
import { ZombiesItemsService } from './zombies-items.service'
import { ZombiesItemsController } from './zombies-items.controller'
import { CurrencyRatesService } from './currency-rates.service'

@Module({
  controllers: [ZombiesItemsController],
  providers: [ZombiesItemsService, ItemsService, CurrencyRatesService]
})
export class ZombiesItemsModule {}
