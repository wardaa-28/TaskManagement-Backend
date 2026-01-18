import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Board } from '../boards/entities/board.entity';
import { BoardMember } from '../board-members/entities/board-member.entity';
import { BoardColumn } from '../columns/entities/column.entity';
import { Task } from '../tasks/entities/task.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'postgres'),
  database: configService.get<string>('DB_DATABASE', 'taskmanagement'),
  entities: [User, Board, BoardMember, BoardColumn, Task],
  synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
  logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
});
