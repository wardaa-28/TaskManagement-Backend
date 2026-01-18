import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { BoardColumn as Column } from '../columns/entities/column.entity';
import { Board } from '../boards/entities/board.entity';
import { BoardMember } from '../board-members/entities/board-member.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Column, Board, BoardMember]),
    CommonModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
