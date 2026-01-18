import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { BoardRole } from '../enums/board-role.enum';

@Injectable()
export class BoardOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const boardMember = request.boardMember;

    if (!boardMember) {
      throw new ForbiddenException('Board membership not found');
    }

    if (boardMember.role !== BoardRole.OWNER) {
      throw new ForbiddenException('Only board owners can perform this action');
    }

    return true;
  }
}
