import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Quiz,
  MenuBook,
  People,
  ExitToApp,
  Person,
  Security,
  AdminPanelSettings,
  QrCode,
  History
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ImpersonationBanner } from './ImpersonationBanner';
import { ImpersonationModal } from './ImpersonationModal';
import { ThemeToggleButton } from '../theme';

const DRAWER_WIDTH = 240;

const Layout: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [impersonationModalOpen, setImpersonationModalOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, logout, hasRole, impersonate } = useAuth();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const menuItems = [
    {
      text: '대시보드',
      icon: <Dashboard />,
      path: '/dashboard',
      roles: ['SUPER_MASTER', 'COUNTRY_MASTER', 'BRANCH_ADMIN', 'TEACHER', 'PARENT', 'STUDENT']
    },
    {
      text: '레벨 테스트',
      icon: <Quiz />,
      path: '/level-test',
      roles: ['STUDENT']
    },
    {
      text: 'E-book 라이브러리',
      icon: <MenuBook />,
      path: '/ebooks',
      roles: ['STUDENT', 'TEACHER', 'PARENT', 'BRANCH_ADMIN']
    },
    {
      text: 'E-book 파일 관리',
      icon: <MenuBook />,
      path: '/ebook-files',
      roles: ['SUPER_MASTER', 'COUNTRY_MASTER']
    },
    {
      text: '사용자 관리',
      icon: <People />,
      path: '/users',
      roles: ['SUPER_MASTER', 'COUNTRY_MASTER', 'BRANCH_ADMIN', 'TEACHER']
    },
    {
      text: '학원 코드 관리',
      icon: <QrCode />,
      path: '/academy-codes',
      roles: ['SUPER_MASTER', 'COUNTRY_MASTER', 'BRANCH_ADMIN']
    },
    {
      text: '권한 매트릭스',
      icon: <Security />,
      path: '/permissions',
      roles: ['SUPER_MASTER', 'COUNTRY_MASTER', 'BRANCH_ADMIN']
    },
    {
      text: '감사 로그',
      icon: <History />,
      path: '/audit-logs',
      roles: ['SUPER_MASTER', 'COUNTRY_MASTER']
    },
    {
      text: '🎨 디자인 시스템',
      icon: <AdminPanelSettings />,
      path: '/theme-preview',
      roles: ['SUPER_MASTER']
    }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    hasRole(item.roles)
  );

  const getRoleDisplayName = (role: string): string => {
    const roleNames: Record<string, string> = {
      'SUPER_MASTER': '최고 관리자',
      'COUNTRY_MASTER': '국가 관리자',
      'BRANCH_ADMIN': '지점 관리자',
      'TEACHER': '강사',
      'PARENT': '학부모',
      'STUDENT': '학생'
    };
    return roleNames[role] || role;
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Boston English
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.email
            }
            <Typography variant="caption" display="block">
              {getRoleDisplayName(user?.role || '')}
            </Typography>
          </Typography>

          {/* 테마 전환 버튼 */}
          <ThemeToggleButton size="medium" />

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              <Person />
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {user?.role === 'SUPER_MASTER' && (
          <MenuItem onClick={() => {
            setImpersonationModalOpen(true);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <AdminPanelSettings fontSize="small" />
            </ListItemIcon>
            대행접속
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          로그아웃
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />

        {/* 대행접속 경고 배너 */}
        <ImpersonationBanner
          onEndImpersonation={() => {
            // 원래 계정으로 복귀
            const originalUser = localStorage.getItem('user');
            const originalToken = localStorage.getItem('token');

            if (originalUser && originalToken) {
              window.location.reload(); // 간단한 복귀 방법
            }
          }}
        />

        <Outlet />
      </Box>

      {/* 대행접속 모달 */}
      <ImpersonationModal
        open={impersonationModalOpen}
        onClose={() => setImpersonationModalOpen(false)}
        onImpersonate={async (userId) => {
          try {
            await impersonate(userId);
            navigate('/dashboard');
          } catch (error) {
            console.error('Impersonation failed:', error);
          }
        }}
      />
    </Box>
  );
};

export default Layout;