// 역할 정의
export type UserRole =
  | 'SUPER_MASTER'      // 최고 마스터 (전체)
  | 'COUNTRY_MASTER'    // 나라별 마스터
  | 'BRANCH_ADMIN'      // 지점 관리자
  | 'TEACHER'           // 강사
  | 'PARENT'            // 부모
  | 'STUDENT';          // 학생

// 권한 카테고리별 정의
export interface PermissionSet {
  // 대시보드 & 통계
  dashboard: {
    global: boolean;          // 글로벌 대시보드
    country: boolean;         // 나라 대시보드
    branch: boolean;          // 지점 대시보드
    teacher: boolean;         // 강사 대시보드
    parent: boolean;          // 부모 대시보드
    student: boolean;         // 학생 대시보드
  };

  // 사용자 관리
  users: {
    create: boolean;          // 사용자 생성
    read: boolean;            // 사용자 조회
    update: boolean;          // 사용자 수정
    delete: boolean;          // 사용자 삭제
    impersonate: boolean;     // 대행접속
    grant_permissions: boolean; // 권한 부여
  };

  // 마스터 관리
  masters: {
    create_country: boolean;  // 나라 마스터 생성
    create_branch: boolean;   // 지점 계정 생성
    manage: boolean;          // 마스터 관리
    suspend: boolean;         // 마스터 중지
  };

  // 콘텐츠 관리
  content: {
    view: boolean;            // 콘텐츠 보기
    create: boolean;          // 콘텐츠 생성
    update: boolean;          // 콘텐츠 수정
    delete: boolean;          // 콘텐츠 삭제
    publish: boolean;         // 콘텐츠 발행
  };

  // E-book 관리
  ebooks: {
    view_unlimited: boolean;  // 무제한 보기
    view_limited: boolean;    // 제한된 보기
    manage: boolean;          // E-book 관리
    assign_permissions: boolean; // 권한 할당
    upload: boolean;          // E-book 업로드
  };

  // 레벨 테스트
  tests: {
    take: boolean;            // 테스트 응시
    view_results: boolean;    // 결과 조회
    manage: boolean;          // 테스트 관리
    regrade: boolean;         // 재채점
    reset_attempts: boolean;  // 재응시 허용
  };

  // 학원 코드 관리
  academy_codes: {
    create: boolean;          // 코드 생성
    assign: boolean;          // 코드 배포
    manage: boolean;          // 코드 관리
    view: boolean;            // 코드 조회
  };

  // 회원권 관리
  memberships: {
    create: boolean;          // 회원권 생성
    assign: boolean;          // 회원권 할당
    manage: boolean;          // 회원권 관리
    view: boolean;            // 회원권 조회
  };

  // 시스템 설정
  system: {
    settings: boolean;        // 시스템 설정
    policies: boolean;        // 정책 설정
    billing: boolean;         // 요금제 관리
    audit_logs: boolean;      // 감사로그
    backup: boolean;          // 백업 관리
  };

  // 알림
  notifications: {
    receive: boolean;         // 알림 수신
    manage_channels: boolean; // 채널 관리
    send: boolean;            // 알림 발송
  };
}

