export type CEFRLevel =
  | 'A1-1' | 'A1-2' | 'A1-3'
  | 'A2-1' | 'A2-2' | 'A2-3'
  | 'B1-1' | 'B1-2' | 'B1-3'
  | 'B2-1' | 'B2-2' | 'B2-3'
  | 'C1-1' | 'C1-2' | 'C1-3'
  | 'C2-1' | 'C2-2' | 'C2-3';

export type Language = 'ko' | 'en' | 'ja' | 'es' | 'fr';
export type Country = 'KR' | 'US' | 'JP' | 'ES' | 'FR';
export type Category = '문법' | '독해' | '어휘' | '말하기' | '듣기' | '시험대비' | '초급' | '중급' | '고급';

export interface Ebook {
  id: string;
  title: string;
  author: string;
  level: CEFRLevel;
  language: Language;
  country: Country;
  pages: number;
  categories: Category[];
  coverUrl?: string;
  isLocked: boolean;
  isNew: boolean;
  isHot: boolean;
  publishedAt: string;
}

export type SortOption = 'latest' | 'title-asc' | 'level-low' | 'level-high';
export type ViewMode = 'card' | 'list';
export type CoverSize = 'S' | 'M' | 'L';

export interface FilterState {
  search: string;
  levels: CEFRLevel[];
  languages: Language[];
  countries: Country[];
}

export interface EbookSearchParams {
  search?: string;
  levels?: CEFRLevel[];
  languages?: Language[];
  countries?: Country[];
  categories?: Category[];
  sort?: SortOption;
  page?: number;
  limit?: number;
}