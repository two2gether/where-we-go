/**
 * Google Places API 카테고리 변환 유틸리티
 * 백엔드의 GooglePlaceConverter.java와 동일한 로직
 */

/**
 * 영어 카테고리를 한국어로 번역
 */
export const translateToKorean = (englishCategory: string): string => {
  switch (englishCategory.toLowerCase()) {
    case "restaurant":
      return "음식점";
    case "cafe":
      return "카페";
    case "hospital":
      return "병원";
    case "pharmacy":
      return "약국";
    case "bank":
      return "은행";
    case "atm":
      return "ATM";
    case "gas_station":
      return "주유소";
    case "convenience_store":
      return "편의점";
    case "shopping_mall":
      return "쇼핑몰";
    case "store":
      return "상점";
    case "tourist_attraction":
      return "관광명소";
    case "lodging":
      return "숙박";
    case "movie_theater":
      return "영화관";
    case "gym":
      return "헬스장";
    case "beauty_salon":
      return "미용실";
    case "car_wash":
      return "세차장";
    case "parking":
      return "주차장";
    case "school":
      return "학교";
    case "park":
      return "공원";
    default:
      return "기타";
  }
};

/**
 * 한국어 카테고리를 영어로 번역 (검색 쿼리용)
 */
export const translateToEnglish = (koreanCategory: string): string => {
  switch (koreanCategory) {
    case "음식점":
    case "맛집":
      return "restaurant";
    case "카페":
      return "cafe";
    case "병원":
      return "hospital";
    case "약국":
      return "pharmacy";
    case "은행":
      return "bank";
    case "ATM":
      return "atm";
    case "주유소":
      return "gas_station";
    case "편의점":
      return "convenience_store";
    case "쇼핑몰":
      return "shopping_mall";
    case "상점":
      return "store";
    case "관광명소":
    case "관광지":
      return "tourist_attraction";
    case "숙박":
      return "lodging";
    case "영화관":
      return "movie_theater";
    case "헬스장":
      return "gym";
    case "미용실":
      return "beauty_salon";
    case "세차장":
      return "car_wash";
    case "주차장":
      return "parking";
    case "학교":
      return "school";
    case "공원":
      return "park";
    default:
      return "";
  }
};

/**
 * Google Places API 타입에서 주요 카테고리 추출
 * 백엔드 extractMainCategory 메서드와 동일한 로직
 */
export const extractMainCategory = (types: string[]): string => {
  if (!types || types.length === 0) {
    return "기타";
  }

  // 우선순위가 높은 카테고리부터 확인
  const priorityTypes = [
    "restaurant", "cafe", "hospital", "pharmacy", "bank", "atm",
    "gas_station", "convenience_store", "shopping_mall", "store",
    "tourist_attraction", "lodging", "movie_theater", "gym",
    "beauty_salon", "car_wash", "parking", "school", "park"
  ];

  for (const priorityType of priorityTypes) {
    if (types.includes(priorityType)) {
      return translateToKorean(priorityType);
    }
  }

  // 우선순위에 없는 경우 첫 번째 유의미한 타입 사용
  for (const type of types) {
    if (type !== "establishment" && type !== "point_of_interest") {
      return translateToKorean(type);
    }
  }

  return "기타";
};

/**
 * 검색 쿼리 구성 시 카테고리를 영어로 변환하여 포함
 */
export const buildSearchQueryWithCategory = (
  searchTerm: string,
  category?: string,
  region?: string
): string => {
  let query = searchTerm || "";

  // 카테고리가 있으면 영어로 변환하여 추가
  if (category) {
    const englishCategory = translateToEnglish(category);
    if (englishCategory) {
      query = `${englishCategory} ${query}`.trim();
    } else {
      // 번역이 없는 경우 한국어 카테고리 그대로 사용
      query = `${category} ${query}`.trim();
    }
  }

  // 지역이 있으면 추가
  if (region) {
    query = `${query} ${region}`.trim();
  }

  return query || "여행지";
};

/**
 * Google Places API 검색 타입 매핑
 * Text Search API의 type 파라미터용
 */
export const getGoogleSearchType = (category: string): string | undefined => {
  switch (category) {
    case "음식점":
    case "맛집":
      return "restaurant";
    case "카페":
      return "cafe";
    case "병원":
      return "hospital";
    case "약국":
      return "pharmacy";
    case "은행":
      return "bank";
    case "ATM":
      return "atm";
    case "주유소":
      return "gas_station";
    case "편의점":
      return "convenience_store";
    case "쇼핑몰":
      return "shopping_mall";
    case "상점":
      return "store";
    case "관광명소":
    case "관광지":
      return "tourist_attraction";
    case "숙박":
      return undefined; // 한국에서 type=lodging이 잘 작동하지 않아 query 방식 사용
    case "쇼핑몰":
      return "shopping_mall";
    case "영화관":
      return "movie_theater";
    case "헬스장":
      return "gym";
    case "미용실":
      return "beauty_salon";
    case "세차장":
      return "car_wash";
    case "주차장":
      return "parking";
    case "학교":
      return "school";
    case "공원":
      return "park";
    case "문화재":
      return undefined; // 한국 특화 카테고리, query 방식 사용
    case "시장":
      return undefined; // 한국 특화 카테고리, query 방식 사용
    default:
      return undefined;
  }
};