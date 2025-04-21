import { ReactNode } from "react";
import { OAuthProvider, OAUTH_PROVIDERS } from "@/lib/supabase";

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
        <div className="text-sm text-gray-500">{displayName || username || "未連結"}</div>
      </div>
      {isOnline && (
        <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
          線上中
        </div>
      )}
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
