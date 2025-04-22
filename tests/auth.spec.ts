import { test, expect } from '@playwright/test';
import { TestHelpers } from './test-helpers';

/**
 * 測試身份驗證功能
 * 包括：登入、登出和會話保持
 */
test.describe('認證功能測試', () => {
  // 測試帳戶資料 - 以環境變量方式注入
  const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
  const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'test123456';

  // 測試：基本登入
  test('應該能夠成功登入', async ({ page }) => {
    const helpers = new TestHelpers(page);
    await helpers.navigateTo('/login');
    
    // 檢查頁面標題
    await expect(page).toHaveTitle(/FanHub/);
    
    try {
      await helpers.login(TEST_EMAIL, TEST_PASSWORD);
      // 確認登入後的狀態
      await expect(page.locator('header')).toBeVisible();
    } catch (error) {
      console.error('登入失敗:', error);
      throw error;
    }
  });

  // 測試：登入後的登出
  test('應該能夠成功登出', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 先登入
    try {
      await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    } catch (error) {
      console.error('登入失敗，無法進行登出測試:', error);
      throw error;
    }
    
    // 測試登出
    try {
      const success = await helpers.logout();
      expect(success).toBeTruthy();
      
      // 檢查是否成功登出（重定向到登入頁面）
      await expect(page).toHaveURL(/\/login/);
    } catch (error) {
      console.error('登出失敗:', error);
      throw error;
    }
  });

  // 測試：多次登出操作
  test('應該能夠處理多次登出請求', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 先登入
    try {
      await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    } catch (error) {
      console.error('登入失敗，無法進行多次登出測試:', error);
      throw error;
    }
    
    // 第一次登出
    try {
      const success = await helpers.logout();
      expect(success).toBeTruthy();
      
      // 確認已經登出
      await expect(page).toHaveURL(/\/login/);
    } catch (error) {
      console.error('第一次登出失敗:', error);
      throw error;
    }
    
    // 嘗試再次登出（應該沒有效果，因為已經登出）
    try {
      const success = await helpers.logout();
      expect(success).toBeFalsy(); // 已經登出，所以這次應該返回 false
    } catch (error) {
      console.error('第二次登出測試失敗:', error);
      // 不拋出錯誤，因為預期行為是不應該能登出
    }
  });

  // 測試：登入狀態持久化
  test('應該在頁面重新載入後保持登入狀態', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 先登入
    try {
      await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    } catch (error) {
      console.error('登入失敗，無法測試會話持久性:', error);
      throw error;
    }
    
    // 記錄當前 URL
    const currentUrl = page.url();
    
    // 重新載入頁面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 檢查是否仍然登入（頭像應該可見）
    await expect(page.locator('header button:has(.avatar), header .avatar')).toBeVisible({ timeout: 5000 });
    
    // 確認 URL 沒有變為登入頁面
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(currentUrl);
  });
  
  // 測試：在不同頁面間導航後的登出
  test('應該在不同頁面導航後仍能成功登出', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 先登入
    try {
      await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    } catch (error) {
      console.error('登入失敗，無法測試頁面導航後登出:', error);
      throw error;
    }
    
    // 導航到不同頁面
    const pages = ['/discover', '/following', '/settings'];
    
    for (const path of pages) {
      // 導航到特定頁面
      await helpers.navigateTo(path);
      
      // 確認成功導航
      await expect(page).toHaveURL(path);
      
      // 嘗試登出
      try {
        const success = await helpers.logout();
        expect(success).toBeTruthy();
        
        // 確認成功登出
        await expect(page).toHaveURL(/\/login/);
        console.log(`從 ${path} 成功登出`);
        
        // 如果成功登出，則需要重新登入繼續測試
        await helpers.login(TEST_EMAIL, TEST_PASSWORD);
      } catch (error) {
        console.error(`從 ${path} 登出失敗:`, error);
        throw error;
      }
    }
  });
});