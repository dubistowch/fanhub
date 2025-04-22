import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 語言資源文件
import translationEN from '../locales/en.json';
import translationZH_TW from '../locales/zh-TW.json';
import translationZH_CN from '../locales/zh-CN.json';
import translationJA from '../locales/ja.json';

// 語言資源
const resources = {
  en: {
    translation: translationEN
  },
  'zh-TW': {
    translation: translationZH_TW
  },
  'zh-CN': {
    translation: translationZH_CN
  },
  ja: {
    translation: translationJA
  }
};

// 初始化 i18next
i18n
  .use(LanguageDetector)  // 用於自動檢測用戶的瀏覽器語言
  .use(initReactI18next)  // 將 i18n 實例傳遞給 react-i18next
  .init({
    resources,
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