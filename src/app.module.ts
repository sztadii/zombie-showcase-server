import { Module } from '@nestjs/common'
import { ZombiesModule } from './zombies/zombies.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot(),
    ZombiesModule,
  ]
})
export class AppModule {}
