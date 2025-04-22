import { test, expect } from '@playwright/test';
import { TestHelpers } from './test-helpers';

/**
 * 測試設定頁面和語言切換功能
 */
test.describe('設定頁面與語言功能測試', () => {
  // 測試帳戶資料 - 以環境變量方式注入
  const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
  const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'test123456';

  // 測試：存取設定頁面
  test('應該能夠訪問設定頁面', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 先登入
    await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    
    // 導航到設定頁面
    await helpers.navigateTo('/settings');
    
    // 確認頁面標題
    await helpers.checkContent('h1', '設定');
    
    // 確認語言設定區塊存在
    await expect(page.locator('text=語言')).toBeVisible();
  });

  // 測試：語言切換功能
  test('應該能夠切換語言', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 先登入
    await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    
    // 導航到設定頁面
    await helpers.navigateTo('/settings');
    
    // 測試切換到不同語言
    const languages = [
      { code: 'en', title: 'Settings' },
      { code: 'zh-TW', title: '設定' },
      { code: 'zh-CN', title: '设置' },
      { code: 'ja', title: '設定' }
    ];
    
    for (const lang of languages) {
      // 開啟語言選擇器
      await page.click('[id="language"]');
      
      // 選擇特定語言
      await page.click(`[data-value="${lang.code}"]`);
      
      // 等待語言變更生效
      await page.waitForTimeout(1000);
      
      // 檢查頁面標題是否已更改
      await helpers.checkContent('h1', lang.title);
      
      console.log(`成功切換到 ${lang.code} 語言`);
    }
  });

  // 測試：語言設定持久化
  test('語言設定應該在頁面刷新後保持', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 先登入
    await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    
    // 導航到設定頁面
    await helpers.navigateTo('/settings');
    
    // 切換到英文
    await page.click('[id="language"]');
    await page.click('[data-value="en"]');
    
    // 等待變更生效
    await page.waitForTimeout(1000);
    
    // 刷新頁面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 檢查語言是否保持為英文
    await helpers.checkContent('h1', 'Settings');
    
    // 切換回繁體中文
    await page.click('[id="language"]');
    await page.click('[data-value="zh-TW"]');
    
    // 等待變更生效
    await page.waitForTimeout(1000);
    
    // 刷新頁面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 檢查語言是否保持為繁體中文
    await helpers.checkContent('h1', '設定');
  });

  // 測試：語言設定對整個應用的影響
  test('語言設定應該影響整個應用', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 先登入
    await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    
    // 導航到設定頁面並切換語言
    await helpers.navigateTo('/settings');
    
    // 切換到英文
    await page.click('[id="language"]');
    await page.click('[data-value="en"]');
    await page.waitForTimeout(1000);
    
    // 檢查導航項目是否已變更為英文
    await helpers.navigateTo('/');
    await expect(page.locator('nav')).toContainText('Discover');
    await expect(page.locator('nav')).toContainText('Following');
    
    // 再切換到簡體中文
    await helpers.navigateTo('/settings');
    await page.click('[id="language"]');
    await page.click('[data-value="zh-CN"]');
    await page.waitForTimeout(1000);
    
    // 檢查導航項目是否已變更為簡體中文
    await helpers.navigateTo('/');
    await expect(page.locator('nav')).toContainText('发现');
    await expect(page.locator('nav')).toContainText('关注中');
    
    // 最後切換回繁體中文
    await helpers.navigateTo('/settings');
    await page.click('[id="language"]');
    await page.click('[data-value="zh-TW"]');
    await page.waitForTimeout(1000);
  });
});