import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BoardMembersService } from './board-members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BoardMemberGuard } from '../common/guards/board-member.guard';
import { BoardOwnerGuard } from '../common/guards/board-owner.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('board-members')
@ApiBearerAuth()
@Controller('boards/:boardId/members')
@UseGuards(JwtAuthGuard, BoardMemberGuard)
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BoardOwnerGuard)
  @ApiOperation({ summary: 'Add a member to board (OWNER only)' })
  @ApiResponse({ status: 201, type: ApiResponseDto })
  @ApiResponse({ status: 403, description: 'Not board owner' })
  async addMember(
    @Param('boardId') boardId: string,
    @CurrentUser() user: User,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.boardMembersService.addMember(boardId, user.id, addMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all members of a board' })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  async getBoardMembers(@Param('boardId') boardId: string) {
    return this.boardMembersService.getBoardMembers(boardId);
  }
}
