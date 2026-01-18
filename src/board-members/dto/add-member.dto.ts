import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { BoardRole } from '../../common/enums/board-role.enum';

export class AddMemberDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: BoardRole, default: BoardRole.MEMBER })
  @IsEnum(BoardRole)
  role: BoardRole;
}
