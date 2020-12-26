import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ZombiesModule } from './zombies/zombies.module'
import { ScheduleModule } from '@nestjs/schedule'
import { ZombiesItemsModule } from './zombies-items/zombies-items.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    ZombiesModule,
    ZombiesItemsModule
  ]
})
export class AppModule {}
