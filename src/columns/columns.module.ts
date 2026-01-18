import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { BoardColumn as Column } from './entities/column.entity';
import { Board } from '../boards/entities/board.entity';
import { BoardMember } from '../board-members/entities/board-member.entity';
import { Task } from '../tasks/entities/task.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Column, Board, BoardMember, Task]),
    CommonModule,
  ],
  controllers: [ColumnsController],
  providers: [ColumnsService],
  exports: [ColumnsService],
})
export class ColumnsModule {}
