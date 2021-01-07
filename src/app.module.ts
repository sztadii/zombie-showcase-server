import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ZombiesModule } from './zombies/zombies.module'
import { AppController } from './app.controller'

@Module({
  imports: [ConfigModule.forRoot(), ZombiesModule],
  controllers: [AppController]
})
export class AppModule {}
