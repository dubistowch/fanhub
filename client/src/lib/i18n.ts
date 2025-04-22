import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 初始化 i18next
i18n
  .use(LanguageDetector)  // 用於自動檢測用戶的瀏覽器語言
  .use(initReactI18next)  // 將 i18n 實例傳遞給 react-i18next
  .init({
    resources: {
      en: {
        translation: {
          common: {
            login: "Login",
            register: "Register",
            logout: "Logout",
            profile: "Profile",
            dashboard: "Dashboard",
            home: "Home",
            discover: "Discover",
            following: "Following",
            search: "Search"
          },
          settings: {
            language: "Language"
          },
          languages: {
            en: "English",
            "zh-TW": "Traditional Chinese",
            "zh-CN": "Simplified Chinese",
            ja: "Japanese"
          }
        }
      },
      'zh-TW': {
        translation: {
          common: {
            login: "登入",
            register: "註冊",
            logout: "登出",
            profile: "個人資料",
            dashboard: "控制面板",
            home: "首頁",
            discover: "探索",
            following: "追蹤中",
            search: "搜尋"
          },
          settings: {
            language: "語言"
          },
          languages: {
            en: "英文",
            "zh-TW": "繁體中文",
            "zh-CN": "簡體中文",
            ja: "日文"
          }
        }
      },
      'zh-CN': {
        translation: {
          common: {
            login: "登录",
            register: "注册",
            logout: "退出",
            profile: "个人资料",
            dashboard: "控制面板",
            home: "首页",
            discover: "发现",
            following: "关注中",
            search: "搜索"
          },
          settings: {
            language: "语言"
          },
          languages: {
            en: "英文",
            "zh-TW": "繁体中文",
            "zh-CN": "简体中文",
            ja: "日文"
          }
        }
      },
      ja: {
        translation: {
          common: {
            login: "ログイン",
            register: "登録",
            logout: "ログアウト",
            profile: "プロフィール",
            dashboard: "ダッシュボード",
            home: "ホーム",
            discover: "発見",
            following: "フォロー中",
            search: "検索"
          },
          settings: {
            language: "言語"
          },
          languages: {
            en: "英語",
            "zh-TW": "繁体中国語",
            "zh-CN": "簡体中国語",
            ja: "日本語"
          }
        }
      }
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