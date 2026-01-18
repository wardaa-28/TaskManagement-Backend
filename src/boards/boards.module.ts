import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board } from './entities/board.entity';
import { BoardMember } from '../board-members/entities/board-member.entity';
import { BoardColumn as Column } from '../columns/entities/column.entity';
import { Task } from '../tasks/entities/task.entity';
import { BoardMembersModule } from '../board-members/board-members.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardMember, Column, Task]),
    BoardMembersModule,
    CommonModule,
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
