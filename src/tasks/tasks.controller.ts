import {
  Controller,
  Get,
  Post,
  Patch,
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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BoardMemberGuard } from '../common/guards/board-member.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('tasks')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BoardMemberGuard)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, type: ApiResponseDto })
  async create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(user.id, createTaskDto);
  }

  @Get('boards/:boardId/tasks')
  @UseGuards(BoardMemberGuard)
  @ApiOperation({ summary: 'Get all tasks for a board' })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  async findByBoard(@Param('boardId') boardId: string) {
    return this.tasksService.findByBoard(boardId);
  }

  @Patch('tasks/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BoardMemberGuard)
  @ApiOperation({
    summary: 'Update a task (supports drag & drop via columnId and position)',
  })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, user.id, updateTaskDto);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BoardMemberGuard)
  @ApiOperation({ summary: 'Delete a task (OWNER only)' })
  @ApiResponse({ status: 200, type: ApiResponseDto })
  @ApiResponse({ status: 403, description: 'Not board owner' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.remove(id, user.id);
  }
}
