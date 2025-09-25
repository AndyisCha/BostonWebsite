import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  countryId?: string;
  branchId?: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  impersonate: (targetUserId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  academyCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios 인터셉터 설정
const setupAxiosInterceptors = (token: string | null) => {
  // Request interceptor
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  axios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 토큰과 사용자 정보 복원
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        setupAxiosInterceptors(savedToken);

        // 토큰 유효성 검증
        verifyToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        logout();
      }
    } else {
      setupAxiosInterceptors(null);
    }

    setLoading(false);
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });

      setUser(response.data.user);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);

    // 테스트용 관리자 계정 - Andy (SUPER_MASTER)
    if (email === 'andy@boston.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-andy-001',
        email: 'andy@boston.com',
        role: 'SUPER_MASTER',
        firstName: 'Andy',
        lastName: 'Administrator',
        countryId: 'KR',
        branchId: 'main',
        permissions: [
          'user.create',
          'user.read',
          'user.update',
          'user.delete',
          'ebook.manage',
          'system.admin',
          'analytics.view',
          'content.manage',
          'branch.manage',
          'country.manage'
        ]
      };

      const adminToken = 'admin-token-' + Date.now();

      setUser(adminUser);
      setToken(adminToken);

      localStorage.setItem('token', adminToken);
      localStorage.setItem('user', JSON.stringify(adminUser));

      setupAxiosInterceptors(adminToken);
      setLoading(false);
      return;
    }

    // 테스트용 학생 계정 - Student (STUDENT)
    if (email === 'student@boston.com' && password === 'student123') {
      const studentUser: User = {
        id: 'student-001',
        email: 'student@boston.com',
        role: 'STUDENT',
        firstName: '학생',
        lastName: '테스트',
        countryId: 'KR',
        branchId: 'seoul-branch',
        permissions: [
          'ebook.read',
          'test.take',
          'progress.view'
        ]
      };

      const studentToken = 'student-token-' + Date.now();

      setUser(studentUser);
      setToken(studentToken);

      localStorage.setItem('token', studentToken);
      localStorage.setItem('user', JSON.stringify(studentUser));

      setupAxiosInterceptors(studentToken);
      setLoading(false);
      return;
    }

    // 일반 API 로그인
    try {
      const response = await axios.post('/api/auth/login', { email, password });

      const { user: userData, token: userToken } = response.data;

      setUser(userData);
      setToken(userToken);

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setupAxiosInterceptors(userToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      await axios.post('/api/auth/register', userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setupAxiosInterceptors(null);
  };

  const impersonate = async (targetUserId: string) => {
    try {
      const response = await axios.post('/api/auth/impersonate', { targetUserId });

      const { user: userData, token: userToken } = response.data;

      setUser({ ...userData, impersonatedBy: user?.id });
      setToken(userToken);

      // 대행접속은 세션 스토리지에 저장 (탭 닫으면 사라짐)
      sessionStorage.setItem('impersonation_token', userToken);
      sessionStorage.setItem('impersonation_user', JSON.stringify(userData));

      setupAxiosInterceptors(userToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Impersonation failed');
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    impersonate,
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};