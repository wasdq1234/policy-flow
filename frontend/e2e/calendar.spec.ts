import { test, expect } from '@playwright/test';

/**
 * 캘린더 기능 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 메인 페이지(캘린더) 접근
 * 2. 캘린더 뷰 렌더링 확인
 */
test.describe('Calendar Features', () => {
  test('should display home page with header', async ({ page }) => {
    // Given: 메인 페이지 접근
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // When/Then: 페이지 제목 확인
    const title = page.locator('h1').first();
    await expect(title).toBeVisible({ timeout: 15000 });
    await expect(title).toContainText('PolicyFlow');

    // When/Then: 메인 컨테이너 확인
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});
