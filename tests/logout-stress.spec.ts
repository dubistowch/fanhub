import { test, expect } from '@playwright/test';
import { TestHelpers } from './test-helpers';

/**
 * 登出功能壓力測試
 * 這些測試主要針對登出功能進行壓力測試，特別是在各種複雜情況下。
 * 主要目標是重現和診斷偶爾發生的登出失敗問題。
 */
test.describe('登出功能壓力測試', () => {
  // 測試帳戶資料 - 以環境變量方式注入
  const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
  const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'test123456';

  // 測試：快速連續導航後的登出
  test('在多次快速連續導航後應能成功登出', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 先登入
    await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    
    // 快速連續導航到多個頁面
    const pages = ['/discover', '/following', '/settings', '/dashboard', '/profile'];
    
    for (const path of pages) {
      await helpers.navigateTo(path);
      // 導航後立即檢查頁面是否正確加載
      await expect(page).toHaveURL(path);
      // 只等待極短時間
      await page.waitForTimeout(200);
    }
    
    // 嘗試登出
    try {
      const success = await helpers.logout();
      expect(success).toBeTruthy();
      
      // 確認已成功登出
      await expect(page).toHaveURL(/\/login/);
    } catch (error) {
      console.error('快速連續導航後登出失敗:', error);
      throw error;
    }
  });

  // 測試：頻繁的登入/登出循環
  test('應能處理連續多次的登入登出循環', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 執行多次登入/登出循環
    const cycles = 3;
    
    for (let i = 0; i < cycles; i++) {
      console.log(`開始第 ${i + 1}/${cycles} 次登入/登出循環`);
      
      // 登入
      try {
        await helpers.login(TEST_EMAIL, TEST_PASSWORD);
      } catch (error) {
        console.error(`第 ${i + 1} 次循環登入失敗:`, error);
        throw error;
      }
      
      // 短暫瀏覽
      await helpers.navigateTo('/discover');
      await page.waitForTimeout(500);
      
      // 登出
      try {
        const success = await helpers.logout();
        expect(success).toBeTruthy();
        await expect(page).toHaveURL(/\/login/);
      } catch (error) {
        console.error(`第 ${i + 1} 次循環登出失敗:`, error);
        throw error;
      }
      
      // 短暫暫停再開始下一個循環
      await page.waitForTimeout(500);
    }
  });

  // 測試：在多個頁面打開的情況下登出
  test('在另一個標籤頁打開的情況下應能成功登出', async ({ browser }) => {
    // 創建兩個頁面
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();
    
    const helpers1 = new TestHelpers(page1);
    const helpers2 = new TestHelpers(page2);
    
    // 在第一個頁面登入
    await helpers1.login(TEST_EMAIL, TEST_PASSWORD);
    
    // 在第二個頁面導航到應用
    await helpers2.navigateTo('/');
    
    // 檢查第二個頁面是否也已經登入（由於共享會話）
    const isLoggedIn = await page2.locator('header button:has(.avatar), header .avatar').isVisible();
    expect(isLoggedIn).toBeTruthy();
    
    // 在第一個頁面進行操作
    await helpers1.navigateTo('/discover');
    
    // 在第二個頁面進行登出
    try {
      const success = await helpers2.logout();
      expect(success).toBeTruthy();
      
      // 確認第二個頁面已登出
      await expect(page2).toHaveURL(/\/login/);
      
      // 刷新第一個頁面，應該也被登出並跳轉到登入頁面
      await page1.reload();
      await expect(page1).toHaveURL(/\/login/);
    } catch (error) {
      console.error('多標籤頁情況下登出失敗:', error);
      throw error;
    } finally {
      // 關閉頁面
      await page1.close();
      await page2.close();
    }
  });

  // 測試：登出 API 的重複呼叫測試
  test('應能處理重複呼叫登出 API', async ({ page, request }) => {
    const helpers = new TestHelpers(page);
    
    // 先登入
    await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    
    // 手動呼叫登出 API 多次
    const logoutCount = 3;
    
    // 使用 any 來避免類型檢查問題
    // 在實際測試中，這是可以接受的
    const responses: any[] = [];
    
    for (let i = 0; i < logoutCount; i++) {
      const response = await request.post('/api/logout');
      responses.push({
        status: response.status(),
        ok: response.ok(),
      });
    }
    
    // 檢查第一次呼叫應該成功
    expect(responses[0].ok).toBeTruthy();
    
    // 後續呼叫可能失敗（取決於實現），但不應導致錯誤
    // 檢查頁面是否仍然正常（未崩潰）
    await expect(page).toHaveURL(/\/login/);
    
    // 嘗試再次登入以確認系統仍然正常運作
    await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    // 確認頁面已跳轉
    await expect(page).not.toHaveURL(/\/login/);
  });

  // 測試：在不同頁面上快速多次點擊登出
  test('快速多次點擊登出按鈕不應導致錯誤', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // 先登入
    await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    
    // 跳轉到某頁面
    await helpers.navigateTo('/settings');
    
    // 點擊頭像打開下拉菜單
    await page.click('header button:has(.avatar), header .avatar');
    
    // 等待下拉菜單顯示
    await page.waitForSelector('text=登出, text=Logout', { timeout: 5000 });
    
    // 快速連續點擊登出按鈕多次
    // 這裡使用 evaluate 來模擬連續快速點擊
    await page.evaluate(() => {
      const logoutElement = document.querySelector('li:has-text("登出"), li:has-text("Logout")');
      if (logoutElement) {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            (logoutElement as HTMLElement).click();
          }, i * 50); // 每次點擊間隔50毫秒
        }
      }
    });
    
    // 驗證是否成功跳轉到登入頁面
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    
    // 嘗試再次登入，確認應用未因多次登出請求而損壞
    await helpers.login(TEST_EMAIL, TEST_PASSWORD);
    await expect(page).not.toHaveURL(/\/login/);
  });
});