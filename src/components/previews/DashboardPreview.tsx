import React from 'react';
import '../../styles/Dashboard.css';

export const DashboardPreview: React.FC = () => {
  const statsData = [
    {
      type: 'reading',
      title: '읽은 E-book',
      value: '12',
      label: '권',
      change: '+3',
      positive: true,
      icon: '📚'
    },
    {
      type: 'progress',
      title: '학습 진도',
      value: '78',
      label: '%',
      change: '+12%',
      positive: true,
      icon: '📈'
    },
    {
      type: 'activity',
      title: '학습 시간',
      value: '24',
      label: '시간',
      change: '+2h',
      positive: true,
      icon: '⏰'
    },
    {
      type: 'achievement',
      title: '달성 목표',
      value: '8',
      label: '개',
      change: '+1',
      positive: true,
      icon: '🏆'
    }
  ];

  const recentActivities = [
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

  const users = [
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

  return (
    <div className="dashboard-container">
      <h2>대시보드</h2>

      <div className="dashboard-header">
        <div className="welcome-text">
          <h3>안녕하세요, 김민수님!</h3>
          <p>오늘도 영어 학습을 시작해보세요.</p>
        </div>
        <div className="role-indicator student">
          <div className="role-icon">👨‍🎓</div>
          <span>학생</span>
        </div>
      </div>

      <div className="stats-cards">
        {statsData.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.type}`}>
            <div className="stat-header">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-icon">{stat.icon}</div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
              <span>{stat.positive ? '↗' : '↘'}</span>
              {stat.change}
            </div>
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
                        {user.role === 'student' ? '학생' : user.role === 'teacher' ? '교사' : '관리자'}
                      </span>
                    </td>
                    <td>{user.level}</td>
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