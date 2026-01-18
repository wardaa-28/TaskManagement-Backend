import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardMember } from '../../board-members/entities/board-member.entity';
import { Board } from '../../boards/entities/board.entity';
import { BoardColumn as Column } from '../../columns/entities/column.entity';
import { Task } from '../../tasks/entities/task.entity';

@Injectable()
export class BoardMemberGuard implements CanActivate {
  constructor(
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  private async getBoardIdFromColumn(columnId: string): Promise<string | null> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });
    return column?.boardId || null;
  }

  private async getBoardIdFromTask(taskId: string): Promise<string | null> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });
    return task?.boardId || null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    let boardId =
      request.params.boardId ||
      request.params.id ||
      request.body?.boardId;

    // If boardId not found in params or body, try to get from columnId, taskId, or column by id
    if (!boardId) {
      if (request.body?.columnId) {
        boardId = await this.getBoardIdFromColumn(request.body.columnId);
      } else if (request.params.id) {
        // Check if this is a task route by looking at the URL path
        const url = request.url || request.originalUrl || '';
        if (url.includes('/tasks/')) {
          boardId = await this.getBoardIdFromTask(request.params.id);
        } else if (url.includes('/columns/')) {
          // For column updates, get boardId from column
          boardId = await this.getBoardIdFromColumn(request.params.id);
        }
      }
    }

    if (!boardId) {
      throw new NotFoundException('Board ID is required');
    }

    // Check if board exists
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if user is a member of the board
    const boardMember = await this.boardMemberRepository.findOne({
      where: {
        board: { id: boardId },
        user: { id: user.id },
      },
    });

    if (!boardMember) {
      throw new ForbiddenException('You are not a member of this board');
    }

    // Attach board member info to request for role checks
    request.boardMember = boardMember;

    return true;
  }
}
