import {
  Entity,
  PrimaryGeneratedColumn,
  Column as TypeORMColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BoardColumn } from '../../columns/entities/column.entity';
import { Board } from '../../boards/entities/board.entity';
import { User } from '../../users/entities/user.entity';
import { TaskStatus } from '../../common/enums/task-status.enum';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @TypeORMColumn()
  title: string;

  @TypeORMColumn({ type: 'text', nullable: true })
  description: string;

  @TypeORMColumn({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @TypeORMColumn()
  position: number;

  @TypeORMColumn({ name: 'column_id' })
  columnId: string;

  @ManyToOne(() => BoardColumn, (column) => column.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'column_id' })
  column: BoardColumn;

  @TypeORMColumn({ name: 'board_id' })
  boardId: string;

  @ManyToOne(() => Board, (board) => board.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @TypeORMColumn({ name: 'created_by' })
  createdById: string;

  @ManyToOne(() => User, (user) => user.createdTasks)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
