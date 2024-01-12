import { ApiProperty } from '@nestjs/swagger';

export class Product {
  @ApiProperty({
    type: String,
    description: 'The name of the product',
  })
  name: string;

  @ApiProperty({
    type: Number,
    description: 'The price of the product',
  })
  price: number;

  @ApiProperty({
    type: Number,
    description: 'The quantity of the product',
  })
  quantity: number;
}
