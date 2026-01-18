import {
  Controller,
  Get,
  Post,
  Patch,
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
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BoardMemberGuard } from '../common/guards/board-member.guard';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('columns')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post('columns')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BoardMemberGuard)
  @ApiOperation({ summary: 'Create a new column' })
  @ApiResponse({ status: 201, type: ApiResponseDto })
  async create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnsService.create(createColumnDto);
  }

  @Get('boards/:boardId/columns')
  @UseGuards(BoardMemberGuard)
  @ApiOperation({ summary: 'Get all columns for a board' })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  async findByBoard(@Param('boardId') boardId: string) {
    return this.columnsService.findByBoard(boardId);
  }

  @Patch('columns/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BoardMemberGuard)
  @ApiOperation({ summary: 'Update a column (rename/reorder)' })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.columnsService.update(id, updateColumnDto);
  }
}
