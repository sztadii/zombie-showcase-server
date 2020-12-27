import { Get, Controller } from '@nestjs/common'

@Controller('/')
export class AppController {
  @Get()
  getWelcomeMessage() {
    return 'Welcome to zombie-showcase-server'
  }
}
