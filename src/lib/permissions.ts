export type Role = 'admin' | 'editor';

export interface RolePermissions {
  canDelete: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
}

const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  admin: { canDelete: true, canManageUsers: true, canManageSettings: true },
  editor: { canDelete: false, canManageUsers: false, canManageSettings: false },
};

const LEAST_PRIVILEGE: RolePermissions = { canDelete: false, canManageUsers: false, canManageSettings: false };

export function isKnownRole(role: string): role is Role {
  return role === 'admin' || role === 'editor';
}

export function getPermissions(role: string): RolePermissions {
  return isKnownRole(role) ? ROLE_PERMISSIONS[role] : LEAST_PRIVILEGE;
}
