import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  People,
  PersonAdd,
  School,
  Quiz,
  AutoStories,
  TrendingUp,
  Language
} from '@mui/icons-material';
import { KPICard } from '../common/KPICard';
import { DataTable, Column } from '../common/DataTable';
import { GlobalFilter } from '../common/GlobalFilter';
import { CustomBarChart, CustomLineChart } from '../common/Charts';
import { EbookLibrary } from '../EbookLibrary';
import { useAuth } from '../../contexts/AuthContext';

interface CountryData {
  id: string;
  name: string;
  master: string;
  memberCount: number;
  teacherCount: number;
  branchCount: number;
  status: string;
}

interface TestTrendData {
  name: string;
  value: number;
}

interface MembersByCountryData {
  name: string;
  value: number;
}

export const GlobalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [testTrendData, setTestTrendData] = useState<TestTrendData[]>([]);
  const [membersByCountryData, setMembersByCountryData] = useState<MembersByCountryData[]>([]);
  const [showEbookLibrary, setShowEbookLibrary] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      setTimeout(() => {
        // Brand new global academy system - no members yet
        setCountries([
          {
            id: 'KR',
            name: '대한민국',
            master: 'Andy Country',
            memberCount: 0, // Starting completely empty
            teacherCount: 0,
            branchCount: 1, // Only one branch registered
            status: '활성'
          },
          {
            id: 'US',
            name: '미국',
            master: 'Sarah Johnson',
            memberCount: 0,
            teacherCount: 0,
            branchCount: 0, // No branches yet
            status: '준비중'
          },
          {
            id: 'JP',
            name: '일본',
            master: 'Takeshi Yamamoto',
            memberCount: 0,
            teacherCount: 0,
            branchCount: 0,
            status: '준비중'
          },
          {
            id: 'CN',
            name: '중국',
            master: 'Li Wei',
            memberCount: 0,
            teacherCount: 0,
            branchCount: 0,
            status: '준비중'
          },
          {
            id: 'SG',
            name: '싱가포르',
            master: 'Kumar Raj',
            memberCount: 0,
            teacherCount: 0,
            branchCount: 0,
            status: '준비중'
          }
        ]);

        // No test data yet - brand new system
        setTestTrendData([
          { name: '9/1', value: 0 },
          { name: '9/5', value: 0 },
          { name: '9/10', value: 0 },
          { name: '9/15', value: 0 },
          { name: '9/20', value: 0 },
          { name: '9/25', value: 0 }
        ]);

        // No members yet - all countries starting at zero
        setMembersByCountryData([
          { name: '대한민국', value: 0 },
          { name: '중국', value: 0 },
          { name: '미국', value: 0 },
          { name: '일본', value: 0 },
          { name: '싱가포르', value: 0 }
        ]);

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const countryColumns: Column<CountryData>[] = [
    {
      id: 'name',
      label: '나라명',
      minWidth: 150,
      format: (value: string) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Language color="primary" fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {value}
          </Typography>
        </Box>
      )
    },
    {
      id: 'master',
      label: '나라 마스터',
      minWidth: 150,
      align: 'left'
    },
    {
      id: 'memberCount',
      label: '회원 수',
      minWidth: 100,
      align: 'right',
      format: (value: number) => value.toLocaleString()
    },
    {
      id: 'teacherCount',
      label: '강사 수',
      minWidth: 100,
      align: 'right',
      format: (value: number) => value.toLocaleString()
    },
    {
      id: 'branchCount',
      label: '지점 수',
      minWidth: 100,
      align: 'right',
      format: (value: number) => value.toLocaleString()
    },
    {
      id: 'status',
      label: '상태',
      minWidth: 100,
      align: 'center',
      format: (value: string) => (
        <Typography
          variant="body2"
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: value === '활성' ? 'success.light' : 'grey.light',
            color: value === '활성' ? 'success.dark' : 'grey.dark',
            fontSize: '0.75rem',
            fontWeight: 500
          }}
        >
          {value}
        </Typography>
      )
    }
  ];

  const totalMembers = countries.reduce((sum, country) => sum + country.memberCount, 0);
  const totalTeachers = countries.reduce((sum, country) => sum + country.teacherCount, 0);
  const totalBranches = countries.reduce((sum, country) => sum + country.branchCount, 0);

  // E-book 라이브러리 보기 모드
  if (showEbookLibrary) {
    return (
      <Box>
        <Button
          startIcon={<AutoStories />}
          onClick={() => setShowEbookLibrary(false)}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          대시보드로 돌아가기
        </Button>
        <EbookLibrary />
      </Box>
    );
  }

  return (
    <Box>
      {/* 글로벌 필터 */}
      <GlobalFilter
        showCountryFilter={false}
        showBranchFilter={false}
        showDateFilter={true}
      />

      {/* KPI 카드 그리드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="총 회원 수"
            value={totalMembers}
            label="명"
            change="0명"
            changeType="increase"
            icon={<People />}
            description="전체 등록된 회원"
            loading={loading}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="활성 회원"
            value={Math.round(totalMembers * 0.78)}
            label="명"
            change="0명"
            changeType="increase"
            icon={<PersonAdd />}
            description="최근 30일 활동"
            loading={loading}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="강사 수"
            value={totalTeachers}
            label="명"
            change="0명"
            changeType="increase"
            icon={<School />}
            description="전체 활동 강사"
            loading={loading}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="평균 점수"
            value={0}
            label="점"
            change="0점"
            changeType="neutral"
            icon={<TrendingUp />}
            description="레벨테스트 평균"
            loading={loading}
            color="info"
          />
        </Grid>
      </Grid>

      {/* 추가 KPI 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="외부 이용자"
            value={0}
            label="명"
            change="0명"
            changeType="neutral"
            icon={<Quiz />}
            description="학원코드 없는 사용자"
            loading={loading}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="이번 주 시험 응시"
            value={0}
            label="건"
            change="0건"
            changeType="neutral"
            icon={<Quiz />}
            description="주간 레벨테스트"
            loading={loading}
            color="error"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="E-book 사용시간"
            value={0}
            label="시간"
            change="0시간"
            changeType="neutral"
            icon={<AutoStories />}
            description="전체 학습 시간"
            loading={loading}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <KPICard
            title="전체 지점"
            value={totalBranches}
            label="개"
            change="0개"
            changeType="neutral"
            icon={<Language />}
            description="운영 중인 지점"
            loading={loading}
            color="success"
          />
        </Grid>
      </Grid>

      {/* 나라별 통계 테이블 */}
      <Box sx={{ mb: 4 }}>
        <DataTable
          columns={countryColumns}
          data={countries}
          loading={loading}
          title="나라별 통계"
          subtitle="전세계 Boston Academy 지점 현황"
          searchable={true}
          searchPlaceholder="나라명 또는 마스터 검색..."
          emptyMessage="등록된 나라가 없습니다"
          pageSize={10}
        />
      </Box>

      {/* 차트 섹션 */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <CustomLineChart
            data={testTrendData}
            title="최근 30일 시험 응시 추이"
            subtitle="일별 레벨테스트 응시 현황"
            height={350}
            color="#2196f3"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <CustomBarChart
            data={membersByCountryData}
            title="나라별 회원 수"
            subtitle="활성 회원 기준"
            height={350}
            color="#4caf50"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* 액션 버튼 카드 */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                나라 마스터 관리
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                새로운 나라의 마스터를 추가하거나 기존 마스터를 관리합니다.
              </Typography>
              <Button variant="contained" color="primary" startIcon={<PersonAdd />}>
                나라 마스터 추가
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                지점 계정 생성
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                새로운 지점의 관리자 계정을 생성하고 권한을 부여합니다.
              </Typography>
              <Button variant="contained" color="secondary" startIcon={<School />}>
                지점 계정 생성
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                E-book 관리
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                전체 E-book 라이브러리를 보고 관리합니다.
              </Typography>
              <Button
                variant="contained"
                color="info"
                startIcon={<AutoStories />}
                onClick={() => setShowEbookLibrary(true)}
              >
                E-book 라이브러리 열기
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};