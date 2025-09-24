import React, { useState } from 'react';
import { EbookLibraryPreview } from './components/previews/EbookLibraryPreview';
import { LevelTestPreview } from './components/previews/LevelTestPreview';
import { DashboardPreview } from './components/previews/DashboardPreview';
import { LoginFormPreview } from './components/previews/LoginFormPreview';
import { UserManagementPreview } from './components/previews/UserManagementPreview';
import { RegistrationFormPreview } from './components/previews/RegistrationFormPreview';
import { EbookViewerPreview } from './components/previews/EbookViewerPreview';

type PreviewComponent = 'ebook-library' | 'ebook-viewer' | 'level-test' | 'dashboard' | 'user-management' | 'login' | 'register';

const PreviewApp: React.FC = () => {
  const [currentPreview, setCurrentPreview] = useState<PreviewComponent>('ebook-library');

  const previews = [
    { id: 'ebook-library' as const, name: 'E-book Library', emoji: '📚' },
    { id: 'ebook-viewer' as const, name: 'E-book Viewer', emoji: '📖' },
    { id: 'level-test' as const, name: 'Level Test', emoji: '📝' },
    { id: 'dashboard' as const, name: 'Dashboard', emoji: '📊' },
    { id: 'user-management' as const, name: 'User Management', emoji: '👥' },
    { id: 'login' as const, name: 'Login Form', emoji: '🔐' },
    { id: 'register' as const, name: 'Registration', emoji: '📋' }
  ];

  const renderPreview = () => {
    switch (currentPreview) {
      case 'ebook-library':
        return <EbookLibraryPreview />;
      case 'ebook-viewer':
        return <EbookViewerPreview />;
      case 'level-test':
        return <LevelTestPreview />;
      case 'dashboard':
        return <DashboardPreview />;
      case 'user-management':
        return <UserManagementPreview />;
      case 'login':
        return <LoginFormPreview />;
      case 'register':
        return <RegistrationFormPreview />;
      default:
        return <EbookLibraryPreview />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Navigation Bar */}
      <nav style={{
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            🏫 Boston Academy CSS Preview
          </h1>

          <div style={{
            display: 'flex',
            gap: '8px',
            marginLeft: 'auto'
          }}>
            {previews.map(preview => (
              <button
                key={preview.id}
                onClick={() => setCurrentPreview(preview.id)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: currentPreview === preview.id
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : '#e9ecef',
                  color: currentPreview === preview.id ? 'white' : '#495057',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseOver={(e) => {
                  if (currentPreview !== preview.id) {
                    (e.target as HTMLButtonElement).style.background = '#dee2e6';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentPreview !== preview.id) {
                    (e.target as HTMLButtonElement).style.background = '#e9ecef';
                  }
                }}
              >
                <span>{preview.emoji}</span>
                {preview.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Preview Content */}
      <main>
        {renderPreview()}
      </main>

      {/* Footer Info */}
      <footer style={{
        background: 'white',
        padding: '24px',
        marginTop: '40px',
        borderTop: '1px solid #e9ecef'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          color: '#6c757d'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#495057' }}>
            CSS 스타일 미리보기
          </h3>
          <p style={{ margin: '0 0 16px 0', lineHeight: 1.6 }}>
            위 버튼들을 클릭하여 각 컴포넌트의 CSS 스타일을 확인할 수 있습니다.
            모든 스타일은 반응형으로 설계되어 있으며, 다양한 화면 크기에서 최적화됩니다.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            fontSize: '0.85rem'
          }}>
            <span>📚 E-book Library</span>
            <span>📖 E-book Viewer</span>
            <span>📝 Level Test</span>
            <span>📊 Dashboard</span>
            <span>👥 User Management</span>
            <span>🔐 Login</span>
            <span>📋 Registration</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PreviewApp;