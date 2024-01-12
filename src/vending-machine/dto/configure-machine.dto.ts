import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

export class ConfigureMachineDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    { each: true, message: 'Coins must be an array of numbers' },
  )
  coins: number[];
}
