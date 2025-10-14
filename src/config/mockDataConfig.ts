// Central configuration to control mock data
// Set ENABLE_MOCK_DATA to false to show completely empty academy

export const MOCK_DATA_CONFIG = {
  // Master switch - set to false to disable ALL mock data
  ENABLE_MOCK_DATA: false,

  // Individual switches (only used if ENABLE_MOCK_DATA is true)
  SHOW_MOCK_MEMBERS: false,
  SHOW_MOCK_TEACHERS: false,
  SHOW_MOCK_TESTS: false,
  SHOW_MOCK_SCORES: false,
  SHOW_MOCK_OUTSIDE_USERS: false,
  SHOW_MOCK_EBOOKS: false,
  SHOW_MOCK_USAGE_DATA: false
};

// Helper functions to get empty data when mock is disabled
export const getMockMembers = () => MOCK_DATA_CONFIG.ENABLE_MOCK_DATA ? [] : [];
export const getMockTeachers = () => MOCK_DATA_CONFIG.ENABLE_MOCK_DATA ? [] : [];
export const getMockTests = () => MOCK_DATA_CONFIG.ENABLE_MOCK_DATA ? [] : [];
export const getMockScore = () => MOCK_DATA_CONFIG.ENABLE_MOCK_DATA ? 0 : 0;
export const getMockOutsideUsers = () => MOCK_DATA_CONFIG.ENABLE_MOCK_DATA ? 0 : 0;
export const getMockEbooks = () => MOCK_DATA_CONFIG.ENABLE_MOCK_DATA ? [] : [];

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  NO_MEMBERS: {
    title: "🎓 아직 등록된 회원이 없습니다",
    description: "학원 코드를 생성하여 첫 회원을 모집해보세요",
    action: "학원 코드 생성하기"
  },
  NO_TEACHERS: {
    title: "👩‍🏫 아직 등록된 강사가 없습니다",
    description: "강사를 추가하여 학원 운영을 시작하세요",
    action: "강사 추가하기"
  },
  NO_TESTS: {
    title: "📝 아직 실시된 테스트가 없습니다",
    description: "학생이 등록되면 레벨 테스트를 진행할 수 있습니다",
    action: "테스트 관리"
  },
  NO_STUDENTS_FOR_TEACHER: {
    title: "📚 담당 학생이 아직 없습니다",
    description: "학생이 배정되면 여기서 관리할 수 있습니다",
    action: "학생 관리 요청"
  },
  NO_CHILDREN_FOR_PARENT: {
    title: "👨‍👩‍👧‍👦 등록된 자녀가 없습니다",
    description: "자녀를 등록하면 학습 현황을 확인할 수 있습니다",
    action: "자녀 등록하기"
  }
};