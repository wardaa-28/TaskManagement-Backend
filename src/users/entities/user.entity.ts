import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Board } from '../../boards/entities/board.entity';
import { BoardMember } from '../../board-members/entities/board-member.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar_url: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Board, (board) => board.owner)
  ownedBoards: Board[];

  @OneToMany(() => BoardMember, (boardMember) => boardMember.user)
  boardMemberships: BoardMember[];

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks: Task[];
}
