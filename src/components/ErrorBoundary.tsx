import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Alert, Collapse,
  IconButton, Divider, Chip
} from '@mui/material';
import {
  ErrorOutline, Refresh, BugReport, ExpandMore, ExpandLess,
  Home, Support, Warning
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to a logging service like Sentry
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Example: Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // this.sendToMonitoringService(error, errorInfo);
    }
  };

  private handleRetry = () => {
    const { retryCount } = this.state;

    if (retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        showDetails: false,
        retryCount: retryCount + 1
      });
    } else {
      // Redirect to home or show contact support
      window.location.href = '/';
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Open email client with pre-filled bug report
    const subject = encodeURIComponent('Bug Report - Application Error');
    const body = encodeURIComponent(`
Please describe what you were doing when this error occurred:

[Your description here]

Technical Details:
${JSON.stringify(errorReport, null, 2)}
    `);

    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  private getErrorSeverity = (error: Error): 'error' | 'warning' => {
    // Determine severity based on error type
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'warning';
    }
    return 'error';
  };

  private getErrorTitle = (error: Error): string => {
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return '페이지 로딩 오류';
    }
    if (error.message.includes('Network Error')) {
      return '네트워크 오류';
    }
    return '애플리케이션 오류';
  };

  private getErrorDescription = (error: Error): string => {
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return '페이지를 로드하는 중 오류가 발생했습니다. 새로고침해 주세요.';
    }
    if (error.message.includes('Network Error')) {
      return '네트워크 연결을 확인하고 다시 시도해 주세요.';
    }
    return '예상치 못한 오류가 발생했습니다.';
  };

  render() {
    const { hasError, error, errorInfo, showDetails, retryCount } = this.state;

    if (hasError && error) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const severity = this.getErrorSeverity(error);
      const title = this.getErrorTitle(error);
      const description = this.getErrorDescription(error);

      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: 3
          }}
        >
          <Card
            sx={{
              maxWidth: 600,
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              borderRadius: '16px'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Error Icon and Title */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <ErrorOutline
                  sx={{
                    fontSize: 64,
                    color: severity === 'error' ? 'error.main' : 'warning.main',
                    mb: 2
                  }}
                />
                <Typography variant="h4" gutterBottom>
                  {title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {description}
                </Typography>
              </Box>

              {/* Error Severity Chip */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Chip
                  icon={severity === 'error' ? <ErrorOutline /> : <Warning />}
                  label={severity === 'error' ? '심각한 오류' : '일시적 오류'}
                  color={severity === 'error' ? 'error' : 'warning'}
                  variant="outlined"
                />
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                  disabled={retryCount >= this.maxRetries}
                  fullWidth={retryCount >= this.maxRetries}
                >
                  {retryCount < this.maxRetries ? `다시 시도 (${retryCount}/${this.maxRetries})` : '최대 재시도 횟수 초과'}
                </Button>

                {retryCount >= this.maxRetries && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<Home />}
                      onClick={this.handleGoHome}
                      sx={{ flex: 1 }}
                    >
                      홈으로 이동
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Support />}
                      onClick={this.handleReportBug}
                      sx={{ flex: 1 }}
                    >
                      문제 신고
                    </Button>
                  </>
                )}
              </Box>

              {/* Error Details Section */}
              <Divider sx={{ my: 2 }} />

              <Box>
                <Button
                  onClick={this.toggleDetails}
                  startIcon={<BugReport />}
                  endIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
                  variant="text"
                  size="small"
                >
                  기술적 세부사항 {showDetails ? '숨기기' : '보기'}
                </Button>

                <Collapse in={showDetails}>
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      아래 정보는 개발자가 문제를 해결하는 데 도움이 됩니다.
                    </Alert>

                    <Typography variant="h6" gutterBottom>
                      오류 정보
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="error">
                        오류 이름:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                        {error.name}
                      </Typography>

                      <Typography variant="subtitle2" color="error">
                        오류 메시지:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                        {error.message}
                      </Typography>

                      {error.stack && (
                        <>
                          <Typography variant="subtitle2" color="error">
                            스택 추적:
                          </Typography>
                          <Box
                            sx={{
                              maxHeight: 200,
                              overflow: 'auto',
                              bgcolor: 'grey.100',
                              p: 1,
                              borderRadius: 1,
                              fontFamily: 'monospace',
                              fontSize: '0.75rem'
                            }}
                          >
                            <pre>{error.stack}</pre>
                          </Box>
                        </>
                      )}
                    </Box>

                    {errorInfo && (
                      <Box>
                        <Typography variant="subtitle2" color="error">
                          컴포넌트 스택:
                        </Typography>
                        <Box
                          sx={{
                            maxHeight: 150,
                            overflow: 'auto',
                            bgcolor: 'grey.100',
                            p: 1,
                            borderRadius: 1,
                            fontFamily: 'monospace',
                            fontSize: '0.75rem'
                          }}
                        >
                          <pre>{errorInfo.componentStack}</pre>
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ mt: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
                      <Typography variant="caption">
                        시간: {new Date().toLocaleString()}
                      </Typography>
                      <br />
                      <Typography variant="caption">
                        URL: {window.location.href}
                      </Typography>
                      <br />
                      <Typography variant="caption">
                        사용자 에이전트: {navigator.userAgent}
                      </Typography>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;