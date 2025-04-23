import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { OAuthProvider, OAUTH_PROVIDERS } from "@/lib/supabase";
import { signInWithOAuth } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface UserPlatformStatusProps {
  userId: number;
}

const UserPlatformStatus = ({ userId }: UserPlatformStatusProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Fetch user providers
  const { data: providers = [] } = useQuery<Array<{ provider: string }>>({
    queryKey: ["/api/users", userId, "providers"],
    enabled: !!userId,
  });

  // Helper to check if the user has connected a specific platform
  const isPlatformConnected = (provider: OAuthProvider) => {
    return providers.some((p: { provider: string }) => p.provider === provider);
  };

  // Handle connecting a platform
  const handleConnectPlatform = async (provider: OAuthProvider) => {
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      console.error(`Error connecting ${provider}:`, error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="font-semibold text-lg mb-4">{t('profile.platforms.title')}</h3>
      <div className="space-y-4">
        {Object.keys(OAUTH_PROVIDERS).map((provider) => {
          const providerKey = provider as OAuthProvider;
          const isConnected = isPlatformConnected(providerKey);
          
          return (
            <div key={providerKey} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${OAUTH_PROVIDERS[providerKey].color} flex items-center justify-center text-white`}>
                  <i className={`${OAUTH_PROVIDERS[providerKey].icon} text-sm`}></i>
                </div>
                <span className="ml-2">{OAUTH_PROVIDERS[providerKey].name}</span>
              </div>
              
              {isConnected ? (
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                  {t('profile.platforms.bound')}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-medium"
                  onClick={() => handleConnectPlatform(providerKey)}
                >
                  {t('profile.platforms.bindAccount')}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
        <p>{t('profile.platforms.tip')}</p>
      </div>
    </div>
  );
};

export default UserPlatformStatus;
