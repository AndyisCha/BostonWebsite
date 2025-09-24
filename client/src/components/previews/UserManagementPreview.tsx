import React, { useState } from 'react';
import '../../styles/UserManagement.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'inactive';
  level?: string;
  lastLogin: string;
  academy: string;
}

export const UserManagementPreview: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const users: User[] = [
    {
      id: '1',
      name: '김민수',
      email: 'minsu@example.com',
      role: 'student',
      status: 'active',
      level: 'B2',
      lastLogin: '2시간 전',
      academy: '강남캠퍼스'
    },
    {
      id: '2',
      name: '이영희',
      email: 'younghee@example.com',
      role: 'teacher',
      status: 'active',
      level: 'C2',
      lastLogin: '30분 전',
      academy: '강남캠퍼스'
    },
    {
      id: '3',
      name: '박철수',
      email: 'chulsoo@example.com',
      role: 'student',
      status: 'inactive',
      level: 'A2',
      lastLogin: '3일 전',
      academy: '종로캠퍼스'
    },
    {
      id: '4',
      name: '최수진',
      email: 'sujin@example.com',
      role: 'admin',
      status: 'active',
      level: 'C2',
      lastLogin: '1시간 전',
      academy: '본사'
    },
    {
      id: '5',
      name: '정민호',
      email: 'minho@example.com',
      role: 'student',
      status: 'active',
      level: 'B1',
      lastLogin: '어제',
      academy: '강남캠퍼스'
    },
    {
      id: '6',
      name: '송하나',
      email: 'hana@example.com',
      role: 'teacher',
      status: 'active',
      level: 'C1',
      lastLogin: '2시간 전',
      academy: '종로캠퍼스'
    }
  ];

  const statsData = [
    { type: 'total', number: users.length, label: '전체 사용자' },
    { type: 'students', number: users.filter(u => u.role === 'student').length, label: '학생' },
    { type: 'teachers', number: users.filter(u => u.role === 'teacher').length, label: '교사' },
    { type: 'admins', number: users.filter(u => u.role === 'admin').length, label: '관리자' }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = (action: string) => {
    alert(`${action} 작업을 ${selectedUsers.length}명의 사용자에게 적용합니다.`);
    setSelectedUsers([]);
  };

  return (
    <div className="user-management-container">
      <h2>사용자 관리</h2>

      <div className="user-management-header">
        <div className="header-title">
          <h3>사용자 목록</h3>
          <p>시스템에 등록된 모든 사용자를 관리할 수 있습니다.</p>
        </div>
        <div className="header-actions">
          <input
            type="text"
            className="search-input"
            placeholder="사용자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">모든 역할</option>
            <option value="student">학생</option>
            <option value="teacher">교사</option>
            <option value="admin">관리자</option>
          </select>
          <button className="add-user-btn">
            <span>+</span>
            새 사용자 추가
          </button>
        </div>
      </div>

      <div className="user-stats">
        {statsData.map((stat, index) => (
          <div key={index} className={`user-stat-card ${stat.type}`}>
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {selectedUsers.length > 0 && (
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <span style={{ color: '#495057', fontWeight: 600 }}>
            {selectedUsers.length}명 선택됨
          </span>
          <button
            onClick={() => handleBulkAction('활성화')}
            style={{ padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            활성화
          </button>
          <button
            onClick={() => handleBulkAction('비활성화')}
            style={{ padding: '6px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            비활성화
          </button>
          <button
            onClick={() => handleBulkAction('삭제')}
            style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            삭제
          </button>
        </div>
      )}

      <div className="user-list">
        <h3>사용자 목록 ({filteredUsers.length}명)</h3>

        <table className="user-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(filteredUsers.map(u => u.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                />
              </th>
              <th>사용자</th>
              <th>역할</th>
              <th>레벨</th>
              <th>상태</th>
              <th>최근 로그인</th>
              <th>캠퍼스</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                  />
                </td>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name.charAt(0)}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'student' ? '학생' :
                     user.role === 'teacher' ? '교사' : '관리자'}
                  </span>
                </td>
                <td>{user.level || '-'}</td>
                <td>
                  <span className={`status-indicator ${user.status}`}>
                    <span className="status-dot"></span>
                    {user.status === 'active' ? '활성' : '비활성'}
                  </span>
                </td>
                <td>{user.lastLogin}</td>
                <td>{user.academy}</td>
                <td>
                  <div className="user-actions">
                    <button className="btn-edit">편집</button>
                    <button className="btn-toggle">
                      {user.status === 'active' ? '비활성화' : '활성화'}
                    </button>
                    <button className="btn-delete">삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            이전
          </button>
          <button className="active">1</button>
          <button>2</button>
          <button>3</button>
          <span className="page-info">1-6 of 6 users</span>
          <button
            disabled={true}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            다음
          </button>
        </div>
      </div>

      <div className="permissions-panel">
        <h3>권한 관리</h3>
        <div className="permissions-grid">
          <div className="permission-group">
            <h4>E-book 관리</h4>
            <div className="permission-item">
              <input type="checkbox" id="ebook-read" defaultChecked />
              <label htmlFor="ebook-read">E-book 읽기</label>
            </div>
            <div className="permission-item">
              <input type="checkbox" id="ebook-create" />
              <label htmlFor="ebook-create">E-book 생성</label>
            </div>
            <div className="permission-item">
              <input type="checkbox" id="ebook-edit" />
              <label htmlFor="ebook-edit">E-book 편집</label>
            </div>
          </div>

          <div className="permission-group">
            <h4>사용자 관리</h4>
            <div className="permission-item">
              <input type="checkbox" id="user-view" defaultChecked />
              <label htmlFor="user-view">사용자 조회</label>
            </div>
            <div className="permission-item">
              <input type="checkbox" id="user-create" />
              <label htmlFor="user-create">사용자 생성</label>
            </div>
            <div className="permission-item">
              <input type="checkbox" id="user-edit" />
              <label htmlFor="user-edit">사용자 편집</label>
            </div>
          </div>

          <div className="permission-group">
            <h4>시스템 관리</h4>
            <div className="permission-item">
              <input type="checkbox" id="system-settings" />
              <label htmlFor="system-settings">시스템 설정</label>
            </div>
            <div className="permission-item">
              <input type="checkbox" id="system-backup" />
              <label htmlFor="system-backup">백업 관리</label>
            </div>
            <div className="permission-item">
              <input type="checkbox" id="system-logs" />
              <label htmlFor="system-logs">로그 조회</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};