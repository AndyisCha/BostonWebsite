import { Badge } from './ui/badge';
import { Tooltip } from '@mui/material';
import { CEFRLevel } from '../types/ebook';

interface LevelChipProps {
  level: CEFRLevel;
  language?: string;
  className?: string;
}

const getLevelConfig = (level: CEFRLevel) => {
  const baseLevel = level.split('_')[0]; // A1, A2, B1, etc.

  const colorMap = {
    'A1': 'bg-green-100 text-green-800 border-green-200',
    'A2': 'bg-green-200 text-green-900 border-green-300',
    'A3': 'bg-lime-100 text-lime-800 border-lime-200',
    'B1': 'bg-blue-100 text-blue-800 border-blue-200',
    'B2': 'bg-blue-200 text-blue-900 border-blue-300',
    'C1': 'bg-purple-100 text-purple-800 border-purple-200',
    'C2': 'bg-purple-200 text-purple-900 border-purple-300'
  };

  const descriptionMap = {
    'A1': '초급 기초',
    'A2': '초급 상급',
    'A3': '초중급',
    'B1': '중급 기초',
    'B2': '중급 상급',
    'C1': '고급 기초',
    'C2': '고급 상급'
  };

  return {
    color: colorMap[baseLevel as keyof typeof colorMap] || 'bg-gray-100 text-gray-800 border-gray-200',
    description: descriptionMap[baseLevel as keyof typeof descriptionMap] || '미분류'
  };
};

const getLanguageCode = (language: string): string => {
  const langMap = {
    'ko': 'KO',
    'en': 'EN',
    'es': 'ES',
    'fr': 'FR',
    'jp': 'JP',
    'zh': 'CN'
  };
  return langMap[language as keyof typeof langMap] || language.toUpperCase();
};

export function LevelChip({ level, language, className = '' }: LevelChipProps) {
  const config = getLevelConfig(level);
  const formattedLevel = level.replace('_', '-'); // A1_1 → A1-1
  const languageCode = language ? getLanguageCode(language) : null;

  return (
    <Tooltip
      title={
        <div>
          <div>CEFR {formattedLevel} ({config.description})</div>
          {language && <div>언어: {languageCode}</div>}
        </div>
      }
    >
      <div className={`level-chip flex items-center gap-1 ${className}`}>
        <Badge
          variant="outline"
          className={`text-xs font-medium px-2 py-1 ${config.color}`}
        >
          {formattedLevel}
        </Badge>
        {languageCode && (
          <Badge
            variant="secondary"
            className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600"
          >
            {languageCode}
          </Badge>
        )}
      </div>
    </Tooltip>
  );
}