import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import PreviewApp from './PreviewApp';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ========================================
// 접근성 테스트 (개발 모드 전용)
// ========================================

if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000, {
      // 접근성 검사 규칙 설정
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
        {
          id: 'image-alt',
          enabled: true,
        },
        {
          id: 'label',
          enabled: true,
        },
        {
          id: 'valid-lang',
          enabled: true,
        },
        {
          id: 'aria-allowed-attr',
          enabled: true,
        },
        {
          id: 'aria-required-attr',
          enabled: true,
        },
        {
          id: 'aria-valid-attr-value',
          enabled: true,
        },
        {
          id: 'button-name',
          enabled: true,
        },
        {
          id: 'duplicate-id',
          enabled: true,
        },
        {
          id: 'heading-order',
          enabled: true,
        },
        {
          id: 'link-name',
          enabled: true,
        },
        {
          id: 'list',
          enabled: true,
        },
        {
          id: 'listitem',
          enabled: true,
        },
      ],
    });
  });
}