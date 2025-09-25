import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

interface StatCard {
  type: 'reading' | 'progress' | 'activity' | 'achievement';
  title: string;
  value: number;
  label: string;
  change: string;
  positive: boolean;
  icon: string;
  target?: number;
  description?: string;
}

interface Activity {
  type: 'reading' | 'test' | 'progress';
  title: string;
  time: string;
  icon: string;
}

interface User {
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'inactive';
  level?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatCard[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [animatedValues, setAnimatedValues] = useState<{[key: string]: number}>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<string[]>([]);

  // 실시간 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 카운트 애니메이션 훅
  const animateValue = useCallback((key: string, targetValue: number, duration: number = 2000) => {
    const startValue = animatedValues[key] || 0;
    const increment = (targetValue - startValue) / (duration / 16);
    let currentValue = startValue;

    const timer = setInterval(() => {
      currentValue += increment;
      if ((increment > 0 && currentValue >= targetValue) ||
          (increment < 0 && currentValue <= targetValue)) {
        currentValue = targetValue;
        clearInterval(timer);
      }
      setAnimatedValues(prev => ({ ...prev, [key]: Math.round(currentValue) }));
    }, 16);
  }, [animatedValues]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 통계 데이터 로드 (개선된 버전)
      const stats: StatCard[] = [
        {
          type: 'reading',
          title: '읽은 E-book',
          value: 12,
          label: '권',
          change: '+3',
          positive: true,
          icon: '📚',
          target: 15,
          description: '이번 달 목표: 15권'
        },
        {
          type: 'progress',
          title: '학습 진도',
          value: 78,
          label: '%',
          change: '+12%',
          positive: true,
          icon: '📈',
          target: 100,
          description: '전체 코스 진행률'
        },
        {
          type: 'activity',
          title: '학습 시간',
          value: 24,
          label: '시간',
          change: '+2h',
          positive: true,
          icon: '⏰',
          target: 30,
          description: '이번 주 누적 시간'
        },
        {
          type: 'achievement',
          title: '달성 목표',
          value: 8,
          label: '개',
          change: '+1',
          positive: true,
          icon: '🏆',
          target: 10,
          description: '이번 달 성취도'
        }
      ];

      // 최근 활동 데이터
      const activities: Activity[] = [
        {
          type: 'reading',
          title: 'Elementary Grammar Book 완료',
          time: '2시간 전',
          icon: '📖'
        },
        {
          type: 'test',
          title: 'B1 레벨 테스트 통과',
          time: '1일 전',
          icon: '✅'
        },
        {
          type: 'progress',
          title: 'Intermediate Reading 50% 진행',
          time: '2일 전',
          icon: '📊'
        },
        {
          type: 'reading',
          title: 'Conversation Practice 시작',
          time: '3일 전',
          icon: '💬'
        }
      ];

      // 사용자 데이터 (관리자/교사용)
      const userData: User[] = [
        {
          name: '김민수',
          email: 'minsu@example.com',
          role: 'student',
          status: 'active',
          level: 'B2'
        },
        {
          name: '이영희',
          email: 'younghee@example.com',
          role: 'teacher',
          status: 'active',
          level: 'C2'
        },
        {
          name: '박철수',
          email: 'chulsoo@example.com',
          role: 'student',
          status: 'inactive',
          level: 'A2'
        }
      ];

      setStatsData(stats);
      setRecentActivities(activities);
      setUsers(userData);

      // 애니메이션 시작
      setTimeout(() => {
        stats.forEach((stat, index) => {
          animateValue(stat.type, stat.value, 1500 + (index * 200));
        });
      }, 500);

      // 알림 시뮬레이션
      const notifications = [
        '새로운 E-book이 추가되었습니다!',
        '레벨 테스트 결과가 준비되었습니다.',
        '이번 주 학습 목표를 80% 달성했습니다!'
      ];
      setNotifications(notifications);

    } catch (error) {
      console.error('Dashboard 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (cardType: string) => {
    setSelectedCard(selectedCard === cardType ? null : cardType);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '좋은 아침입니다';
    if (hour < 18) return '안녕하세요';
    return '좋은 저녁입니다';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return '학생';
      case 'teacher': return '교사';
      case 'admin': return '관리자';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return '👨‍🎓';
      case 'teacher': return '👩‍🏫';
      case 'admin': return '👨‍💼';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <div>대시보드를 로드하는 중...</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            개인화된 학습 데이터를 준비하고 있습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container fade-in">
      {/* Enhanced Header with Time and Notifications */}
      <div className="dashboard-top-bar">
        <div className="dashboard-title">
          <h2 className="gradient-text">학습 대시보드</h2>
          <div className="current-time">
            {formatTime(currentTime)}
          </div>
        </div>
        <div className="dashboard-notifications">
          {notifications.length > 0 && (
            <div className="notification-badge pulse">
              {notifications.length}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Welcome Section */}
      <div className="dashboard-header fade-in-up">
        <div className="welcome-text">
          <h3>{getGreeting()}, {(user as any)?.name || user?.email?.split('@')[0] || '사용자'}님!</h3>
          <p>오늘도 영어 학습을 시작해보세요. 현재 시간: {formatTime(currentTime)}</p>
          <div className="weather-widget">
            <span>🌤️</span>
            <span>학습하기 좋은 날씨입니다!</span>
          </div>
        </div>
        <div className={`role-indicator ${user?.role || 'student'}`}>
          <div className="role-icon">{getRoleIcon(user?.role || 'student')}</div>
          <span>{getRoleDisplayName(user?.role || 'student')}</span>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="stats-cards fade-in-up">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={`stat-card ${stat.type} ${selectedCard === stat.type ? 'selected' : ''}`}
            onClick={() => handleCardClick(stat.type)}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="stat-header">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-icon">{stat.icon}</div>
            </div>
            <div className="stat-value">
              {animatedValues[stat.type] || 0}
              <span className="stat-label">{stat.label}</span>
            </div>
            <div className="stat-progress">
              <div className="progress-bar-small">
                <div
                  className="progress-fill"
                  style={{
                    width: `${stat.target ? (stat.value / stat.target) * 100 : 100}%`,
                    transitionDelay: `${index * 200}ms`
                  }}
                />
              </div>
              <div className="stat-target">
                {stat.target && `/ ${stat.target}${stat.label}`}
              </div>
            </div>
            <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
              <span>{stat.positive ? '📈' : '📉'}</span>
              {stat.change}
            </div>
            {selectedCard === stat.type && (
              <div className="stat-details fade-in">
                <p>{stat.description}</p>
                <div className="detail-actions">
                  <button className="detail-btn">자세히 보기</button>
                  <button className="detail-btn">목표 수정</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="main-content">
          <div className="content-card">
            <h3>최근 활동</h3>
            <div className="recent-activity">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card">
            <h3>학습 진도</h3>
            <div className="progress-chart">
              {[65, 78, 45, 89, 67, 92, 78].map((height, index) => (
                <div
                  key={index}
                  className="progress-bar"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <div className="content-card">
              <h3>사용자 관리</h3>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>사용자</th>
                    <th>역할</th>
                    <th>레벨</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div>{user.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td>{user.level || '-'}</td>
                      <td>
                        <span className={user.status === 'active' ? 'text-success' : 'text-muted'}>
                          {user.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="sidebar-content">
          <div className="content-card">
            <h3>빠른 실행</h3>
            <div className="quick-actions">
              <button className="quick-action-btn">
                <span className="btn-icon">📖</span>
                새 E-book
              </button>
              <button className="quick-action-btn">
                <span className="btn-icon">📝</span>
                레벨 테스트
              </button>
              <button className="quick-action-btn">
                <span className="btn-icon">👥</span>
                사용자 관리
              </button>
              <button className="quick-action-btn">
                <span className="btn-icon">📊</span>
                통계 보기
              </button>
            </div>
          </div>

          <div className="content-card">
            <h3>이번 주 목표</h3>
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>E-book 읽기</span>
                  <span>3/5권</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e9ecef', borderRadius: '3px' }}>
                  <div style={{ width: '60%', height: '100%', background: '#28a745', borderRadius: '3px' }} />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>학습 시간</span>
                  <span>8/10시간</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e9ecef', borderRadius: '3px' }}>
                  <div style={{ width: '80%', height: '100%', background: '#007bff', borderRadius: '3px' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>테스트 완료</span>
                  <span>2/3개</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e9ecef', borderRadius: '3px' }}>
                  <div style={{ width: '67%', height: '100%', background: '#ffc107', borderRadius: '3px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;