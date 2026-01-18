import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMembersService } from './board-members.service';
import { BoardMembersController } from './board-members.controller';
import { BoardMember } from './entities/board-member.entity';
import { User } from '../users/entities/user.entity';
import { Board } from '../boards/entities/board.entity';
import { BoardColumn as Column } from '../columns/entities/column.entity';
import { Task } from '../tasks/entities/task.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardMember, User, Board, Column, Task]),
    CommonModule,
  ],
  controllers: [BoardMembersController],
  providers: [BoardMembersService],
  exports: [BoardMembersService],
})
export class BoardMembersModule {}
