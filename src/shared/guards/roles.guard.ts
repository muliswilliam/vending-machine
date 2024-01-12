import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/shared/decorators/roles.decorator';
import { Role } from '@/shared/enums/roles';

export const ROLE_HEADER = 'x-role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userRole = request.headers[ROLE_HEADER];

    return requiredRoles.some(
      (role) => role.toLowerCase() === userRole?.toLowerCase(),
    );
  }
}
