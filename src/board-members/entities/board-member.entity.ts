import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Board } from '../../boards/entities/board.entity';
import { User } from '../../users/entities/user.entity';
import { BoardRole } from '../../common/enums/board-role.enum';

@Entity('board_members')
@Unique(['board', 'user'])
export class BoardMember {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ name: 'board_id' })
  boardId: string;

  @ManyToOne(() => Board, (board) => board.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.boardMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: BoardRole,
  })
  role: BoardRole;
}
