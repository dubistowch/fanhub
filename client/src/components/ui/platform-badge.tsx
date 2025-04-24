import { ReactNode } from "react";
import { OAuthProvider, OAUTH_PROVIDERS } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

interface PlatformBadgeProps {
  provider: OAuthProvider;
  username?: string;
  displayName?: string;
  isOnline?: boolean;
  onClick?: () => void;
  action?: ReactNode;
}

const PlatformBadge = ({
  provider,
  username,
  displayName,
  isOnline,
  onClick,
  action,
}: PlatformBadgeProps) => {
  const providerConfig = OAUTH_PROVIDERS[provider];
  const { t } = useTranslation();
  
  // 輸出調試信息
  console.log(`PlatformBadge: ${provider}`, { 
    username, 
    displayName, 
    isConnected: !!username,
    hasClickHandler: !!onClick,
    isActionElement: !!action
  });
  
  // 檢查是否有可能的數據格式問題
  if (username === undefined && displayName) {
    console.warn(`PlatformBadge: ${provider} - Missing username but has displayName, possible data format issue`);
  }
  
  return (
    <div 
      className="platform-badge flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`w-10 h-10 rounded-full ${providerConfig.color} flex items-center justify-center text-white`}>
        <i className={providerConfig.icon}></i>
      </div>
      <div className="ml-3 flex-grow">
        <div className="font-medium">{providerConfig.name}</div>
        <div className="text-sm text-gray-500">{displayName || username || t('profile.connected.notLinked')}</div>
      </div>
      {action && action}
      {!action && !isOnline && (
        <div className="text-accent">
          <i className="fas fa-external-link-alt"></i>
        </div>
      )}
    </div>
  );
};

export default PlatformBadge;
