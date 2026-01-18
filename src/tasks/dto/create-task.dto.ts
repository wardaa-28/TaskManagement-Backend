import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsUUID()
  columnId: string;

  @ApiProperty()
  @IsUUID()
  boardId: string;
}
