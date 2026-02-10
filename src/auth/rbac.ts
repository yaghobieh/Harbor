import { RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants';
import type { Role, Permission, RbacOptions } from './types';

export function requireRole(roles: Role | Role[], options: RbacOptions = {}): RequestHandler {
  const { roleField = 'role' } = options;
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const userRole = user[roleField];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: { message: 'Insufficient permissions' },
      });
    }

    next();
  };
}

export function requirePermission(permissions: Permission | Permission[], options: RbacOptions = {}): RequestHandler {
  const { permissionsField = 'permissions', roleField = 'role', rolePermissions = {} } = options;
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

  return (req, res, next) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    let userPermissions: Permission[] = user[permissionsField] || [];
    
    if (user[roleField] && rolePermissions[user[roleField]]) {
      userPermissions = [...userPermissions, ...rolePermissions[user[roleField]]];
    }

    const hasPermission = requiredPermissions.every((p) => userPermissions.includes(p));
    
    if (!hasPermission) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: { message: 'Insufficient permissions' },
      });
    }

    next();
  };
}

