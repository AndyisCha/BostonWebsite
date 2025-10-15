/**
 * 테마 프리뷰 컴포넌트
 *
 * 디자인 토큰들을 시각화하여 확인
 * 개발 모드에서만 사용
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Favorite,
  Share,
  Star,
  BookmarkBorder,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import {
  brandColors,
  lightModeColors,
  darkModeColors,
  cefrLevelColors,
  useBostonTheme,
} from '../../theme';
import { fontSizes, fontWeights } from '../../theme/tokens/typography';
import { spacing, borderRadius } from '../../theme/tokens/spacing';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`theme-tabpanel-${index}`}
      aria-labelledby={`theme-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ThemePreview: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { mode, toggleMode } = useBostonTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 색상 스와치 컴포넌트
  const ColorSwatch: React.FC<{ name: string; color: string }> = ({
    name,
    color,
  }) => (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          backgroundColor: color,
          borderRadius: borderRadius.lg,
          mb: 1,
          border: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      />
      <Typography variant="caption" display="block" fontWeight={fontWeights.medium}>
        {name}
      </Typography>
      <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
        {color}
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" gutterBottom fontWeight={fontWeights.bold}>
            🎨 보스턴어학원 디자인 시스템
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Design Tokens Preview - 색상, 타이포그래피, 컴포넌트 미리보기
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={mode === 'dark'}
              onChange={toggleMode}
              icon={<Brightness7 />}
              checkedIcon={<Brightness4 />}
            />
          }
          label={mode === 'dark' ? '다크 모드' : '라이트 모드'}
        />
      </Box>

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="색상 (Colors)" />
          <Tab label="타이포그래피 (Typography)" />
          <Tab label="간격 & 레이아웃 (Spacing)" />
          <Tab label="컴포넌트 (Components)" />
        </Tabs>
      </Box>

      {/* 탭 1: 색상 */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
          {/* 브랜드 색상 */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom fontWeight={fontWeights.semibold}>
              브랜드 색상
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item>
                <ColorSwatch name="Lavender Mist" color={brandColors.lavenderMist} />
              </Grid>
              <Grid item>
                <ColorSwatch name="Deep Indigo" color={brandColors.deepIndigo} />
              </Grid>
              <Grid item>
                <ColorSwatch name="Slate Purple" color={brandColors.slatePurple} />
              </Grid>
              <Grid item>
                <ColorSwatch name="Midnight Blue" color={brandColors.midnightBlue} />
              </Grid>
              <Grid item>
                <ColorSwatch name="Soft White" color={brandColors.softWhite} />
              </Grid>
            </Grid>
          </Grid>

          {/* Primary / Secondary */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom fontWeight={fontWeights.semibold}>
              Primary / Secondary
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item>
                <ColorSwatch name="Primary Main" color={lightModeColors.primary.main} />
              </Grid>
              <Grid item>
                <ColorSwatch name="Primary Light" color={lightModeColors.primary.light} />
              </Grid>
              <Grid item>
                <ColorSwatch name="Primary Dark" color={lightModeColors.primary.dark} />
              </Grid>
              <Grid item>
                <ColorSwatch name="Secondary Main" color={lightModeColors.secondary.main} />
              </Grid>
            </Grid>
          </Grid>

          {/* Semantic Colors */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom fontWeight={fontWeights.semibold}>
              Semantic Colors
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item>
                <ColorSwatch name="Success" color={lightModeColors.success.main} />
              </Grid>
              <Grid item>
                <ColorSwatch name="Warning" color={lightModeColors.warning.main} />
              </Grid>
              <Grid item>
                <ColorSwatch name="Error" color={lightModeColors.error.main} />
              </Grid>
              <Grid item>
                <ColorSwatch name="Info" color={lightModeColors.info.main} />
              </Grid>
            </Grid>
          </Grid>

          {/* CEFR Level Colors */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom fontWeight={fontWeights.semibold}>
              CEFR Level Colors
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {Object.entries(cefrLevelColors).map(([level, colors]) => (
                <Grid item key={level}>
                  <ColorSwatch name={level} color={colors.main} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 탭 2: 타이포그래피 */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h1">Heading 1 - 48px Bold</Typography>
            <Typography variant="h2">Heading 2 - 40px Bold</Typography>
            <Typography variant="h3">Heading 3 - 32px Semibold</Typography>
            <Typography variant="h4">Heading 4 - 24px Semibold</Typography>
            <Typography variant="h5">Heading 5 - 20px Medium</Typography>
            <Typography variant="h6">Heading 6 - 16px Medium</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" paragraph>
              <strong>Body 1 (16px Regular)</strong> - 보스턴어학원은 체계적인 영어 교육을 제공합니다.
              이 텍스트는 일반적인 본문 텍스트로 사용됩니다. 가독성을 위해 line-height 1.7을 적용했습니다.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Body 2 (14px Regular)</strong> - 더 작은 본문 텍스트입니다. 부가 정보나
              설명 텍스트에 사용됩니다.
            </Typography>
            <Typography variant="caption" display="block">
              Caption (12px Regular) - 캡션, 주석, 타임스탬프 등에 사용
            </Typography>
            <Typography variant="overline" display="block">
              OVERLINE (12px Medium Uppercase) - 섹션 라벨
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom fontWeight={fontWeights.semibold}>
              Font Weights
            </Typography>
            <Typography style={{ fontWeight: fontWeights.light }}>
              Light (300) - 가벼운 텍스트
            </Typography>
            <Typography style={{ fontWeight: fontWeights.regular }}>
              Regular (400) - 일반 텍스트
            </Typography>
            <Typography style={{ fontWeight: fontWeights.medium }}>
              Medium (500) - 중간 강조
            </Typography>
            <Typography style={{ fontWeight: fontWeights.semibold }}>
              Semibold (600) - 강조
            </Typography>
            <Typography style={{ fontWeight: fontWeights.bold }}>
              Bold (700) - 강한 강조
            </Typography>
            <Typography style={{ fontWeight: fontWeights.extrabold }}>
              Extrabold (800) - 매우 강한 강조
            </Typography>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 탭 3: 간격 & 레이아웃 */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom fontWeight={fontWeights.semibold}>
              Spacing Scale (4px 기반)
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[1, 2, 3, 4, 6, 8, 12, 16].map((size) => (
                <Box key={size} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: spacing[size],
                      height: '20px',
                      backgroundColor: 'primary.main',
                      mr: 2,
                    }}
                  />
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    spacing[{size}] = {spacing[size]} ({parseInt(spacing[size]) * 16}px)
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom fontWeight={fontWeights.semibold}>
              Border Radius
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {Object.entries(borderRadius).map(([key, value]) => (
                <Grid item key={key}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      backgroundColor: 'primary.light',
                      borderRadius: value,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" fontWeight={fontWeights.medium}>
                      {key}
                    </Typography>
                  </Box>
                  <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
                    {value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 탭 4: 컴포넌트 */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={4}>
          {/* 버튼 */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom fontWeight={fontWeights.semibold}>
              Buttons
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <Button variant="contained" color="primary">
                Primary
              </Button>
              <Button variant="contained" color="secondary">
                Secondary
              </Button>
              <Button variant="outlined" color="primary">
                Outlined
              </Button>
              <Button variant="text" color="primary">
                Text
              </Button>
              <Button variant="contained" color="primary" disabled>
                Disabled
              </Button>
              <Button variant="contained" size="small">
                Small
              </Button>
              <Button variant="contained" size="large">
                Large
              </Button>
            </Box>
          </Grid>

          {/* 텍스트 필드 */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom fontWeight={fontWeights.semibold}>
              Text Fields
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <TextField label="기본 입력" />
              <TextField label="필수 입력" required />
              <TextField label="비활성화" disabled />
              <TextField label="에러" error helperText="올바르지 않은 입력입니다" />
            </Box>
          </Grid>

          {/* 칩 */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom fontWeight={fontWeights.semibold}>
              Chips & Badges
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              <Chip label="기본 칩" />
              <Chip label="Primary" color="primary" />
              <Chip label="Secondary" color="secondary" />
              <Chip label="Success" color="success" />
              <Chip label="Error" color="error" />
              <Chip label="삭제 가능" onDelete={() => {}} />
              <Chip label="클릭 가능" onClick={() => {}} />
            </Box>
          </Grid>

          {/* 카드 */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom fontWeight={fontWeights.semibold}>
              Cards
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        카드 제목 {i}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        카드 내용입니다. 이것은 예시 텍스트입니다.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <Favorite />
                        </IconButton>
                        <IconButton size="small">
                          <Share />
                        </IconButton>
                        <IconButton size="small">
                          <Star />
                        </IconButton>
                        <IconButton size="small">
                          <BookmarkBorder />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};
