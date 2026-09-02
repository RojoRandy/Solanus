import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class IdParamDto {
  @ApiProperty({
    name: 'id',
    example: 1,
  })
  @IsNumberString()
  id: number;
}

export class EmisorParamDto {
  @ApiProperty({
    name: 'emisorId',
    example: 1,
  })
  @IsNumberString()
  emisorId: number;
}

export class EmisorRelationParamDto {
  @ApiProperty({
    name: 'emisorId',
    example: 1,
  })
  @IsNumberString()
  emisorId: number;

  @ApiProperty({
    name: 'id',
    example: 1,
  })
  @IsNumberString()
  id: number;
}
