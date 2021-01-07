import { IsString, IsNumber, IsOptional } from 'class-validator'

export class ZombieItemDTO {
  @IsOptional()
  @IsString()
  id: string

  @IsString()
  itemId: string

  @IsString()
  userId: string
}

export class ItemDTO {
  @IsOptional()
  @IsString()
  id: string

  @IsNumber()
  price: number

  @IsString()
  name: string
}

export class CurrencyRateDTO {
  @IsOptional()
  @IsString()
  id: string

  @IsString()
  currency: string

  @IsNumber()
  ask: number

  @IsNumber()
  bid: number

  @IsString()
  code: string
}

export type ExchangeRatesServiceResponse = Array<{
  rates: CurrencyRateDTO[]
}>
