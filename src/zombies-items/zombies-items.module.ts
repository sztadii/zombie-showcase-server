import { Module } from '@nestjs/common'
import { ItemsService } from './services/items.service'
import { ZombiesItemsService } from './services/zombies-items.service'
import { ZombiesItemsController } from './zombies-items.controller'
import { CurrencyRatesService } from './services/currency-rates.service'

@Module({
  controllers: [ZombiesItemsController],
  providers: [ZombiesItemsService, ItemsService, CurrencyRatesService]
})
export class ZombiesItemsModule {}
