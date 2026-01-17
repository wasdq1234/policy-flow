/**
 * Vitest 전역 테스트 셋업
 * 각 테스트 실행 전/후 환경 구성 및 정리
 */
import { beforeAll, afterAll, afterEach } from 'vitest';

/**
 * 모든 테스트 시작 전 실행
 */
beforeAll(async () => {
  // 전역 테스트 환경 초기화
  // 예: 테스트 DB 초기화, 글로벌 mock 설정 등
  console.log('🧪 테스트 환경 초기화...');
});

/**
 * 각 테스트 후 실행 (데이터 정리)
 */
afterEach(async () => {
  // 각 테스트 간 격리를 위한 정리
  // 예: Mock 초기화, 테스트 데이터 삭제 등
});

/**
 * 모든 테스트 종료 후 실행
 */
afterAll(async () => {
  // 테스트 환경 정리
  // 예: DB 연결 종료, 임시 파일 삭제 등
  console.log('✅ 테스트 환경 정리 완료');
});
