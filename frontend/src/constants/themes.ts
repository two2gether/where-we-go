// 테마 매핑 상수
export const THEME_MAPPING = {
  // 프론트엔드 표시명 -> 백엔드 ENUM 값
  '힐링': 'HEALING',
  '감성': 'SENSIBILITY', 
  '기념일': 'ANNIVERSARY',
  '로맨틱': 'ROMANTIC',
  '액티비티': 'ACTIVITY',
  '맛집탐방': 'FOOD_TOUR',
  '카페투어': 'CAFE_TOUR',
  '당일치기': 'ONE_DAY',
  '일상': 'DAILY',
  '핫플': 'HOT_PLACE',
  '드라이브': 'DRIVE',
  '인생샷': 'BEST_SHOT',
  '피크닉': 'PICNIC',
  '여행': 'TRAVEL',
  '비오는날': 'RAINY_DAY',
  '기분전환': 'REFRESH'
} as const;

// 백엔드 ENUM 값 -> 프론트엔드 표시명
export const THEME_DISPLAY_MAPPING = Object.fromEntries(
  Object.entries(THEME_MAPPING).map(([display, enum_]) => [enum_, display])
);

// 사용 가능한 테마 목록 (프론트엔드 표시용)
export const AVAILABLE_THEMES = Object.keys(THEME_MAPPING);

// 테마 변환 유틸리티 함수
export const convertThemesToEnum = (themes: string[]): string[] => {
  return themes.map(theme => THEME_MAPPING[theme as keyof typeof THEME_MAPPING]).filter(Boolean);
};

export const convertThemesToDisplay = (themes: string[]): string[] => {
  return themes.map(theme => THEME_DISPLAY_MAPPING[theme]).filter(Boolean);
};