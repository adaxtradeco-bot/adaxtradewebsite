export type Role = 'admin' | 'editor';

export interface RolePermissions {
  canDelete: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  /** Create/edit custom-html (code) sections and compile CSS. */
  canEditCode: boolean;
}

const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  admin: { canDelete: true, canManageUsers: true, canManageSettings: true, canEditCode: true },
  editor: { canDelete: false, canManageUsers: false, canManageSettings: false, canEditCode: false },
};

const LEAST_PRIVILEGE: RolePermissions = { canDelete: false, canManageUsers: false, canManageSettings: false, canEditCode: false };

export function isKnownRole(role: string): role is Role {
  return role === 'admin' || role === 'editor';
}

export function getPermissions(role: string): RolePermissions {
  return isKnownRole(role) ? ROLE_PERMISSIONS[role] : LEAST_PRIVILEGE;
}
