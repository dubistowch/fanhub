# E2E 測試指南

本文檔說明如何使用 Playwright 運行端到端 (E2E) 測試，特別是針對認證和登出功能進行測試。

## 先決條件

確保已安裝以下依賴：
- @playwright/test
- playwright
- dotenv

## 測試環境設置

1. 確保 `.env.test` 文件中包含正確的測試用戶憑據：
   ```
   TEST_USER_EMAIL=your_test_email@example.com
   TEST_USER_PASSWORD=your_test_password
   ```

## 運行測試

使用提供的 `run-tests.sh` 腳本運行測試：

### 運行所有測試

```bash
./run-tests.sh
```

### 只運行認證測試

```bash
./run-tests.sh auth
```

### 只運行設定頁面測試

```bash
./run-tests.sh settings
```

### 運行登出功能壓力測試

```bash
./run-tests.sh stress
```

### 使用 UI 模式運行測試（視覺化測試）

```bash
./run-tests.sh ui
```

### 使用調試模式運行測試

```bash
./run-tests.sh debug
```

## 測試說明

### 認證測試 (auth.spec.ts)

測試登入、登出和會話保持功能：
- 基本登入功能
- 登入後的登出功能
- 多次登出請求的處理
- 頁面重新加載後的登入狀態保持
- 在不同頁面間導航後的登出功能

### 設定頁面測試 (settings.spec.ts)

測試設定頁面和語言切換功能：
- 存取設定頁面
- 語言切換功能
- 語言設定的持久化
- 語言設定對整個應用的影響

### 登出功能壓力測試 (logout-stress.spec.ts)

專門針對登出功能可能出現的問題進行壓力測試：
- 在多次快速連續導航後的登出功能
- 頻繁的登入/登出循環
- 在多個頁面打開的情況下登出
- 登出 API 的重複呼叫測試
- 快速多次點擊登出按鈕的測試

## 測試報告

測試完成後，可以在 `playwright-report` 目錄中查看詳細的測試報告：

```bash
npx playwright show-report
```

## 常見問題排解

1. **瀏覽器啟動失敗**
   確保已安裝 Playwright 瀏覽器：
   ```bash
   npx playwright install --with-deps
   ```

2. **測試超時**
   如果測試超時，可能需要增加 `playwright.config.ts` 中的超時設置。

3. **選擇器未找到**
   如果測試失敗是因為無法找到元素，可能需要更新測試選擇器以匹配最新的 UI 變化。

4. **登入失敗**
   確保 `.env.test` 文件中的測試用戶憑據正確。