import React from 'react';
import ReactDOM from 'react-dom/client';
import PreviewApp from './PreviewApp';
// import App from './App'; // 기존 App은 주석처리

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <PreviewApp />
  </React.StrictMode>
);