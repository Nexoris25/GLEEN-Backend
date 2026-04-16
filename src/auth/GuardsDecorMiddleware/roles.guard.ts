// src/auth/GuardsDecorMiddleware/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get roles from decorator
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles defined → allow any authenticated user
    if (!roles || roles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('ROLES GUARD DEBUG ────────────────────────');
    console.log('Required roles:', roles);
    console.log('User from req:', user);
    console.log('User roles:', user?.roles);

    if (!user || !user.role) return false;

    // Normalize roles (remove 'ROLE_' prefix, lowercase)
    const normalize = (role: string) =>
      role.replace(/^ROLE_/, '').toLowerCase();

    const allowedRoles = roles.map(normalize);

    // Handle single string or array of roles
    const userRoles = Array.isArray(user.role)
      ? user.role.map(normalize)
      : [normalize(user.role)];

    // Allow access if any role matches
    return userRoles.some((role) => allowedRoles.includes(role));
  }
}
