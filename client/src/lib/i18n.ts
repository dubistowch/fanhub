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
            search: "Search",
            pageNotFound: "404 Page Not Found",
            pageNotFoundMsg: "The page you are looking for does not exist.",
            allRightsReserved: "All rights reserved."
          },
          footer: {
            description: "Connect fan identities across platforms, establishing exclusive connections between creators and fans.",
            services: "Services",
            creatorPages: "Creator Pages",
            platformBinding: "Multi-platform Binding",
            checkinSystem: "Check-in System",
            dataAnalysis: "Data Analysis",
            creatorResources: "Creator Resources",
            creatorGuide: "Creator Guide",
            communityManagement: "Community Management",
            dataInterpretation: "Data Interpretation",
            successStories: "Success Stories",
            aboutUs: "About Us",
            aboutFanHub: "About FanHub",
            privacyPolicy: "Privacy Policy",
            termsOfUse: "Terms of Use",
            contactUs: "Contact Us"
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
              checkins: "Check-ins",
              dateFormat: {
                today: "Today",
                yesterday: "Yesterday",
                dayBeforeYesterday: "Day before yesterday",
                daysAgo: "{{days}} days ago",
                monthDay: "MM/dd",
                invalidDate: "Invalid date",
                noDate: "No date",
                dateError: "Date error"
              }
            },
            stats: {
              today: "Today's Check-ins",
              yesterday: "Yesterday's Check-ins",
              highest: "Highest Record"
            },
            userStreaks: {
              title: "Check-in Streaks",
              description: "Your check-in streak records",
              detailedDescription: "Your continuous check-in records with creators",
              noStreaks: "No check-in records yet. Start checking in to build your streaks!",
              creatorLabel: "Creator",
              days: "days"
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
          },
          profile: {
            platforms: {
              title: "Your Binding Status",
              bound: "Bound",
              bindAccount: "Bind Account",
              tip: "Binding more platform accounts makes it easier for creators to recognize your support!"
            },
            connected: {
              title: "Connected Platforms",
              connecting: "Connecting...",
              linkSuccess: "Link Successful",
              linkSuccessDetail: "Successfully linked {{provider}} account",
              linkFailed: "Link Failed",
              linkFailedDetail: "Unable to link platform account, please try again later",
              linkFailedProviderDetail: "Unable to link {{provider}} account, please try again later",
              platform: "platform",
              tip: "Binding more platform accounts makes it easier for creators to recognize your support!"
            }
          },
          creator: {
            profile: {
              title: "Creator Profile",
              bio: "Creator Bio",
              bioDescription: "Learn more about the creator",
              notFound: "Creator Not Found",
              notFoundDesc: "The creator may not exist or has been deleted",
              loading: "Loading...",
              followers: "followers",
              followersCount: "{{count}} followers",
              emptyBio: "This creator is lazy and hasn't written a bio yet..."
            },
            follow: {
              follow: "Follow",
              following: "Following",
              followingInProgress: "Following...",
              unfollowingInProgress: "Unfollowing...",
              loginRequired: "Login Required",
              loginRequiredDesc: "Please login to follow creators",
              followSuccess: "Followed",
              followSuccessDesc: "You are now following {{name}}",
              unfollowSuccess: "Unfollowed",
              unfollowSuccessDesc: "You have unfollowed {{name}}",
              followFailed: "Failed to Follow",
              unfollowFailed: "Failed to Unfollow"
            },
            tabs: {
              about: "About",
              stats: "Check-in Stats"
            },
            checkin: {
              success: "Check-in Success",
              successDesc: "You have checked in for {{streak}} consecutive days"
            }
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
            search: "搜尋",
            pageNotFound: "404 頁面未找到",
            pageNotFoundMsg: "您所查找的頁面不存在。",
            allRightsReserved: "版權所有。"
          },
          footer: {
            description: "打通粉絲在各大平台的身分，建立創作者與粉絲的專屬連結。",
            services: "服務",
            creatorPages: "創作者專頁",
            platformBinding: "多平台綁定",
            checkinSystem: "簽到系統",
            dataAnalysis: "數據分析",
            creatorResources: "創作者資源",
            creatorGuide: "創作者指南",
            communityManagement: "社群經營",
            dataInterpretation: "數據解讀",
            successStories: "成功案例",
            aboutUs: "關於我們",
            aboutFanHub: "關於 FanHub",
            privacyPolicy: "隱私政策",
            termsOfUse: "使用條款",
            contactUs: "聯絡我們"
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
              checkins: "簽到次數",
              dateFormat: {
                today: "今天",
                yesterday: "昨天",
                dayBeforeYesterday: "前天",
                daysAgo: "{{days}}天前",
                monthDay: "MM月dd日",
                invalidDate: "無效日期",
                noDate: "無日期",
                dateError: "日期錯誤"
              }
            },
            stats: {
              today: "今日簽到",
              yesterday: "昨日簽到",
              highest: "歷史最高"
            },
            userStreaks: {
              title: "簽到連續記錄",
              description: "您的簽到連續記錄",
              detailedDescription: "您在各個創作者的簽到連續記錄",
              noStreaks: "暫無簽到記錄，開始簽到獲取連續記錄吧！",
              creatorLabel: "創作者",
              days: "天"
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
          },
          profile: {
            platforms: {
              title: "你的綁定狀態",
              bound: "已綁定",
              bindAccount: "綁定帳號",
              tip: "綁定更多平台帳號可以讓創作者更容易辨認你的支持！"
            },
            connected: {
              title: "連結平台",
              connecting: "連結中...",
              linkSuccess: "連結成功",
              linkSuccessDetail: "已成功連結 {{provider}} 帳號",
              linkFailed: "連結失敗",
              linkFailedDetail: "無法連結平台帳號，請稍後再試",
              linkFailedProviderDetail: "無法連結 {{provider}} 帳號，請稍後再試",
              platform: "平台",
              tip: "綁定更多平台帳號可以讓創作者更容易辨認你的支持！"
            }
          },
          creator: {
            profile: {
              title: "創作者檔案",
              bio: "創作者簡介",
              bioDescription: "了解更多關於創作者的信息",
              notFound: "找不到創作者",
              notFoundDesc: "創作者可能不存在或已被刪除",
              loading: "載入中...",
              followers: "位粉絲",
              followersCount: "{{count}} 位粉絲",
              emptyBio: "這個創作者很懶，還沒有填寫簡介..."
            },
            follow: {
              follow: "關注",
              following: "已關注",
              followingInProgress: "關注中...",
              unfollowingInProgress: "取消關注中...",
              loginRequired: "需要登入",
              loginRequiredDesc: "請先登入才能關注創作者",
              followSuccess: "已關注",
              followSuccessDesc: "你現在已經關注了 {{name}}",
              unfollowSuccess: "已取消關注",
              unfollowSuccessDesc: "你已經取消關注 {{name}}",
              followFailed: "關注失敗",
              unfollowFailed: "取消關注失敗"
            },
            tabs: {
              about: "關於",
              stats: "簽到統計"
            },
            checkin: {
              success: "簽到成功",
              successDesc: "你已連續簽到 {{streak}} 天"
            }
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
            search: "搜索",
            pageNotFound: "404 页面未找到",
            pageNotFoundMsg: "您所查找的页面不存在。",
            allRightsReserved: "版权所有。"
          },
          footer: {
            description: "打通粉丝在各大平台的身份，建立创作者与粉丝的专属连接。",
            services: "服务",
            creatorPages: "创作者专页",
            platformBinding: "多平台绑定",
            checkinSystem: "签到系统",
            dataAnalysis: "数据分析",
            creatorResources: "创作者资源",
            creatorGuide: "创作者指南",
            communityManagement: "社群运营",
            dataInterpretation: "数据解读",
            successStories: "成功案例",
            aboutUs: "关于我们",
            aboutFanHub: "关于 FanHub",
            privacyPolicy: "隐私政策",
            termsOfUse: "使用条款",
            contactUs: "联系我们"
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
              checkins: "签到次数",
              dateFormat: {
                today: "今天",
                yesterday: "昨天",
                dayBeforeYesterday: "前天",
                daysAgo: "{{days}}天前",
                monthDay: "MM月dd日",
                invalidDate: "无效日期",
                noDate: "无日期",
                dateError: "日期错误"
              }
            },
            stats: {
              today: "今日签到",
              yesterday: "昨日签到",
              highest: "历史最高"
            },
            userStreaks: {
              title: "签到连续记录",
              description: "您的签到连续记录",
              detailedDescription: "您在各个创作者的签到连续记录",
              noStreaks: "暂无签到记录，开始签到获取连续记录吧！",
              creatorLabel: "创作者",
              days: "天"
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
          },
          profile: {
            platforms: {
              title: "你的绑定状态",
              bound: "已绑定",
              bindAccount: "绑定账号",
              tip: "绑定更多平台账号可以让创作者更容易辨认你的支持！"
            },
            connected: {
              title: "连接平台",
              connecting: "连接中...",
              linkSuccess: "连接成功",
              linkSuccessDetail: "已成功连接 {{provider}} 账号",
              linkFailed: "连接失败",
              linkFailedDetail: "无法连接平台账号，请稍后再试",
              linkFailedProviderDetail: "无法连接 {{provider}} 账号，请稍后再试",
              platform: "平台",
              tip: "绑定更多平台账号可以让创作者更容易辨认你的支持！"
            }
          },
          creator: {
            profile: {
              title: "创作者档案",
              bio: "创作者简介",
              bioDescription: "了解更多关于创作者的信息",
              notFound: "找不到创作者",
              notFoundDesc: "创作者可能不存在或已被删除",
              loading: "加载中...",
              followers: "位粉丝",
              followersCount: "{{count}} 位粉丝",
              emptyBio: "这个创作者很懒，还没有填写简介..."
            },
            follow: {
              follow: "关注",
              following: "已关注",
              followingInProgress: "关注中...",
              unfollowingInProgress: "取消关注中...",
              loginRequired: "需要登录",
              loginRequiredDesc: "请先登录才能关注创作者",
              followSuccess: "已关注",
              followSuccessDesc: "你现在已经关注了 {{name}}",
              unfollowSuccess: "已取消关注",
              unfollowSuccessDesc: "你已经取消关注 {{name}}",
              followFailed: "关注失败",
              unfollowFailed: "取消关注失败"
            },
            tabs: {
              about: "关于",
              stats: "签到统计"
            },
            checkin: {
              success: "签到成功",
              successDesc: "你已连续签到 {{streak}} 天"
            }
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
            search: "検索",
            pageNotFound: "404 ページが見つかりません",
            pageNotFoundMsg: "お探しのページは存在しません。",
            allRightsReserved: "全著作権所有。"
          },
          footer: {
            description: "ファンの各プラットフォーム上のアイデンティティを連携し、クリエイターとファンの専用の繋がりを構築します。",
            services: "サービス",
            creatorPages: "クリエイターページ",
            platformBinding: "マルチプラットフォーム連携",
            checkinSystem: "チェックインシステム",
            dataAnalysis: "データ分析",
            creatorResources: "クリエイターリソース",
            creatorGuide: "クリエイターガイド",
            communityManagement: "コミュニティ運営",
            dataInterpretation: "データ解釈",
            successStories: "成功事例",
            aboutUs: "会社概要",
            aboutFanHub: "FanHubについて",
            privacyPolicy: "プライバシーポリシー",
            termsOfUse: "利用規約",
            contactUs: "お問い合わせ"
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
              checkins: "チェックイン数",
              dateFormat: {
                today: "今日",
                yesterday: "昨日",
                dayBeforeYesterday: "一昨日",
                daysAgo: "{{days}}日前",
                monthDay: "MM月dd日",
                invalidDate: "無効な日付",
                noDate: "日付なし",
                dateError: "日付エラー"
              }
            },
            stats: {
              today: "今日のチェックイン",
              yesterday: "昨日のチェックイン",
              highest: "過去最高"
            },
            userStreaks: {
              title: "チェックイン連続記録",
              description: "あなたのチェックイン連続記録",
              detailedDescription: "クリエイターごとの連続チェックイン記録",
              noStreaks: "チェックイン記録はまだありません。チェックインを始めて連続記録を作りましょう！",
              creatorLabel: "クリエイター",
              days: "日"
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
          },
          profile: {
            platforms: {
              title: "連携状況",
              bound: "連携済み",
              bindAccount: "アカウント連携",
              tip: "より多くのプラットフォームアカウントを連携すると、クリエイターがあなたのサポートを認識しやすくなります！"
            },
            connected: {
              title: "連携プラットフォーム",
              connecting: "連携中...",
              linkSuccess: "連携成功",
              linkSuccessDetail: "{{provider}} アカウントの連携に成功しました",
              linkFailed: "連携失敗",
              linkFailedDetail: "プラットフォームアカウントを連携できません。後でもう一度お試しください",
              linkFailedProviderDetail: "{{provider}} アカウントを連携できません。後でもう一度お試しください",
              platform: "プラットフォーム",
              tip: "より多くのプラットフォームアカウントを連携すると、クリエイターがあなたのサポートを認識しやすくなります！"
            }
          },
          creator: {
            profile: {
              title: "クリエイタープロフィール",
              bio: "クリエイター紹介",
              bioDescription: "クリエイターについてもっと知る",
              notFound: "クリエイターが見つかりません",
              notFoundDesc: "クリエイターが存在しないか、削除された可能性があります",
              loading: "読み込み中...",
              followers: "フォロワー",
              followersCount: "{{count}} フォロワー",
              emptyBio: "このクリエイターはまだ自己紹介を書いていません..."
            },
            follow: {
              follow: "フォロー",
              following: "フォロー中",
              followingInProgress: "フォロー処理中...",
              unfollowingInProgress: "フォロー解除中...",
              loginRequired: "ログインが必要です",
              loginRequiredDesc: "クリエイターをフォローするにはログインしてください",
              followSuccess: "フォローしました",
              followSuccessDesc: "{{name}} をフォローしました",
              unfollowSuccess: "フォロー解除しました",
              unfollowSuccessDesc: "{{name}} のフォローを解除しました",
              followFailed: "フォロー失敗",
              unfollowFailed: "フォロー解除失敗"
            },
            tabs: {
              about: "概要",
              stats: "チェックイン統計"
            },
            checkin: {
              success: "チェックイン成功",
              successDesc: "{{streak}} 日連続でチェックインしました"
            }
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