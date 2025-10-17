import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/UserManagement.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'inactive';
  level?: string;
  lastLogin: string;
  academy: string;
  createdAt: string;
}

interface UserStats {
  total: number;
  students: number;
  teachers: number;
  admins: number;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ total: 0, students: 0, teachers: 0, admins: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const usersPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Mock 데이터 - 실제로는 API 호출
      const mockUsers: User[] = [
        {
          id: '1',
          name: '김민수',
          email: 'minsu@example.com',
          role: 'student',
          status: 'active',
          level: 'B2',
          lastLogin: '2시간 전',
          academy: '강남캠퍼스',
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          name: '이영희',
          email: 'younghee@example.com',
          role: 'teacher',
          status: 'active',
          level: 'C2',
          lastLogin: '30분 전',
          academy: '강남캠퍼스',
          createdAt: '2024-01-10'
        },
        {
          id: '3',
          name: '박철수',
          email: 'chulsoo@example.com',
          role: 'student',
          status: 'inactive',
          level: 'A2',
          lastLogin: '3일 전',
          academy: '종로캠퍼스',
          createdAt: '2024-02-01'
        },
        {
          id: '4',
          name: '최수진',
          email: 'sujin@example.com',
          role: 'admin',
          status: 'active',
          level: 'C2',
          lastLogin: '1시간 전',
          academy: '본사',
          createdAt: '2023-12-01'
        },
        {
          id: '5',
          name: '정민호',
          email: 'minho@example.com',
          role: 'student',
          status: 'active',
          level: 'B1',
          lastLogin: '어제',
          academy: '강남캠퍼스',
          createdAt: '2024-02-15'
        }
      ];

      setUsers(mockUsers);

      // 통계 계산
      const stats: UserStats = {
        total: mockUsers.length,
        students: mockUsers.filter(u => u.role === 'student').length,
        teachers: mockUsers.filter(u => u.role === 'teacher').length,
        admins: mockUsers.filter(u => u.role === 'admin').length
      };
      setUserStats(stats);

    } catch (err) {
      setError('사용자 목록을 불러오는데 실패했습니다.');
      console.error('사용자 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    const actionText = action === 'activate' ? '활성화' : action === 'deactivate' ? '비활성화' : '삭제';
    if (window.confirm(`선택된 ${selectedUsers.length}명의 사용자를 ${actionText}하시겠습니까?`)) {
      console.log(`${actionText} 작업:`, selectedUsers);

      if (action === 'delete') {
        // 선택된 사용자들을 삭제
        setUsers(prevUsers => prevUsers.filter(user => !selectedUsers.includes(user.id)));

        // 통계 재계산
        const remainingUsers = users.filter(user => !selectedUsers.includes(user.id));
        setUserStats({
          total: remainingUsers.length,
          students: remainingUsers.filter(u => u.role === 'student').length,
          teachers: remainingUsers.filter(u => u.role === 'teacher').length,
          admins: remainingUsers.filter(u => u.role === 'admin').length
        });
      } else if (action === 'activate' || action === 'deactivate') {
        // 선택된 사용자들의 상태 변경
        const newStatus = action === 'activate' ? 'active' : 'inactive';
        setUsers(prevUsers =>
          prevUsers.map(user =>
            selectedUsers.includes(user.id) ? { ...user, status: newStatus } : user
          )
        );
      }

      setSelectedUsers([]);
    }
  };

  const handleUserAction = (userId: string, action: 'edit' | 'toggle' | 'delete') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case 'edit':
        console.log('사용자 편집:', user);
        // TODO: 편집 모달 열기
        break;
      case 'toggle':
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        console.log(`사용자 상태 변경: ${user.name} -> ${newStatus}`);

        // 상태 업데이트
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.id === userId ? { ...u, status: newStatus } : u
          )
        );
        break;
      case 'delete':
        if (window.confirm(`${user.name} 사용자를 삭제하시겠습니까?`)) {
          console.log('사용자 삭제:', user);

          // 사용자 삭제
          setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));

          // 통계 재계산
          const remainingUsers = users.filter(u => u.id !== userId);
          setUserStats({
            total: remainingUsers.length,
            students: remainingUsers.filter(u => u.role === 'student').length,
            teachers: remainingUsers.filter(u => u.role === 'teacher').length,
            admins: remainingUsers.filter(u => u.role === 'admin').length
          });
        }
        break;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return '학생';
      case 'teacher': return '교사';
      case 'admin': return '관리자';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="user-management-container">
        <div className="loading-container">
          <div>사용자 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

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
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
          <button className="add-user-btn" onClick={() => console.log('새 사용자 추가')}>
            <span>+</span>
            새 사용자 추가
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="user-stats">
        <div className="user-stat-card total">
          <div className="stat-number">{userStats.total}</div>
          <div className="stat-label">전체 사용자</div>
        </div>
        <div className="user-stat-card students">
          <div className="stat-number">{userStats.students}</div>
          <div className="stat-label">학생</div>
        </div>
        <div className="user-stat-card teachers">
          <div className="stat-number">{userStats.teachers}</div>
          <div className="stat-label">교사</div>
        </div>
        <div className="user-stat-card admins">
          <div className="stat-number">{userStats.admins}</div>
          <div className="stat-label">관리자</div>
        </div>
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
            onClick={() => handleBulkAction('activate')}
            style={{ padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            활성화
          </button>
          <button
            onClick={() => handleBulkAction('deactivate')}
            style={{ padding: '6px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            비활성화
          </button>
          <button
            onClick={() => handleBulkAction('delete')}
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
                  onChange={handleSelectAll}
                  checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
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
            {paginatedUsers.map(user => (
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
                    {getRoleDisplayName(user.role)}
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
                    <button
                      className="btn-edit"
                      onClick={() => handleUserAction(user.id, 'edit')}
                    >
                      편집
                    </button>
                    <button
                      className="btn-toggle"
                      onClick={() => handleUserAction(user.id, 'toggle')}
                    >
                      {user.status === 'active' ? '비활성화' : '활성화'}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleUserAction(user.id, 'delete')}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              이전
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={currentPage === page ? 'active' : ''}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}

            <span className="page-info">
              {(currentPage - 1) * usersPerPage + 1}-{Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              다음
            </button>
          </div>
        )}
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

export default UserManagement;