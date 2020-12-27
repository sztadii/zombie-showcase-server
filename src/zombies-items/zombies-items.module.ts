import { Module } from '@nestjs/common'
import { ItemsService } from './services/items.service'
import { ZombiesItemsService } from './services/zombies-items.service'
import { ZombiesItemsController } from './zombies-items.controller'
import { ExternalController } from './external.controller'
import { CurrencyRatesService } from './services/currency-rates.service'

@Module({
  controllers: [ZombiesItemsController, ExternalController],
  providers: [ZombiesItemsService, ItemsService, CurrencyRatesService]
})
export class ZombiesItemsModule {}
