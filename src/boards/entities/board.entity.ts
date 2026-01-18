import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/entities/user.entity';
import { BoardMember } from '../../board-members/entities/board-member.entity';
import { BoardColumn } from '../../columns/entities/column.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column()
  title: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.ownedBoards)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @OneToMany(() => BoardMember, (boardMember) => boardMember.board)
  members: BoardMember[];

  @OneToMany(() => BoardColumn, (column) => column.board)
  columns: BoardColumn[];

  @OneToMany(() => Task, (task) => task.board)
  tasks: Task[];
}
