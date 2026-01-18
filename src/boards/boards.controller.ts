import {
  Controller,
  Get,
  Post,
  Delete,
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
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BoardMemberGuard } from '../common/guards/board-member.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('boards')
@ApiBearerAuth()
@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new board' })
  @ApiResponse({ status: 201, type: ApiResponseDto })
  async create(
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser() user: User,
  ) {
    return this.boardsService.create(user.id, createBoardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all boards for the logged-in user' })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  async findAll(@CurrentUser() user: User) {
    return this.boardsService.findAll(user.id);
  }

  @Get(':id')
  @UseGuards(BoardMemberGuard)
  @ApiOperation({ summary: 'Get board by ID' })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  @ApiResponse({ status: 403, description: 'Not a board member' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.boardsService.findOne(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BoardMemberGuard)
  @ApiOperation({ summary: 'Delete a board (OWNER only)' })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  @ApiResponse({ status: 403, description: 'Not board owner' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.boardsService.remove(id, user.id);
  }
}
