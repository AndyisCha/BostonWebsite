import React, { useState } from 'react';
import '../../styles/EbookLibrary.css';

interface Ebook {
  id: string;
  title: string;
  author: string;
  description: string;
  level: string;
  coverImage?: string;
  pageCount: number;
}

export const EbookLibraryPreview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ebooks: Ebook[] = [
    {
      id: '1',
      title: 'Elementary Grammar Basics',
      author: 'John Smith',
      description: '영어 문법의 기초를 다지는 초급자를 위한 교재입니다. 간단한 문장 구조부터 시작하여 점진적으로 복잡한 문법을 학습할 수 있습니다.',
      level: 'A1_1',
      pageCount: 120
    },
    {
      id: '2',
      title: 'Everyday Conversations',
      author: 'Maria Garcia',
      description: '일상생활에서 자주 사용하는 영어 표현과 대화를 학습할 수 있는 실용적인 교재입니다.',
      level: 'A2_2',
      pageCount: 85
    },
    {
      id: '3',
      title: 'Business English Essentials',
      author: 'David Wilson',
      description: '비즈니스 환경에서 필요한 영어 표현과 이메일 작성법, 프레젠테이션 스킬을 다룹니다.',
      level: 'B1_3',
      pageCount: 200
    },
    {
      id: '4',
      title: 'Advanced Reading Comprehension',
      author: 'Sarah Johnson',
      description: '복잡한 텍스트를 이해하고 분석하는 능력을 기르는 고급 독해 교재입니다.',
      level: 'B2_2',
      pageCount: 150
    },
    {
      id: '5',
      title: 'Academic Writing Skills',
      author: 'Professor Brown',
      description: '학술적 글쓰기 기법과 논문 작성법을 체계적으로 학습할 수 있는 교재입니다.',
      level: 'C1_1',
      pageCount: 180
    },
    {
      id: '6',
      title: 'Literature Analysis',
      author: 'Dr. Thompson',
      description: '영미 문학 작품을 분석하고 비평하는 고급 과정을 위한 교재입니다.',
      level: 'C2_1',
      pageCount: 250
    }
  ];

  const getLevelClass = (level: string) => {
    if (level.startsWith('A1')) return 'level-a1';
    if (level.startsWith('A2')) return 'level-a2';
    if (level.startsWith('A3')) return 'level-a3';
    if (level.startsWith('B1')) return 'level-b1';
    if (level.startsWith('B2')) return 'level-b2';
    if (level.startsWith('C1')) return 'level-c1';
    if (level.startsWith('C2')) return 'level-c2';
    return 'level-a1';
  };

  const formatLevel = (level: string) => {
    return level.replace('_', '-');
  };

  const handleEbookClick = (ebook: Ebook) => {
    alert(`${ebook.title} E-book을 여는 중...`);
  };

  if (loading) {
    return (
      <div className="ebook-library-container">
        <div className="loading-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span>E-book을 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ebook-library-container">
      <h4>내 E-book 라이브러리</h4>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="ebook-grid">
        {ebooks.length === 0 ? (
          <div className="empty-state">
            <p>접근 가능한 E-book이 없습니다. 관리자에게 문의하세요.</p>
          </div>
        ) : (
          ebooks.map((ebook) => (
            <div key={ebook.id} className="ebook-card">
              <div className="ebook-cover">
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
                  📚
                </div>
              </div>
              <div className="ebook-info">
                <div className={`level-chip ${getLevelClass(ebook.level)}`}>
                  {formatLevel(ebook.level)}
                </div>

                <h6>{ebook.title}</h6>

                <div className="author">
                  저자: {ebook.author}
                </div>

                <div className="description">
                  {ebook.description}
                </div>

                <div className="page-count">
                  총 {ebook.pageCount}페이지
                </div>

                <button onClick={() => handleEbookClick(ebook)}>
                  읽기 시작
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px' }}>
        <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
          💡 각 E-book 카드를 클릭하면 뷰어가 열립니다. 레벨별로 색상이 구분되어 있습니다.
        </p>
        <button
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          onClick={() => setLoading(true)}
        >
          로딩 상태 보기
        </button>
        <button
          style={{
            marginTop: '12px',
            marginLeft: '8px',
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          onClick={() => setError('네트워크 오류가 발생했습니다.')}
        >
          에러 상태 보기
        </button>
      </div>
    </div>
  );
};