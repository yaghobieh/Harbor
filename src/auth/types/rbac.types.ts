export type Role = string;
export type Permission = string;

export interface RbacOptions {
  roleField?: string;
  permissionsField?: string;
  rolePermissions?: Record<Role, Permission[]>;
}

