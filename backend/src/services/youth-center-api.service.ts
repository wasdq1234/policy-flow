/**
 * 청년센터 API 서비스
 * 공공데이터포털 청년정책 API 연동
 */
import { parseDateRange } from '../utils/date-parser';
import type { NewPolicy } from '../db/schema';

/**
 * 청년센터 API 응답 (정책 정보)
 */
export interface YouthCenterPolicy {
  bizId: string; // 정책 ID
  polyBizSjnm: string; // 정책명
  polyItcnCn: string; // 정책 소개
  cnsgNmor: string; // 지역 (서울시, 부산광역시 등)
  polyRlmCd: string; // 정책 분야 코드
  rqutPrdCn: string; // 신청기간
  rqutUrla: string; // 신청 URL
  rfcSiteUrla1: string; // 참고사이트 URL
  age?: string; // 연령 (선택)
  majrRqisCn?: string; // 거주지 및 소득 요건 (선택)
  splzRlmRqisCn?: string; // 특화분야 요건 (선택)
}

/**
 * 청년센터 API 응답
 */
export interface YouthCenterResponse {
  pageIndex: number;
  totalCnt: number;
  youthPolicyList: YouthCenterPolicy[];
}

/**
 * 청년센터 API 호출 옵션
 */
export interface FetchOptions {
  apiKey: string;
  pageIndex: number;
  display: number; // 한 페이지당 결과 수 (최대 100)
}

/**
 * 카테고리 매핑 (청년센터 → 우리 시스템)
 */
export const CATEGORY_MAP: Record<string, string> = {
  '023010': 'JOB', // 일자리
  '023020': 'HOUSING', // 주거
  '023030': 'EDUCATION', // 교육
  '023040': 'WELFARE', // 복지문화
  '023050': 'STARTUP', // 참여권리 → 창업으로 매핑
};

/**
 * 지역 매핑 (청년센터 → 우리 시스템)
 */
export const REGION_MAP: Record<string, string> = {
  // 서울
  '서울': 'SEOUL',
  '서울시': 'SEOUL',
  '서울특별시': 'SEOUL',

  // 부산
  '부산': 'BUSAN',
  '부산시': 'BUSAN',
  '부산광역시': 'BUSAN',

  // 대구
  '대구': 'DAEGU',
  '대구시': 'DAEGU',
  '대구광역시': 'DAEGU',

  // 인천
  '인천': 'INCHEON',
  '인천시': 'INCHEON',
  '인천광역시': 'INCHEON',

  // 광주
  '광주': 'GWANGJU',
  '광주시': 'GWANGJU',
  '광주광역시': 'GWANGJU',

  // 대전
  '대전': 'DAEJEON',
  '대전시': 'DAEJEON',
  '대전광역시': 'DAEJEON',

  // 울산
  '울산': 'ULSAN',
  '울산시': 'ULSAN',
  '울산광역시': 'ULSAN',

  // 세종
  '세종': 'SEJONG',
  '세종시': 'SEJONG',
  '세종특별자치시': 'SEJONG',

  // 경기
  '경기': 'GYEONGGI',
  '경기도': 'GYEONGGI',

  // 강원
  '강원': 'GANGWON',
  '강원도': 'GANGWON',

  // 충북
  '충북': 'CHUNGBUK',
  '충청북도': 'CHUNGBUK',

  // 충남
  '충남': 'CHUNGNAM',
  '충청남도': 'CHUNGNAM',

  // 전북
  '전북': 'JEONBUK',
  '전라북도': 'JEONBUK',

  // 전남
  '전남': 'JEONNAM',
  '전라남도': 'JEONNAM',

  // 경북
  '경북': 'GYEONGBUK',
  '경상북도': 'GYEONGBUK',

  // 경남
  '경남': 'GYEONGNAM',
  '경상남도': 'GYEONGNAM',

  // 제주
  '제주': 'JEJU',
  '제주도': 'JEJU',
  '제주특별자치도': 'JEJU',

  // 전국
  '전국': 'ALL',
  '중앙부처': 'ALL',
  '중앙': 'ALL',
};

/**
 * 청년센터 API 호출
 * @param options - API 호출 옵션
 * @returns API 응답
 */
export async function fetchYouthCenterPolicies(
  options: FetchOptions
): Promise<YouthCenterResponse> {
  const { apiKey, pageIndex, display } = options;

  const url = new URL('https://www.youthcenter.go.kr/opi/youthPlcyList.do');
  url.searchParams.set('openApiVlak', apiKey);
  url.searchParams.set('pageIndex', pageIndex.toString());
  url.searchParams.set('display', display.toString());

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `청년센터 API 호출 실패: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('청년센터 API 호출 실패')) {
      throw error;
    }
    throw new Error(
      `청년센터 API 호출 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
}

/**
 * 청년센터 정책을 DB 정책 형식으로 변환
 * @param youthPolicy - 청년센터 정책
 * @returns DB에 저장할 정책 객체
 */
export function mapToPolicy(youthPolicy: YouthCenterPolicy): NewPolicy {
  // 날짜 파싱
  const dateRange = parseDateRange(youthPolicy.rqutPrdCn || '');

  // 카테고리 매핑 (기본값: WELFARE)
  const category = CATEGORY_MAP[youthPolicy.polyRlmCd] || 'WELFARE';

  // 지역 매핑 (기본값: ALL)
  let region = 'ALL';
  const regionName = youthPolicy.cnsgNmor || '';
  for (const [key, value] of Object.entries(REGION_MAP)) {
    if (regionName.includes(key)) {
      region = value;
      break;
    }
  }

  // detail_json 구성
  const detailJson = JSON.stringify({
    source_url: youthPolicy.rfcSiteUrla1 || null,
    age_info: youthPolicy.age || null,
    residence_requirement: youthPolicy.majrRqisCn || null,
    special_requirement: youthPolicy.splzRlmRqisCn || null,
  });

  const now = new Date();

  return {
    id: youthPolicy.bizId,
    title: youthPolicy.polyBizSjnm,
    summary: youthPolicy.polyItcnCn || null,
    category,
    region,
    targetAgeMin: null, // 청년센터 API는 정형화된 연령 정보 제공 안 함
    targetAgeMax: null,
    startDate: dateRange.startDate ? new Date(dateRange.startDate * 1000) : null,
    endDate: dateRange.endDate ? new Date(dateRange.endDate * 1000) : null,
    isAlwaysOpen: dateRange.isAlwaysOpen,
    applyUrl: youthPolicy.rqutUrla || null,
    detailJson,
    createdAt: now,
    updatedAt: now,
  };
}
