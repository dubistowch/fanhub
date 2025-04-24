import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 載入翻譯檔案
import en from '../locales/en.json';
import zhTW from '../locales/zh-TW.json';
import zhCN from '../locales/zh-CN.json';
import ja from '../locales/ja.json';

// 初始化 i18next
i18n
  .use(LanguageDetector)  // 用於自動檢測用戶的瀏覽器語言
  .use(initReactI18next)  // 將 i18n 實例傳遞給 react-i18next
  .init({
    resources: {
      en: { translation: en },
      'zh-TW': { translation: zhTW },
      'zh-CN': { translation: zhCN },
      ja: { translation: ja }
    },
    fallbackLng: 'en',     // 若沒有找到用戶語言的翻譯，使用英文作為備用
    debug: false,          // 生產環境禁用 debug
    
    interpolation: {
      escapeValue: false,  // React 已經安全地處理輸出，不需要額外的 HTML 轉義
    },
    
    detection: {
      order: ['localStorage', 'navigator'],  // 首先從 localStorage 檢測，其次從瀏覽器設置檢測
      lookupLocalStorage: 'i18nextLng',      // localStorage 中存儲語言偏好的鍵名
      caches: ['localStorage'],              // 將檢測到的語言保存到 localStorage
    }
  });

// 導出 i18n 實例
export default i18n;