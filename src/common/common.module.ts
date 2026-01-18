import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardMemberGuard } from './guards/board-member.guard';
import { BoardOwnerGuard } from './guards/board-owner.guard';
import { BoardMember } from '../board-members/entities/board-member.entity';
import { Board } from '../boards/entities/board.entity';
import { BoardColumn as Column } from '../columns/entities/column.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardMember, Board, Column, Task]),
  ],
  providers: [BoardMemberGuard, BoardOwnerGuard],
  exports: [BoardMemberGuard, BoardOwnerGuard],
})
export class CommonModule {}
