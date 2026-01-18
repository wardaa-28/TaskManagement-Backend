import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardColumn as Column } from './entities/column.entity';
import { Board } from '../boards/entities/board.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Column)
    private columnsRepository: Repository<Column>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(createColumnDto: CreateColumnDto) {
    // Check if board exists
    const board = await this.boardRepository.findOne({
      where: { id: createColumnDto.boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Get max position for this board
    const maxPosition = await this.columnsRepository
      .createQueryBuilder('column')
      .where('column.boardId = :boardId', { boardId: createColumnDto.boardId })
      .select('MAX(column.position)', 'max')
      .getRawOne();

    const newPosition = maxPosition?.max != null ? maxPosition.max + 1 : 0;

    const column = this.columnsRepository.create({
      title: createColumnDto.title,
      boardId: createColumnDto.boardId,
      position: newPosition,
    });

    const savedColumn = await this.columnsRepository.save(column);

    return {
      message: 'Column created successfully',
      data: savedColumn,
    };
  }

  async findByBoard(boardId: string) {
    const columns = await this.columnsRepository.find({
      where: { board: { id: boardId } },
      relations: ['board'],
      order: { position: 'ASC' },
    });

    return {
      message: 'Columns retrieved successfully',
      data: columns,
    };
  }

  async update(id: string, updateColumnDto: UpdateColumnDto) {
    const column = await this.columnsRepository.findOne({
      where: { id },
      relations: ['board'],
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const oldPosition = column.position;

    // If position is being updated, handle reordering
    if (updateColumnDto.position !== undefined && oldPosition !== updateColumnDto.position) {
      await this.reorderColumns(column.boardId, oldPosition, updateColumnDto.position);
    }

    Object.assign(column, updateColumnDto);
    const updatedColumn = await this.columnsRepository.save(column);

    return {
      message: 'Column updated successfully',
      data: updatedColumn,
    };
  }

  private async reorderColumns(
    boardId: string,
    oldPosition: number,
    newPosition: number,
  ) {
    if (oldPosition === newPosition) return;

    if (oldPosition < newPosition) {
      // Moving down: shift columns up
      await this.columnsRepository
        .createQueryBuilder()
        .update(Column)
        .set({ position: () => 'position - 1' })
        .where('boardId = :boardId', { boardId })
        .andWhere('position > :oldPosition', { oldPosition })
        .andWhere('position <= :newPosition', { newPosition })
        .execute();
    } else {
      // Moving up: shift columns down
      await this.columnsRepository
        .createQueryBuilder()
        .update(Column)
        .set({ position: () => 'position + 1' })
        .where('boardId = :boardId', { boardId })
        .andWhere('position >= :newPosition', { newPosition })
        .andWhere('position < :oldPosition', { oldPosition })
        .execute();
    }
  }
}
