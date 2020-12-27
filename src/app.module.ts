import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ZombiesModule } from './zombies/zombies.module'
import { ZombiesItemsModule } from './zombies-items/zombies-items.module'
import { AppController } from './app.controller'

@Module({
  imports: [ConfigModule.forRoot(), ZombiesModule, ZombiesItemsModule],
  controllers: [AppController]
})
export class AppModule {}
