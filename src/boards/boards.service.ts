import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Board } from './entities/board.entity';
import { BoardMember } from '../board-members/entities/board-member.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardRole } from '../common/enums/board-role.enum';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createBoardDto: CreateBoardDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create board
      const board = this.boardsRepository.create({
        title: createBoardDto.title,
        ownerId: userId,
      });
      const savedBoard = await queryRunner.manager.save(board);

      // Automatically add owner to board_members table
      const boardMember = this.boardMemberRepository.create({
        boardId: savedBoard.id,
        userId: userId,
        role: BoardRole.OWNER,
      });
      await queryRunner.manager.save(boardMember);

      await queryRunner.commitTransaction();

      return {
        message: 'Board created successfully',
        data: savedBoard,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: string) {
    const boards = await this.boardsRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.members', 'members')
      .leftJoin('members.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();

    return {
      message: 'Boards retrieved successfully',
      data: boards,
    };
  }

  async findOne(id: string, userId: string) {
    // Check if user is a member
    const boardMember = await this.boardMemberRepository.findOne({
      where: {
        board: { id },
        user: { id: userId },
      },
      relations: ['board', 'board.owner'],
    });

    if (!boardMember) {
      throw new ForbiddenException('You are not a member of this board');
    }

    const board = await this.boardsRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user', 'columns', 'tasks'],
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return {
      message: 'Board retrieved successfully',
      data: board,
    };
  }

  async remove(id: string, userId: string) {
    const board = await this.boardsRepository.findOne({
      where: { id },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if user is the owner
    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only board owner can delete the board');
    }

    await this.boardsRepository.remove(board);

    return {
      message: 'Board deleted successfully',
      data: null,
    };
  }
}
