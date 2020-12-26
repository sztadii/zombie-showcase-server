import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ZombiesModule } from './zombies/zombies.module'
import { ZombiesItemsModule } from './zombies-items/zombies-items.module'

@Module({
  imports: [ConfigModule.forRoot(), ZombiesModule, ZombiesItemsModule]
})
export class AppModule {}
