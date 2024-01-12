import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class CoinInventoryDto {
  @ApiProperty({
    description: 'The value of the coin',
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  coinValue: number;

  @ApiProperty({
    description: 'The quantity of the coin',
    type: Number,
  })
  @IsNumber()
  @Min(0)
  quantity: number;
}
