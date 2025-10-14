// Realistic Boston Academy Mock Data
// This replaces the scattered mock data throughout the application

export interface RealisticBranchData {
  id: string;
  name: string;
  academyCode: string;
  memberCount: number;
  teacherCount: number;
  outsideUsers: number;
  todayTests: number;
  avgScore: number;
  thisWeekNewMembers: number;
  country: string;
  city: string;
  status: 'active' | 'inactive';
  established: string;
}

export interface RealisticMemberData {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT';
  level: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  testCount: number;
  avgScore: number;
  joinedDate: string;
  studyHours: number;
}

export interface RealisticEbookData {
  id: string;
  title: string;
  author: string;
  level: string;
  category: string;
  isActive: boolean;
  usageCount: number;
  averageRating: number;
  publishedDate: string;
}

// Empty starter data for a brand new academy branch
export const REALISTIC_BRANCH_DATA: RealisticBranchData = {
  id: 'branch-001',
  name: '보스턴 아카데미 신규지점',
  academyCode: 'BA-KR-001',
  memberCount: 0, // Starting completely empty
  teacherCount: 0, // No teachers hired yet
  outsideUsers: 0, // No outside users
  todayTests: 0, // No tests yet
  avgScore: 0, // No scores yet
  thisWeekNewMembers: 0, // No new members yet
  country: 'Korea',
  city: 'Seoul',
  status: 'active',
  established: new Date().toISOString().split('T')[0]
};

// Empty members array - start with no members
export const REALISTIC_MEMBERS: RealisticMemberData[] = [];

// Realistic E-book starter collection
export const REALISTIC_EBOOKS: RealisticEbookData[] = [
  {
    id: 'ebook-001',
    title: 'English Alphabet Basics',
    author: 'Boston Academy Team',
    level: 'A1',
    category: '기초문법',
    isActive: true,
    usageCount: 0,
    averageRating: 0,
    publishedDate: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ebook-002',
    title: 'Simple Conversations',
    author: 'Boston Academy Team',
    level: 'A1',
    category: '회화',
    isActive: true,
    usageCount: 0,
    averageRating: 0,
    publishedDate: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ebook-003',
    title: 'Basic Grammar Rules',
    author: 'Boston Academy Team',
    level: 'A2',
    category: '기초문법',
    isActive: true,
    usageCount: 0,
    averageRating: 0,
    publishedDate: new Date().toISOString().split('T')[0]
  }
];

// Management Utility Functions
export class DataManager {
  // Add a new member and update branch statistics
  static addMember(branchData: RealisticBranchData, member: RealisticMemberData): RealisticBranchData {
    return {
      ...branchData,
      memberCount: branchData.memberCount + 1,
      thisWeekNewMembers: branchData.thisWeekNewMembers + 1
    };
  }

  // Calculate realistic average score (only from students who have taken tests)
  static calculateBranchAverageScore(members: RealisticMemberData[]): number {
    const studentsWithScores = members.filter(m => m.role === 'STUDENT' && m.testCount > 0);
    if (studentsWithScores.length === 0) return 0;

    const totalScore = studentsWithScores.reduce((sum, student) => sum + student.avgScore, 0);
    return Math.round((totalScore / studentsWithScores.length) * 10) / 10; // Round to 1 decimal
  }

  // Get realistic KPI values
  static getBranchKPIs(branchData: RealisticBranchData, members: RealisticMemberData[]) {
    const students = members.filter(m => m.role === 'STUDENT');
    const teachers = members.filter(m => m.role === 'TEACHER');
    const todayTestTakers = students.filter(m => m.lastLogin === new Date().toISOString().split('T')[0] && m.testCount > 0).length;

    return {
      memberCount: branchData.memberCount,
      outsideUsers: branchData.outsideUsers,
      teacherCount: teachers.length,
      todayTests: todayTestTakers,
      avgScore: this.calculateBranchAverageScore(members),
      thisWeekNewMembers: branchData.thisWeekNewMembers
    };
  }

  // Validate data constraints
  static validateMemberData(member: Partial<RealisticMemberData>): string[] {
    const errors: string[] = [];

    if (member.avgScore && (member.avgScore < 0 || member.avgScore > 100)) {
      errors.push('Average score must be between 0 and 100');
    }

    if (member.testCount && member.testCount < 0) {
      errors.push('Test count cannot be negative');
    }

    if (member.studyHours && member.studyHours < 0) {
      errors.push('Study hours cannot be negative');
    }

    if (member.role === 'STUDENT' && member.level && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(member.level)) {
      errors.push('Invalid student level');
    }

    return errors;
  }

  // Generate realistic test score based on level
  static generateRealisticScore(level: string): number {
    const levelRanges = {
      'A1': [40, 65],
      'A2': [55, 75],
      'B1': [65, 80],
      'B2': [70, 85],
      'C1': [80, 95],
      'C2': [85, 98]
    };

    const range = levelRanges[level as keyof typeof levelRanges] || [50, 70];
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  }

  // Growth simulation for demo purposes
  static simulateGrowth(branchData: RealisticBranchData, days: number): RealisticBranchData {
    const newMembers = Math.floor(days / 7); // 1 new member per week
    const completedTests = Math.floor(days / 3); // Tests every 3 days

    return {
      ...branchData,
      memberCount: branchData.memberCount + newMembers,
      thisWeekNewMembers: Math.min(newMembers, 7), // Max 7 new members shown per week
      todayTests: Math.min(completedTests % 5, branchData.memberCount), // Realistic test frequency
      avgScore: branchData.avgScore > 0 ? branchData.avgScore + (days * 0.1) : 65 // Gradual improvement
    };
  }
}

// Practical recommendations for starting a new academy
export const MANAGEMENT_RECOMMENDATIONS = {
  gettingStarted: {
    title: '🚀 신규 지점 시작하기',
    suggestions: [
      '먼저 학원 코드를 생성하여 첫 학생 모집',
      '최소 1명의 강사 등록으로 수업 준비',
      '초기 목표: 첫 달에 5명의 학생 등록'
    ]
  },
  memberGrowth: {
    title: '📈 회원 증가 전략',
    suggestions: [
      '주 1-2명의 신규 회원을 목표로 설정',
      '체험 수업을 통한 전환율 향상',
      '학원 코드 QR코드를 활용한 마케팅'
    ]
  },
  teacherManagement: {
    title: '👩‍🏫 강사 관리',
    suggestions: [
      '강사 1명당 학생 5-10명으로 시작 (점진적 확장)',
      '학생 15명 도달 시 추가 강사 고려',
      '강사별 담당 학생 수를 균등하게 배분'
    ]
  },
  initialOperations: {
    title: '⚙️ 초기 운영',
    suggestions: [
      '학생 등록 시 반드시 레벨 테스트 실시',
      'E-book 권한을 체계적으로 관리',
      '학부모와의 소통 채널 구축'
    ]
  }
};