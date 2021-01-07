import { Module } from '@nestjs/common'
import { ZombiesController } from './controllers/zombies.controller'
import { ZombiesService } from './services/zombies.service'
import { ZombiesItemsService } from './services/zombies-items.service'
import { ZombiesItemsController } from './controllers/zombies-items.controller'
import { ExternalController } from './controllers/external.controller'
import { ItemsService } from './services/items.service'
import { CurrencyRatesService } from './services/currency-rates.service'

@Module({
  controllers: [ZombiesController, ZombiesItemsController, ExternalController],
  providers: [
    ZombiesService,
    ZombiesItemsService,
    ItemsService,
    CurrencyRatesService
  ]
})
export class ZombiesModule {}