// 역할별 기본 권한
export const ROLE_PERMISSIONS: Record<UserRole, PermissionSet> = {
  SUPER_MASTER: {
    dashboard: { global: true, country: true, branch: true, teacher: true, parent: true, student: true },
    users: { create: true, read: true, update: true, delete: true, impersonate: true, grant_permissions: true },
    masters: { create_country: true, create_branch: true, manage: true, suspend: true },
    content: { view: true, create: true, update: true, delete: true, publish: true },
    ebooks: { view_unlimited: true, view_limited: false, manage: true, assign_permissions: true, upload: true },
    tests: { take: false, view_results: true, manage: true, regrade: true, reset_attempts: true },
    academy_codes: { create: true, assign: true, manage: true, view: true },
    memberships: { create: true, assign: true, manage: true, view: true },
    system: { settings: true, policies: true, billing: true, audit_logs: true, backup: true },
    notifications: { receive: true, manage_channels: true, send: true }
  },

  COUNTRY_MASTER: {
    dashboard: { global: false, country: true, branch: true, teacher: true, parent: false, student: false },
    users: { create: true, read: true, update: true, delete: false, impersonate: true, grant_permissions: true },
    masters: { create_country: false, create_branch: true, manage: true, suspend: false },
    content: { view: true, create: true, update: true, delete: false, publish: true },
    ebooks: { view_unlimited: true, view_limited: false, manage: true, assign_permissions: true, upload: true },
    tests: { take: false, view_results: true, manage: true, regrade: true, reset_attempts: true },
    academy_codes: { create: true, assign: true, manage: true, view: true },
    memberships: { create: false, assign: true, manage: true, view: true },
    system: { settings: false, policies: false, billing: false, audit_logs: true, backup: false },
    notifications: { receive: true, manage_channels: true, send: true }
  },

  BRANCH_ADMIN: {
    dashboard: { global: false, country: false, branch: true, teacher: true, parent: false, student: false },
    users: { create: true, read: true, update: true, delete: true, impersonate: false, grant_permissions: false },
    masters: { create_country: false, create_branch: false, manage: false, suspend: false },
    content: { view: true, create: false, update: false, delete: false, publish: false },
    ebooks: { view_unlimited: true, view_limited: false, manage: false, assign_permissions: true, upload: false },
    tests: { take: false, view_results: true, manage: true, regrade: false, reset_attempts: true },
    academy_codes: { create: true, assign: true, manage: true, view: true },
    memberships: { create: false, assign: true, manage: true, view: true },
    system: { settings: false, policies: true, billing: true, audit_logs: false, backup: false },
    notifications: { receive: true, manage_channels: true, send: false }
  },

  TEACHER: {
    dashboard: { global: false, country: false, branch: false, teacher: true, parent: false, student: false },
    users: { create: false, read: true, update: false, delete: false, impersonate: false, grant_permissions: false },
    masters: { create_country: false, create_branch: false, manage: false, suspend: false },
    content: { view: true, create: true, update: true, delete: false, publish: false },
    ebooks: { view_unlimited: true, view_limited: false, manage: false, assign_permissions: false, upload: false },
    tests: { take: false, view_results: true, manage: false, regrade: true, reset_attempts: false },
    academy_codes: { create: false, assign: false, manage: false, view: false },
    memberships: { create: false, assign: false, manage: false, view: true },
    system: { settings: false, policies: false, billing: false, audit_logs: false, backup: false },
    notifications: { receive: true, manage_channels: true, send: false }
  },

  PARENT: {
    dashboard: { global: false, country: false, branch: false, teacher: false, parent: true, student: false },
    users: { create: false, read: true, update: false, delete: false, impersonate: false, grant_permissions: false },
    masters: { create_country: false, create_branch: false, manage: false, suspend: false },
    content: { view: false, create: false, update: false, delete: false, publish: false },
    ebooks: { view_unlimited: false, view_limited: true, manage: false, assign_permissions: false, upload: false },
    tests: { take: false, view_results: true, manage: false, regrade: false, reset_attempts: false },
    academy_codes: { create: false, assign: false, manage: false, view: false },
    memberships: { create: false, assign: false, manage: false, view: true },
    system: { settings: false, policies: false, billing: false, audit_logs: false, backup: false },
    notifications: { receive: true, manage_channels: true, send: false }
  },

  STUDENT: {
    dashboard: { global: false, country: false, branch: false, teacher: false, parent: false, student: true },
    users: { create: false, read: false, update: false, delete: false, impersonate: false, grant_permissions: false },
    masters: { create_country: false, create_branch: false, manage: false, suspend: false },
    content: { view: false, create: false, update: false, delete: false, publish: false },
    ebooks: { view_unlimited: false, view_limited: true, manage: false, assign_permissions: false, upload: false },
    tests: { take: true, view_results: true, manage: false, regrade: false, reset_attempts: false },
    academy_codes: { create: false, assign: false, manage: false, view: false },
    memberships: { create: false, assign: false, manage: false, view: true },
    system: { settings: false, policies: false, billing: false, audit_logs: false, backup: false },
    notifications: { receive: true, manage_channels: true, send: false }
  }
};

// 권한 체크 유틸리티
export const hasPermission = (
  role: UserRole,
  category: keyof PermissionSet,
  action: string
): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[role];
  const categoryPermissions = rolePermissions[category] as any;
  return categoryPermissions?.[action] === true;
};

// 상위 권한 포함 체크
export const hasPermissionWithHierarchy = (
  role: UserRole,
  category: keyof PermissionSet,
  action: string
): boolean => {
  // 기본 권한 체크
  if (hasPermission(role, category, action)) {
    return true;
  }

  // 상위 역할 권한 체크
  const hierarchy: UserRole[] = ['STUDENT', 'PARENT', 'TEACHER', 'BRANCH_ADMIN', 'COUNTRY_MASTER', 'SUPER_MASTER'];
  const roleIndex = hierarchy.indexOf(role);

  for (let i = roleIndex + 1; i < hierarchy.length; i++) {
    if (hasPermission(hierarchy[i], category, action)) {
      return true;
    }
  }

  return false;
};

// 나라 및 지점 정보
export interface Country {
  code: string;
  name: string;
  branches: Branch[];
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  countryCode: string;
  academyCode: string;
}

// 회원권 정책
export interface MembershipPolicy {
  id: string;
  name: string;
  ebookLimit: number;        // E-book 권한 수 (-1: 무제한)
  monthlyHours: number;      // 월 사용시간 (-1: 무제한)
  testAttemptsPerMonth: number; // 월 테스트 횟수
  simultaneousConnections: number; // 동시 접속 수
}

// 학원 코드
export interface AcademyCode {
  code: string;
  countryCode: string;
  branchId: string;
  role: UserRole;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
}