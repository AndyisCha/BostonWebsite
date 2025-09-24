import React, { createContext, useContext, ReactNode } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';

interface AccessibilityContextType {
  settings: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    focusVisible: boolean;
  };
  updateSetting: (key: string, value: boolean) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  getAriaLabel: (element: string, context?: string) => string;
  getFocusableElements: (container: HTMLElement) => HTMLElement[];
  trapFocus: (container: HTMLElement) => () => void;
  createSkipLink: (targetId: string, text: string) => HTMLAnchorElement;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const accessibility = useAccessibility();

  return (
    <AccessibilityContext.Provider value={accessibility}>
      {children}

      {/* Skip Links */}
      <div className="skip-links">
        <a href="#main-content" className="skip-link">
          메인 콘텐츠로 건너뛰기
        </a>
        <a href="#navigation" className="skip-link">
          네비게이션으로 건너뛰기
        </a>
        <a href="#footer" className="skip-link">
          푸터로 건너뛰기
        </a>
      </div>

      {/* Live Region for Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="live-region"
      />

      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="live-region-assertive"
      />
    </AccessibilityContext.Provider>
  );
};