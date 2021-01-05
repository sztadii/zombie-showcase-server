import { Module } from '@nestjs/common'
import { ItemsService } from './services/items.service'
import { ZombiesItemsService } from './services/zombies-items.service'
import { ZombiesItemsController } from './zombies-items.controller'
import { ExternalController } from './external.controller'
import { CurrencyRatesService } from './services/currency-rates.service'
import { ZombiesService } from '../zombies/services/zombies.service'

@Module({
  controllers: [ZombiesItemsController, ExternalController],
  providers: [
    ZombiesItemsService,
    ItemsService,
    CurrencyRatesService,
    ZombiesService
  ],
  imports: [ZombiesService]
})
export class ZombiesItemsModule {}
