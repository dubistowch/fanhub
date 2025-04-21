import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { OAuthProvider, OAUTH_PROVIDERS } from "@/lib/supabase";
import { signInWithOAuth } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

interface UserPlatformStatusProps {
  userId: number;
}

const UserPlatformStatus = ({ userId }: UserPlatformStatusProps) => {
  const { user } = useAuth();

  // Fetch user providers
  const { data: providers = [] } = useQuery({
    queryKey: ["/api/users", userId, "providers"],
    enabled: !!userId,
  });

  // Helper to check if the user has connected a specific platform
  const isPlatformConnected = (provider: OAuthProvider) => {
    return providers.some(p => p.provider === provider);
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
      <h3 className="font-semibold text-lg mb-4">你的綁定狀態</h3>
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
                  已綁定
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-medium"
                  onClick={() => handleConnectPlatform(providerKey)}
                >
                  綁定帳號
                </Button>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
        <p>綁定更多平台帳號可以讓創作者更容易辨認你的支持！</p>
      </div>
    </div>
  );
};

export default UserPlatformStatus;
