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

  // Fetch user data including providers directly from the user object
  const { data: userData } = useQuery<{ providers?: Array<{ provider: string, providerUsername?: string }> }>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });
  
  // Extract providers from user data, falling back to empty array
  const providers = userData?.providers || [];
  
  // Debug information
  useEffect(() => {
    console.log("ConnectedPlatforms: User ID:", userId);
    console.log("ConnectedPlatforms: Full User Data:", userData);
    console.log("ConnectedPlatforms: Providers:", providers);
  }, [userId, userData, providers]);

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
