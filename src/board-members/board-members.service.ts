import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardMember } from './entities/board-member.entity';
import { User } from '../users/entities/user.entity';
import { Board } from '../boards/entities/board.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { BoardRole } from '../common/enums/board-role.enum';

@Injectable()
export class BoardMembersService {
  constructor(
    @InjectRepository(BoardMember)
    private boardMemberRepository: Repository<BoardMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async addMember(boardId: string, userId: string, addMemberDto: AddMemberDto) {
    // Check if board exists
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if user to add exists
    const userToAdd = await this.userRepository.findOne({
      where: { email: addMemberDto.email },
    });

    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const existingMember = await this.boardMemberRepository.findOne({
      where: {
        board: { id: boardId },
        user: { id: userToAdd.id },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this board');
    }

    // Only OWNER can add members, and only MEMBER role can be assigned (not another OWNER)
    if (addMemberDto.role === BoardRole.OWNER) {
      throw new ForbiddenException('Cannot assign OWNER role to members');
    }

    const boardMember = this.boardMemberRepository.create({
      boardId: boardId,
      userId: userToAdd.id,
      role: addMemberDto.role,
    });

    const savedMember = await this.boardMemberRepository.save(boardMember);

    // Load relations
    await this.boardMemberRepository.findOne({
      where: { id: savedMember.id },
      relations: ['user', 'board'],
    });

    return {
      message: 'Member added successfully',
      data: savedMember,
    };
  }

  async getBoardMembers(boardId: string) {
    const members = await this.boardMemberRepository.find({
      where: { board: { id: boardId } },
      relations: ['user', 'board'],
    });

    return {
      message: 'Board members retrieved successfully',
      data: members,
    };
  }
}
