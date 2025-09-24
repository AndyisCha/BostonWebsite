export enum UserRole {
  SUPER_MASTER = 'SUPER_MASTER',
  COUNTRY_MASTER = 'COUNTRY_MASTER',
  BRANCH_ADMIN = 'BRANCH_ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT'
}

export enum Permission {
  // Global permissions
  VIEW_GLOBAL_DASHBOARD = 'VIEW_GLOBAL_DASHBOARD',
  MANAGE_COUNTRIES = 'MANAGE_COUNTRIES',
  MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS',

  // Country level permissions
  VIEW_COUNTRY_DASHBOARD = 'VIEW_COUNTRY_DASHBOARD',
  MANAGE_BRANCHES = 'MANAGE_BRANCHES',
  MANAGE_COUNTRY_CONTENT = 'MANAGE_COUNTRY_CONTENT',

  // Branch level permissions
  VIEW_BRANCH_DASHBOARD = 'VIEW_BRANCH_DASHBOARD',
  MANAGE_BRANCH_USERS = 'MANAGE_BRANCH_USERS',
  MANAGE_BRANCH_CONTENT = 'MANAGE_BRANCH_CONTENT',
  ISSUE_ACADEMY_CODES = 'ISSUE_ACADEMY_CODES',
  MANAGE_PAYMENTS = 'MANAGE_PAYMENTS',

  // Teacher permissions
  VIEW_STUDENT_PROGRESS = 'VIEW_STUDENT_PROGRESS',
  MANAGE_ASSIGNMENTS = 'MANAGE_ASSIGNMENTS',
  ACCESS_ALL_EBOOKS = 'ACCESS_ALL_EBOOKS',

  // Parent permissions
  VIEW_CHILD_PROGRESS = 'VIEW_CHILD_PROGRESS',
  MANAGE_NOTIFICATIONS = 'MANAGE_NOTIFICATIONS',

  // Student permissions
  TAKE_LEVEL_TESTS = 'TAKE_LEVEL_TESTS',
  ACCESS_ASSIGNED_EBOOKS = 'ACCESS_ASSIGNED_EBOOKS',
  SAVE_DRAWINGS = 'SAVE_DRAWINGS',

  // Special permissions
  IMPERSONATE_USERS = 'IMPERSONATE_USERS',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS'
}

export interface RolePermissions {
  [UserRole.SUPER_MASTER]: Permission[];
  [UserRole.COUNTRY_MASTER]: Permission[];
  [UserRole.BRANCH_ADMIN]: Permission[];
  [UserRole.TEACHER]: Permission[];
  [UserRole.PARENT]: Permission[];
  [UserRole.STUDENT]: Permission[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.SUPER_MASTER]: [
    Permission.VIEW_GLOBAL_DASHBOARD,
    Permission.MANAGE_COUNTRIES,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.MANAGE_BRANCHES,
    Permission.MANAGE_COUNTRY_CONTENT,
    Permission.MANAGE_BRANCH_CONTENT,
    Permission.IMPERSONATE_USERS,
    Permission.VIEW_AUDIT_LOGS
  ],

  [UserRole.COUNTRY_MASTER]: [
    Permission.VIEW_COUNTRY_DASHBOARD,
    Permission.MANAGE_BRANCHES,
    Permission.MANAGE_COUNTRY_CONTENT,
    Permission.IMPERSONATE_USERS, // Branch admins only
    Permission.VIEW_AUDIT_LOGS
  ],

  [UserRole.BRANCH_ADMIN]: [
    Permission.VIEW_BRANCH_DASHBOARD,
    Permission.MANAGE_BRANCH_USERS,
    Permission.MANAGE_BRANCH_CONTENT,
    Permission.ISSUE_ACADEMY_CODES,
    Permission.MANAGE_PAYMENTS,
    Permission.VIEW_STUDENT_PROGRESS
  ],

  [UserRole.TEACHER]: [
    Permission.VIEW_STUDENT_PROGRESS,
    Permission.MANAGE_ASSIGNMENTS,
    Permission.ACCESS_ALL_EBOOKS
  ],

  [UserRole.PARENT]: [
    Permission.VIEW_CHILD_PROGRESS,
    Permission.MANAGE_NOTIFICATIONS
  ],

  [UserRole.STUDENT]: [
    Permission.TAKE_LEVEL_TESTS,
    Permission.ACCESS_ASSIGNED_EBOOKS,
    Permission.SAVE_DRAWINGS
  ]
};

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  countryId?: string;
  branchId?: string;
  permissions: Permission[];
}

export interface AccessScope {
  type: 'global' | 'country' | 'branch' | 'self';
  countryId?: string;
  branchId?: string;
  userId?: string;
}