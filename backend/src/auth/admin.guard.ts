import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Check if the authenticated user has the admin role
    if (user && user.role === 'admin') {
      return true;
    }
    
    throw new ForbiddenException('Admin Privileges Required');
  }
}
