import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PlatformBadge from "@/components/ui/platform-badge";
import { OAuthProvider, OAUTH_PROVIDERS } from "@/lib/supabase";
import { signInWithOAuth } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink } from "lucide-react";

interface ConnectedPlatformsProps {
  userId: number;
  isOwnProfile?: boolean;
}

const ConnectedPlatforms = ({ userId, isOwnProfile = false }: ConnectedPlatformsProps) => {
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [isLinking, setIsLinking] = useState<OAuthProvider | null>(null);

  // Fetch user providers
  const { data: providers = [] } = useQuery({
    queryKey: ["/api/users", userId, "providers"],
    enabled: !!userId,
  });

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
            title: "連結成功",
            description: `已成功連結 ${provider ? OAUTH_PROVIDERS[provider].name : "平台"} 帳號`,
          });
          
          // Refresh user data to get the new provider
          await refreshUser();
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error("Error handling OAuth callback:", error);
          toast({
            title: "連結失敗",
            description: "無法連結平台帳號，請稍後再試",
            variant: "destructive",
          });
        } finally {
          setIsLinking(null);
        }
      }
    };

    handleOAuthCallback();
  }, [toast, refreshUser]);

  const handleConnectPlatform = async (provider: OAuthProvider) => {
    try {
      setIsLinking(provider);
      await signInWithOAuth(provider);
    } catch (error) {
      console.error(`Error connecting ${provider}:`, error);
      toast({
        title: "連結失敗",
        description: `無法連結 ${OAUTH_PROVIDERS[provider].name} 帳號，請稍後再試`,
        variant: "destructive",
      });
      setIsLinking(null);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="font-semibold text-lg mb-4">連結平台</h3>
      <div className="space-y-3">
        {Object.keys(OAUTH_PROVIDERS).map((provider) => {
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
                    {isLinking === providerKey ? "連結中..." : "綁定帳號"}
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
          <p>綁定更多平台帳號可以讓創作者更容易辨認你的支持！</p>
        </div>
      )}
    </div>
  );
};

export default ConnectedPlatforms;
