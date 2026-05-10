import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * Generic Role-Based Access Control (RBAC) guard.
 *
 * How it works:
 *  1. Reads the roles attached by @Roles() from the route metadata.
 *  2. If no roles are required the route is considered unprotected → allow.
 *  3. Checks that req.user.role matches at least one of the required roles.
 *
 * IMPORTANT: Always pair this guard with AuthGuard('jwt') so that req.user
 * is populated before this guard runs.
 *
 * @example
 * // Admin-only route
 * @UseGuards(AuthGuard('jwt'), RolesGuard)
 * @Roles('admin')
 * @Post()
 * create(@Body() dto: CreateProductDto) { ... }
 *
 * @example
 * // Customer-only route (admins are actively blocked)
 * @UseGuards(AuthGuard('jwt'), RolesGuard)
 * @Roles('user')
 * @Post('checkout')
 * checkout(@Body() dto: CreateOrderDto) { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Collect roles defined on the handler AND the controller class
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() decorator → route is not role-restricted
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (requiredRoles.includes(user?.role)) {
      return true;
    }

    throw new ForbiddenException(
      `Access denied. Required role(s): ${requiredRoles.join(', ')}. Your role: ${user?.role ?? 'none'}.`,
    );
  }
}
