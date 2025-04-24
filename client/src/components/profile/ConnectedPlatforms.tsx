import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PlatformBadge from "@/components/ui/platform-badge";
import { OAuthProvider, OAUTH_PROVIDERS } from "@/lib/supabase";
import { signInWithOAuth } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConnectedPlatformsProps {
  userId: number;
  isOwnProfile?: boolean;
}

const ConnectedPlatforms = ({ userId, isOwnProfile = false }: ConnectedPlatformsProps) => {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [isLinking, setIsLinking] = useState<OAuthProvider | null>(null);
  const { t } = useTranslation();

  // 兩種獲取平台提供商數據的方式，確保我們能夠捕獲數據
  
  // 1. 從用戶詳細信息中獲取 providers
  const { data: userData } = useQuery<{ providers?: Array<{ provider: string, providerUsername?: string }> }>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });
  
  // 2. 直接獲取用戶的提供商列表（單獨端點）
  const { data: directProviders = [] } = useQuery<Array<{ provider: string, providerUsername?: string }>>({
    queryKey: ["/api/users", userId, "providers"],
    enabled: !!userId,
  });
  
  // 合併兩個來源的提供商信息，優先使用直接獲取的提供商
  const userProviders = userData?.providers || [];
  const allProviders = [...directProviders];
  const mergedProviders = allProviders.length > 0 ? allProviders : userProviders;
  
  // 最終要顯示的提供商列表
  const providers = mergedProviders;
  
  // 增強型調試信息 
  useEffect(() => {
    console.log("ConnectedPlatforms: User ID:", userId);
    console.log("ConnectedPlatforms: Full User Data:", userData);
    console.log("ConnectedPlatforms: Direct Providers API Data:", directProviders);
    console.log("ConnectedPlatforms: User Providers:", userProviders);
    console.log("ConnectedPlatforms: Merged Providers:", providers);
    
    // 檢查是否有用戶，但平台資訊為空
    if (userData && (!providers || providers.length === 0)) {
      console.warn("ConnectedPlatforms: User exists but no providers found - this might indicate a sync issue between Supabase and database");
      console.warn("ConnectedPlatforms: Please check if providers are being correctly saved to database");
    }
    
    // 簡化輸出目前的連接狀態
    console.table({
      "Discord 連接狀態": providers.some(p => p.provider === 'discord') ? "已連接" : "未連接",
      "Twitch 連接狀態": providers.some(p => p.provider === 'twitch') ? "已連接" : "未連接",
      "Twitter 連接狀態": providers.some(p => p.provider === 'twitter') ? "已連接" : "未連接",
    });
  }, [userId, userData, providers, directProviders, userProviders]);

  // Handle OAuth flow
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        try {
          // Extract the provider from the state if available
          const params = new URLSearchParams(hash.substring(1));
          const state = params.get("state");
          let provider: OAuthProvider | null = null;
          
          if (state) {
            try {
              const stateObj = JSON.parse(atob(state));
              provider = stateObj.provider;
            } catch (e) {
              console.error("Error parsing OAuth state:", e);
            }
          }
          
          toast({
            title: t('profile.connected.linkSuccess'),
            description: t('profile.connected.linkSuccessDetail', { 
              provider: provider ? OAUTH_PROVIDERS[provider].name : t('profile.connected.platform') 
            }),
          });
          
          // Refresh user data to get the new provider
          await refreshUser();
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error("Error handling OAuth callback:", error);
          toast({
            title: t('profile.connected.linkFailed'),
            description: t('profile.connected.linkFailedDetail'),
            variant: "destructive",
          });
        } finally {
          setIsLinking(null);
        }
      }
    };

    handleOAuthCallback();
  }, [toast, refreshUser, t]);

  const handleConnectPlatform = async (provider: OAuthProvider) => {
    try {
      setIsLinking(provider);
      await signInWithOAuth(provider);
    } catch (error) {
      console.error(`Error connecting ${provider}:`, error);
      toast({
        title: t('profile.connected.linkFailed'),
        description: t('profile.connected.linkFailedProviderDetail', {
          provider: OAUTH_PROVIDERS[provider].name
        }),
        variant: "destructive",
      });
      setIsLinking(null);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="font-semibold text-lg mb-4">{t('profile.connected.title')}</h3>
      <div className="space-y-3">
        {Object.keys(OAUTH_PROVIDERS)
          .filter(provider => provider !== 'google') // Exclude Google from bindable platforms
          .map((provider) => {
          const providerKey = provider as OAuthProvider;
          const connectedProvider = providers.find(p => p.provider === providerKey);
          
          return (
            <PlatformBadge
              key={providerKey}
              provider={providerKey}
              username={connectedProvider?.providerUsername}
              displayName={connectedProvider?.providerUsername}
              isOnline={providerKey === "twitch" && Math.random() > 0.7} // Simulating online status
              onClick={isOwnProfile && !connectedProvider ? () => handleConnectPlatform(providerKey) : undefined}
              action={
                isOwnProfile && !connectedProvider ? (
                  <div className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                    {isLinking === providerKey ? t('profile.connected.connecting') : t('profile.platforms.bindAccount')}
                  </div>
                ) : (
                  <ExternalLink className="h-4 w-4 text-accent" />
                )
              }
            />
          );
        })}
      </div>
      
      {isOwnProfile && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
          <p>{t('profile.connected.tip')}</p>
        </div>
      )}
    </div>
  );
};

export default ConnectedPlatforms;
