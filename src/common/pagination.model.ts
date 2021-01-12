import { IsString, IsNumber, IsOptional } from 'class-validator'

export class PaginationDTO {
  @IsOptional()
  @IsNumber()
  limit?: number

  @IsOptional()
  @IsNumber()
  skip?: number

  @IsOptional()
  @IsString()
  orderBy?: string
}
