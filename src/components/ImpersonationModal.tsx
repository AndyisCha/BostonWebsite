import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Person,
  Warning,
  AdminPanelSettings
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  countryId?: string;
  branchId?: string;
  status: 'active' | 'inactive';
}

interface ImpersonationModalProps {
  open: boolean;
  onClose: () => void;
  onImpersonate: (userId: string) => void;
}

export const ImpersonationModal: React.FC<ImpersonationModalProps> = ({
  open,
  onClose,
  onImpersonate
}) => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 모킹 데이터 로드
  useEffect(() => {
    if (open) {
      setLoading(true);
      setTimeout(() => {
        const mockUsers: User[] = [
          {
            id: 'country-master-001',
            email: 'country@bostonacademy.kr',
            firstName: 'Andy',
            lastName: 'Country',
            role: 'COUNTRY_MASTER',
            countryId: 'KR',
            status: 'active'
          },
          {
            id: 'branch-admin-001',
            email: 'branch@bostonacademy.kr',
            firstName: 'Andy',
            lastName: 'Branch',
            role: 'BRANCH_ADMIN',
            countryId: 'KR',
            branchId: 'seoul-gangnam',
            status: 'active'
          },
          {
            id: 'teacher-001',
            email: 'teacher@bostonacademy.kr',
            firstName: 'Andy',
            lastName: 'Teacher',
            role: 'TEACHER',
            countryId: 'KR',
            branchId: 'seoul-gangnam',
            status: 'active'
          },
          {
            id: 'parent-001',
            email: 'parent@bostonacademy.kr',
            firstName: 'Andy',
            lastName: 'Parent',
            role: 'PARENT',
            countryId: 'KR',
            branchId: 'seoul-gangnam',
            status: 'active'
          },
          {
            id: 'student-001',
            email: 'student@bostonacademy.kr',
            firstName: 'Andy',
            lastName: 'Student',
            role: 'STUDENT',
            countryId: 'KR',
            branchId: 'seoul-gangnam',
            status: 'active'
          },
          {
            id: 'student-002',
            email: 'minsu@example.com',
            firstName: '김',
            lastName: '민수',
            role: 'STUDENT',
            countryId: 'KR',
            branchId: 'seoul-gangnam',
            status: 'active'
          }
        ];

        // 현재 사용자는 제외
        const availableUsers = mockUsers.filter(u => u.id !== currentUser?.id);
        setUsers(availableUsers);
        setFilteredUsers(availableUsers);
        setLoading(false);
      }, 1000);
    }
  }, [open, currentUser?.id]);

  // 검색 필터링
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const getRoleDisplayName = (role: string): string => {
    const roleNames: Record<string, string> = {
      'SUPER_MASTER': '최고 관리자',
      'COUNTRY_MASTER': '국가 관리자',
      'BRANCH_ADMIN': '지점 관리자',
      'TEACHER': '강사',
      'PARENT': '부모',
      'STUDENT': '학생'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, any> = {
      'SUPER_MASTER': 'error',
      'COUNTRY_MASTER': 'warning',
      'BRANCH_ADMIN': 'info',
      'TEACHER': 'success',
      'PARENT': 'secondary',
      'STUDENT': 'primary'
    };
    return colors[role] || 'default';
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleImpersonate = () => {
    if (selectedUser) {
      onImpersonate(selectedUser.id);
      onClose();
      setSelectedUser(null);
      setSearchTerm('');
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedUser(null);
    setSearchTerm('');
  };

  const canImpersonate = (targetRole: string): boolean => {
    if (!currentUser) return false;

    // SUPER_MASTER만 대행접속 가능
    return currentUser.role === 'SUPER_MASTER';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AdminPanelSettings color="warning" />
        대행접속 (Impersonation)
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
            ⚠️ 중요한 보안 기능입니다
          </Typography>
          <Typography variant="body2">
            • 대행접속은 사용자 문제 해결이나 시스템 관리 목적으로만 사용하세요<br/>
            • 모든 대행접속 활동은 감사 로그에 기록됩니다<br/>
            • 대행접속 중에는 상단에 경고 배너가 표시됩니다
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="이메일 또는 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredUsers.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem
                  button
                  onClick={() => handleUserSelect(user)}
                  selected={selectedUser?.id === user.id}
                  disabled={!canImpersonate(user.role)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    border: selectedUser?.id === user.id ? '2px solid' : '1px solid',
                    borderColor: selectedUser?.id === user.id ? 'primary.main' : 'grey.300',
                    opacity: canImpersonate(user.role) ? 1 : 0.5
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {user.firstName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Chip
                          label={getRoleDisplayName(user.role)}
                          size="small"
                          color={getRoleColor(user.role)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                        {user.branchId && (
                          <Typography variant="caption" color="text.secondary">
                            지점: {user.branchId}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  {!canImpersonate(user.role) && (
                    <Warning color="error" fontSize="small" />
                  )}
                </ListItem>
                {index < filteredUsers.length - 1 && <Divider />}
              </React.Fragment>
            ))}

            {filteredUsers.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? '검색 결과가 없습니다' : '대행접속 가능한 사용자가 없습니다'}
                </Typography>
              </Box>
            )}
          </List>
        )}

        {selectedUser && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> 계정으로 대행접속하시겠습니까?
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          취소
        </Button>
        <Button
          onClick={handleImpersonate}
          disabled={!selectedUser || !canImpersonate(selectedUser.role)}
          variant="contained"
          color="warning"
          startIcon={<AdminPanelSettings />}
        >
          대행접속 시작
        </Button>
      </DialogActions>
    </Dialog>
  );
};