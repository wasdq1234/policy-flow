import { test, expect } from '@playwright/test';

/**
 * 인증 플로우 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 로그인 페이지 접근
 * 2. 소셜 로그인 버튼 표시 확인
 */
test.describe('Authentication Flow', () => {
  test('should display login page with essential elements', async ({ page }) => {
    // Given: 로그인 페이지 접근
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });

    // When/Then: 페이지 제목 확인
    const title = page.locator('h1').first();
    await expect(title).toBeVisible({ timeout: 15000 });
    await expect(title).toContainText('PolicyFlow');

    // When/Then: 소셜 로그인 버튼 확인 (최소 1개 이상)
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});
