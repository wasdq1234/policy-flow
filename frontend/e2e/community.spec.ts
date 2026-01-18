import { test, expect } from '@playwright/test';

/**
 * 커뮤니티 기능 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 커뮤니티 목록 페이지 접근
 * 2. 글쓰기 페이지 접근
 */
test.describe('Community Features', () => {
  test('should display community list page', async ({ page }) => {
    // Given: 커뮤니티 목록 페이지 접근
    await page.goto('/community', { waitUntil: 'domcontentloaded' });

    // When/Then: 페이지 제목 확인
    const heading = page.getByRole('heading', { name: '커뮤니티' });
    await expect(heading).toBeVisible({ timeout: 15000 });

    // When/Then: 페이지가 정상 로드됨
    await expect(page).toHaveURL(/\/community/);
  });

  test('should access community write page', async ({ page }) => {
    // Given: 글쓰기 페이지 접근
    await page.goto('/community/write', { waitUntil: 'domcontentloaded' });

    // When/Then: 페이지가 로드됨
    await expect(page).toHaveURL(/\/community\/write/);

    // When/Then: 페이지가 렌더링됨
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 15000 });
  });
});
