import { Page, expect } from '@playwright/test';

/**
 * 測試助手類，用於封裝常用的測試操作
 */
export class TestHelpers {
  readonly page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 導航到應用的特定頁面
   */
  async navigateTo(path: string) {
    await this.page.goto(path);
    // 等待頁面完全載入
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 登入到應用中
   * 注意：由於這是 e2e 測試，我們需要使用一個真實的測試帳戶
   */
  async login(email: string, password: string) {
    // 先確保我們在登入頁面
    await this.navigateTo('/login');
    
    // 確保表單已完全加載
    await this.page.waitForSelector('button:has-text("Log in")');
    
    // 填寫登入表單
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    
    // 提交表單
    await this.page.click('button:has-text("Log in")');
    
    // 等待登入完成，檢查是否跳轉到首頁或控制面板
    await this.page.waitForURL(/\/(dashboard|home|discover)/, { timeout: 10000 });
    
    // 額外驗證是否看到用戶頭像或用戶名，表示登入成功
    await expect(this.page.locator('header button:has(.avatar), header .avatar')).toBeVisible({ timeout: 5000 });
    
    console.log('登入成功');
  }

  /**
   * 測試登出功能
   */
  async logout() {
    // 確保用戶已登入
    const isLoggedIn = await this.page.locator('header button:has(.avatar), header .avatar').isVisible();
    
    if (!isLoggedIn) {
      console.log('用戶尚未登入，無法登出');
      return false;
    }
    
    // 點擊頭像打開下拉菜單
    await this.page.click('header button:has(.avatar), header .avatar');
    
    // 等待下拉菜單顯示
    await this.page.waitForSelector('text=登出, text=Logout', { timeout: 5000 });
    
    // 點擊登出按鈕
    await this.page.click('text=登出, text=Logout');
    
    // 等待登出完成，可能會重定向到登入頁面
    await this.page.waitForURL(/\/login/, { timeout: 10000 });
    
    // 額外檢查確認登出成功（頭像不可見）
    await expect(this.page.locator('header button:has(.avatar), header .avatar')).not.toBeVisible({ timeout: 5000 });
    
    console.log('登出成功');
    return true;
  }

  /**
   * 切換語言
   */
  async changeLanguage(languageCode: string) {
    // 導航到設定頁面
    await this.navigateTo('/settings');
    
    // 等待語言選擇器加載
    await this.page.waitForSelector('select, [role="combobox"]', { timeout: 5000 });
    
    // 點擊語言選擇器
    await this.page.click('select, [role="combobox"]');
    
    // 選擇語言
    await this.page.click(`[data-value="${languageCode}"], text=${languageCode}`);
    
    // 等待變更應用
    await this.page.waitForTimeout(1000);
    
    console.log(`切換語言到: ${languageCode}`);
  }

  /**
   * 檢查頁面是否有特定的內容
   */
  async checkContent(selector: string, expectedText: string) {
    const element = this.page.locator(selector);
    await expect(element).toContainText(expectedText);
  }
  
  /**
   * 檢查錯誤訊息
   */
  async checkErrorMessage(expectedText: string) {
    const errorMessage = this.page.locator('[role="alert"]');
    await expect(errorMessage).toContainText(expectedText);
  }
}