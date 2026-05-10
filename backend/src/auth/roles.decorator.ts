import { SetMetadata } from '@nestjs/common';

/** The metadata key used by RolesGuard to read required roles. */
export const ROLES_KEY = 'roles';

/**
 * Attach one or more allowed roles to a route handler.
 *
 * @example
 * // Only admins may access this route
 * @Roles('admin')
 *
 * @example
 * // Only regular customers may access this route (blocks admins)
 * @Roles('user')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
