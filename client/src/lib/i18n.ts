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
            language: "Language",
            title: "Settings",
            languageDescription: "Change the language used throughout the application",
            selectLanguage: "Select language",
            selectLanguagePlaceholder: "Select a language"
          },
          auth: {
            loginSuccess: "Login successful",
            welcomeBack: "Welcome back",
            completingAuth: "Completing authentication",
            loading: "Loading...",
            authError: "Authentication error",
            loginFailed: "Login failed",
            pleaseLogin: "Please login",
            providerError: "Failed to get provider information",
            syncError: "Failed to sync user data",
            backToLogin: "Back to login",
            unknownError: "An unknown error occurred"
          },
          dashboard: {
            checkinStats: {
              title: "Check-in Statistics",
              description: "View fan check-in data and history",
              calendar: "Check-in Calendar",
              trend: "Check-in Trend",
              details: "Detailed Records",
              loginRequired: "Please login to check in",
              loading: "Loading...",
              noData: "No check-in data available",
              recentUsers: "Recent Check-in Users",
              noRecords: "No check-in records",
              checkins: "Check-ins"
            },
            stats: {
              today: "Today's Check-ins",
              yesterday: "Yesterday's Check-ins",
              highest: "Highest Record"
            }
          },
          languages: {
            en: "English",
            "zh-TW": "Traditional Chinese",
            "zh-CN": "Simplified Chinese",
            ja: "Japanese"
          },
          login: {
            welcome: "Welcome to FanHub",
            description: "Sign in with your favorite platform account to connect your creator and fan identities",
            googleLogin: "Sign in with Google",
            twitchLogin: "Sign in with Twitch",
            termsAgreement: "By signing in, you agree to our Terms of Service and Privacy Policy",
            or: "or",
            intro: "FanHub is a dedicated space for creators and fans to interact across platforms. Start exploring with Google sign-in!"
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
            language: "語言",
            title: "設定",
            languageDescription: "更改應用程式使用的語言",
            selectLanguage: "選擇語言",
            selectLanguagePlaceholder: "請選擇語言"
          },
          auth: {
            loginSuccess: "登入成功",
            welcomeBack: "歡迎回來",
            completingAuth: "正在完成認證",
            loading: "載入中...",
            authError: "認證錯誤",
            loginFailed: "登入失敗",
            pleaseLogin: "請登入",
            providerError: "無法獲取提供商信息",
            syncError: "無法同步用戶數據",
            backToLogin: "返回登入",
            unknownError: "發生未知錯誤"
          },
          dashboard: {
            checkinStats: {
              title: "簽到統計",
              description: "查看粉絲簽到數據和歷史記錄",
              calendar: "簽到日曆",
              trend: "簽到趨勢",
              details: "詳細記錄",
              loginRequired: "請登入後進行簽到",
              loading: "載入中...",
              noData: "暫無簽到統計數據",
              recentUsers: "最近簽到用戶",
              noRecords: "暫無簽到記錄",
              checkins: "簽到次數"
            },
            stats: {
              today: "今日簽到",
              yesterday: "昨日簽到",
              highest: "歷史最高"
            }
          },
          languages: {
            en: "英文",
            "zh-TW": "繁體中文",
            "zh-CN": "簡體中文",
            ja: "日文"
          },
          login: {
            welcome: "歡迎來到 FanHub",
            description: "通過您喜愛的平台帳號登入，連接您的創作者與粉絲身份",
            googleLogin: "使用 Google 帳號登入",
            twitchLogin: "使用 Twitch 帳號登入",
            termsAgreement: "登入即表示您同意我們的服務條款和隱私政策",
            or: "或者",
            intro: "FanHub 是一個創作者與粉絲跨平台互動的專屬空間，使用 Google 登入開始探索吧！"
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
            language: "语言",
            title: "设置",
            languageDescription: "更改应用程序使用的语言",
            selectLanguage: "选择语言",
            selectLanguagePlaceholder: "请选择语言"
          },
          auth: {
            loginSuccess: "登录成功",
            welcomeBack: "欢迎回来",
            completingAuth: "正在完成认证",
            loading: "加载中...",
            authError: "认证错误",
            loginFailed: "登录失败",
            pleaseLogin: "请登录",
            providerError: "无法获取提供商信息",
            syncError: "无法同步用户数据",
            backToLogin: "返回登录",
            unknownError: "发生未知错误"
          },
          dashboard: {
            checkinStats: {
              title: "签到统计",
              description: "查看粉丝签到数据和历史记录",
              calendar: "签到日历",
              trend: "签到趋势",
              details: "详细记录",
              loginRequired: "请登录后进行签到",
              loading: "加载中...",
              noData: "暂无签到统计数据",
              recentUsers: "最近签到用户",
              noRecords: "暂无签到记录",
              checkins: "签到次数"
            },
            stats: {
              today: "今日签到",
              yesterday: "昨日签到",
              highest: "历史最高"
            }
          },
          languages: {
            en: "英文",
            "zh-TW": "繁体中文",
            "zh-CN": "简体中文",
            ja: "日文"
          },
          login: {
            welcome: "欢迎来到 FanHub",
            description: "通过您喜爱的平台账号登录，连接您的创作者与粉丝身份",
            googleLogin: "使用 Google 账号登录",
            twitchLogin: "使用 Twitch 账号登录",
            termsAgreement: "登录即表示您同意我们的服务条款和隐私政策",
            or: "或者",
            intro: "FanHub 是一个创作者与粉丝跨平台互动的专属空间，使用 Google 登录开始探索吧！"
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
            language: "言語",
            title: "設定",
            languageDescription: "アプリケーションで使用する言語を変更する",
            selectLanguage: "言語を選択",
            selectLanguagePlaceholder: "言語を選択してください"
          },
          auth: {
            loginSuccess: "ログイン成功",
            welcomeBack: "おかえりなさい",
            completingAuth: "認証を完了しています",
            loading: "読み込み中...",
            authError: "認証エラー",
            loginFailed: "ログイン失敗",
            pleaseLogin: "ログインしてください",
            providerError: "プロバイダー情報の取得に失敗しました",
            syncError: "ユーザーデータの同期に失敗しました",
            backToLogin: "ログインに戻る",
            unknownError: "不明なエラーが発生しました"
          },
          dashboard: {
            checkinStats: {
              title: "チェックイン統計",
              description: "ファンのチェックインデータと履歴を表示",
              calendar: "チェックインカレンダー",
              trend: "チェックイントレンド",
              details: "詳細記録",
              loginRequired: "チェックインするにはログインしてください",
              loading: "読み込み中...",
              noData: "チェックインデータがありません",
              recentUsers: "最近のチェックインユーザー",
              noRecords: "チェックイン記録がありません",
              checkins: "チェックイン数"
            },
            stats: {
              today: "今日のチェックイン",
              yesterday: "昨日のチェックイン",
              highest: "過去最高"
            }
          },
          languages: {
            en: "英語",
            "zh-TW": "繁体中国語",
            "zh-CN": "簡体中国語",
            ja: "日本語"
          },
          login: {
            welcome: "FanHub へようこそ",
            description: "お気に入りのプラットフォームアカウントでログインし、クリエイターとファンのアイデンティティをつなげましょう",
            googleLogin: "Google アカウントでログイン",
            twitchLogin: "Twitch アカウントでログイン",
            termsAgreement: "ログインすることで、利用規約とプライバシーポリシーに同意したことになります",
            or: "または",
            intro: "FanHub はクリエイターとファンがプラットフォームを越えて交流するための専用スペースです。Google でログインして探索を始めましょう！"
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