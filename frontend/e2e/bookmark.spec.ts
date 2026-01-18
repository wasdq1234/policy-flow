import { test, expect } from '@playwright/test';

/**
 * 북마크 기능 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 마이페이지 북마크 탭 접근
 * 2. 페이지 렌더링 확인
 */
test.describe('Bookmark Features', () => {
  test('should access mypage bookmarks page', async ({ page }) => {
    // Given: 마이페이지 북마크 페이지 접근
    await page.goto('/mypage/bookmarks', { waitUntil: 'domcontentloaded' });

    // When/Then: 페이지가 로드됨
    await expect(page).toHaveURL(/\/mypage\/bookmarks/);

    // When/Then: 페이지가 렌더링됨
    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 15000 });
  });
});
