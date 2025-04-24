import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getCurrentUser, syncUserAfterOAuth, linkProvider } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  
  useEffect(() => {
    async function processOAuthRedirect() {
      console.log("Auth callback: Processing OAuth redirect...");
      try {
        // 获取当前的Supabase用户
        console.log("Auth callback: Getting current Supabase user");
        const supabaseUser = await getCurrentUser();
        console.log("Auth callback: Supabase user:", supabaseUser);
        
        if (!supabaseUser) {
          console.log("Auth callback: No Supabase user found");
          setError(t("auth.authError"));
          setProcessing(false);
          return;
        }
        
        // 获取提供商信息
        console.log("Auth callback: Getting provider info from user metadata:", supabaseUser.app_metadata);
        const provider = supabaseUser.app_metadata?.provider;
        
        // 增加更多日志检查身份数据
        console.log("Auth callback: User identities:", supabaseUser.identities);
        console.log("Auth callback: All providers:", supabaseUser.app_metadata?.providers);
        
        if (!provider) {
          console.error("Auth callback: Failed to get provider information. Metadata:", supabaseUser.app_metadata);
          setError(t("auth.providerError"));
          setProcessing(false);
          return;
        }
        
        // 将Supabase用户同步到我们的数据库
        console.log("Auth callback: Syncing user with database");
        try {
          const dbUser = await syncUserAfterOAuth(supabaseUser);
          console.log("Auth callback: DB user after sync:", dbUser);
          
          // 链接提供商账号
          console.log("Auth callback: Linking provider account");
          
          // 提取不同平台特定的用户名和头像信息
          let username = '';
          let avatar = '';
          
          // 根据不同平台提取正确的信息
          if (provider === 'discord') {
            username = supabaseUser.user_metadata?.name || 
                    supabaseUser.user_metadata?.full_name || 
                    supabaseUser.user_metadata?.preferred_username || 
                    supabaseUser.user_metadata?.custom_claims?.global_name;
            avatar = supabaseUser.user_metadata?.avatar_url;
          } else if (provider === 'twitter') {
            username = supabaseUser.user_metadata?.preferred_username || 
                    supabaseUser.user_metadata?.name || 
                    supabaseUser.user_metadata?.full_name;
            avatar = supabaseUser.user_metadata?.avatar_url;
          } else if (provider === 'twitch') {
            username = supabaseUser.user_metadata?.preferred_username || 
                    supabaseUser.user_metadata?.name || 
                    supabaseUser.user_metadata?.full_name;
            avatar = supabaseUser.user_metadata?.avatar_url;
          } else {
            username = supabaseUser.user_metadata?.name || 
                    supabaseUser.user_metadata?.full_name || 
                    supabaseUser.user_metadata?.preferred_username;
            avatar = supabaseUser.user_metadata?.avatar_url;
          }
          
          const providerData = {
            provider,
            id: supabaseUser.id,
            username,
            avatar,
            access_token: supabaseUser.user_metadata?.access_token || "",
            refresh_token: supabaseUser.user_metadata?.refresh_token || "",
          };
          
          console.log("Auth callback: Provider data:", providerData);
          console.log("Auth callback: Complete metadata:", supabaseUser.user_metadata);
          
          try {
            const linkedProvider = await linkProvider(dbUser.id, providerData);
            console.log("Auth callback: Provider linked:", linkedProvider);
          } catch (linkError) {
            console.warn("Auth callback: Provider may already be linked:", linkError);
            // 已链接的提供商不影响登录流程
          }
          
          // 刷新用户信息
          console.log("Auth callback: Refreshing user info");
          await refreshUser();
          
          // 显示成功消息
          toast({
            title: t("auth.loginSuccess"),
            description: `${t("auth.welcomeBack")}，${dbUser.username}！`,
          });
          
          // 重定向到主页
          console.log("Auth callback: Redirecting to home page");
          setLocation("/");
        } catch (syncError) {
          console.error("Auth callback: Error syncing user:", syncError);
          setError(t("auth.syncError") + ": " + (syncError as Error).message);
          setProcessing(false);
          return;
        }
      } catch (err) {
        console.error("Error in OAuth callback:", err);
        setError((err as Error).message || t("auth.unknownError"));
        setProcessing(false);
        
        toast({
          title: t("auth.loginFailed"),
          description: (err as Error).message || t("auth.authError"),
          variant: "destructive",
        });
      }
    }
    
    processOAuthRedirect();
  }, []);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 p-4 rounded-lg mb-4">
          <h1 className="text-xl font-bold text-destructive mb-2">{t("auth.authError")}</h1>
          <p className="text-sm text-destructive-foreground">{error}</p>
        </div>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => setLocation("/login")}
        >
          {t("auth.backToLogin")}
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <p className="text-lg">{t("auth.completingAuth")}</p>
    </div>
  );
}