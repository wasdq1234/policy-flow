// 한글 라벨 매핑
import type { AgeGroup, Region, PolicyCategory } from '@policy-flow/contracts';

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  '10s': '10대',
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대',
  '60s_plus': '60대 이상',
};

export const REGION_LABELS: Record<Region, string> = {
  ALL: '전체',
  SEOUL: '서울',
  BUSAN: '부산',
  DAEGU: '대구',
  INCHEON: '인천',
  GWANGJU: '광주',
  DAEJEON: '대전',
  ULSAN: '울산',
  SEJONG: '세종',
  GYEONGGI: '경기',
  GANGWON: '강원',
  CHUNGBUK: '충북',
  CHUNGNAM: '충남',
  JEONBUK: '전북',
  JEONNAM: '전남',
  GYEONGBUK: '경북',
  GYEONGNAM: '경남',
  JEJU: '제주',
};

export const CATEGORY_LABELS: Record<PolicyCategory, string> = {
  JOB: '취업·일자리',
  HOUSING: '주거·임대',
  LOAN: '대출·자금',
  EDUCATION: '교육·장학',
  STARTUP: '창업·사업',
  WELFARE: '복지·생활',
};
