import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Task } from './entities/task.entity';
import { BoardColumn as Column } from '../columns/entities/column.entity';
import { Board } from '../boards/entities/board.entity';
import { BoardMember } from '../board-members/entities/board-member.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '../common/enums/task-status.enum';
import { BoardRole } from '../common/enums/board-role.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Column)
    private columnsRepository: Repository<Column>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createTaskDto: CreateTaskDto) {
    // Verify column exists and belongs to board
    const column = await this.columnsRepository.findOne({
      where: { id: createTaskDto.columnId },
      relations: ['board'],
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    if (column.boardId !== createTaskDto.boardId) {
      throw new BadRequestException('Column does not belong to the specified board');
    }

    // Get max position for this column
    const maxPosition = await this.tasksRepository
      .createQueryBuilder('task')
      .where('task.columnId = :columnId', { columnId: createTaskDto.columnId })
      .select('MAX(task.position)', 'max')
      .getRawOne();

    const newPosition = maxPosition?.max != null ? maxPosition.max + 1 : 0;

    // Determine status from column title (if column title matches status)
    let status = TaskStatus.TODO;
    if (column.title.toUpperCase() === TaskStatus.IN_PROGRESS) {
      status = TaskStatus.IN_PROGRESS;
    } else if (column.title.toUpperCase() === TaskStatus.DONE) {
      status = TaskStatus.DONE;
    }

    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status,
      position: newPosition,
      columnId: createTaskDto.columnId,
      boardId: createTaskDto.boardId,
      createdById: userId,
    });

    const savedTask = await this.tasksRepository.save(task);

    return {
      message: 'Task created successfully',
      data: savedTask,
    };
  }

  async findByBoard(boardId: string) {
    const tasks = await this.tasksRepository.find({
      where: { board: { id: boardId } },
      relations: ['column', 'board', 'createdBy'],
      order: { position: 'ASC' },
    });

    return {
      message: 'Tasks retrieved successfully',
      data: tasks,
    };
  }

  async update(id: string, userId: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['column', 'board'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Validate status transition
    if (updateTaskDto.status && updateTaskDto.status !== task.status) {
      this.validateStatusTransition(task.status, updateTaskDto.status);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Handle column change and/or position change
      if (updateTaskDto.columnId || updateTaskDto.position !== undefined) {
        const newColumnId = updateTaskDto.columnId || task.columnId;
        const newPosition = updateTaskDto.position !== undefined 
          ? updateTaskDto.position 
          : task.position;

        // Verify new column exists and belongs to same board
        if (updateTaskDto.columnId) {
          const newColumn = await this.columnsRepository.findOne({
            where: { id: newColumnId },
          });

          if (!newColumn) {
            throw new NotFoundException('Column not found');
          }

          if (newColumn.boardId !== task.boardId) {
            throw new BadRequestException(
              'Cannot move task to a column in a different board',
            );
          }

          // Update status based on new column title if status not explicitly set
          if (!updateTaskDto.status) {
            if (newColumn.title.toUpperCase() === TaskStatus.IN_PROGRESS) {
              updateTaskDto.status = TaskStatus.IN_PROGRESS;
            } else if (newColumn.title.toUpperCase() === TaskStatus.DONE) {
              updateTaskDto.status = TaskStatus.DONE;
            } else if (newColumn.title.toUpperCase() === TaskStatus.TODO) {
              updateTaskDto.status = TaskStatus.TODO;
            }
          }
        }

        // Reorder tasks if position changed or column changed
        if (newColumnId !== task.columnId || newPosition !== task.position) {
          await this.reorderTasks(
            queryRunner,
            task.columnId,
            task.position,
            newColumnId,
            newPosition,
          );
        }

        task.columnId = newColumnId;
        task.position = newPosition;
      }

      // Update status if provided
      if (updateTaskDto.status) {
        task.status = updateTaskDto.status;
      }

      // Update other fields
      if (updateTaskDto.title) {
        task.title = updateTaskDto.title;
      }
      if (updateTaskDto.description !== undefined) {
        task.description = updateTaskDto.description;
      }

      const updatedTask = await queryRunner.manager.save(task);
      await queryRunner.commitTransaction();

      return {
        message: 'Task updated successfully',
        data: updatedTask,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, userId: string) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['board'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user is board owner (only owners can delete tasks)
    const boardMember = await this.boardMemberRepository.findOne({
      where: {
        board: { id: task.boardId },
        user: { id: userId },
      },
    });

    if (!boardMember || boardMember.role !== BoardRole.OWNER) {
      throw new ForbiddenException('Only board owners can delete tasks');
    }

    await this.tasksRepository.remove(task);

    return {
      message: 'Task deleted successfully',
      data: null,
    };
  }

  private validateStatusTransition(currentStatus: TaskStatus, newStatus: TaskStatus) {
    const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.TODO, TaskStatus.DONE],
      [TaskStatus.DONE]: [], // No transitions allowed from DONE
    };

    const allowed = allowedTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition: Cannot change from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private async reorderTasks(
    queryRunner: any,
    oldColumnId: string,
    oldPosition: number,
    newColumnId: string,
    newPosition: number,
  ) {
    if (oldColumnId === newColumnId) {
      // Reordering within same column
      if (oldPosition === newPosition) return;

      if (oldPosition < newPosition) {
        // Moving down: shift tasks up
        await queryRunner.manager
          .createQueryBuilder()
          .update(Task)
          .set({ position: () => 'position - 1' })
          .where('columnId = :columnId', { columnId: oldColumnId })
          .andWhere('position > :oldPosition', { oldPosition })
          .andWhere('position <= :newPosition', { newPosition })
          .execute();
      } else {
        // Moving up: shift tasks down
        await queryRunner.manager
          .createQueryBuilder()
          .update(Task)
          .set({ position: () => 'position + 1' })
          .where('columnId = :columnId', { columnId: oldColumnId })
          .andWhere('position >= :newPosition', { newPosition })
          .andWhere('position < :oldPosition', { oldPosition })
          .execute();
      }
    } else {
      // Moving between columns
      // Shift tasks in old column up
      await queryRunner.manager
        .createQueryBuilder()
        .update(Task)
        .set({ position: () => 'position - 1' })
        .where('columnId = :oldColumnId', { oldColumnId })
        .andWhere('position > :oldPosition', { oldPosition })
        .execute();

      // Shift tasks in new column down
      await queryRunner.manager
        .createQueryBuilder()
        .update(Task)
        .set({ position: () => 'position + 1' })
        .where('columnId = :newColumnId', { newColumnId })
        .andWhere('position >= :newPosition', { newPosition })
        .execute();
    }
  }
}
